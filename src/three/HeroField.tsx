import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  THREE,
  hasWebGL,
  makeDotTexture,
  qualityTier,
  useIdleMount,
  useRenderGate,
  usePrefersReducedMotion,
  useIsCompact,
  scrollState,
  pointerState,
  PALETTE,
} from "./shared";

/* =============================================================================
   HERO FIELD — a deep 3D particle environment.
   • ~4,200 drifting points at varied depth / size / opacity (1,500 on mobile)
   • cursor (or gyroscope) repels near particles, a wider shell gently attracts
   • a sparse node graph draws hair-thin links when particles converge
   • scroll depth + scroll velocity bend the drift direction of the whole field
   • renders only while on screen, and only once per frame — no layout thrash
   ============================================================================= */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute float aAlpha;
  attribute float aTone;

  uniform float uTime;
  uniform float uScroll;
  uniform float uVel;
  uniform float uDpr;
  uniform float uSpread;
  uniform float uTan;
  uniform float uAspect;
  uniform float uSizeMul;
  uniform vec2 uPointer;
  uniform vec2 uShockCenter;
  uniform float uShockAge;
  uniform float uShockStrength;

  varying float vAlpha;
  varying float vTone;
  varying float vGlow;

  void main() {
    vec3 p = position;
    float t = uTime * (0.05 + aSeed * 0.062);
    float wob = 0.7 + aSeed * 1.5;

    p.x += sin(t + aSeed * 24.0) * wob * 1.7;
    p.y += cos(t * 1.21 + aSeed * 12.0) * wob * 1.25;
    p.z += sin(t * 0.72 + aSeed * 31.0) * wob * 2.6;

    // scroll pushes the field deeper and tilts its drift
    p.z += uScroll * 46.0;
    p.y -= uScroll * 11.0 * (0.35 + aSeed);
    p.x += uScroll * 6.0 * (aTone - 0.5);

    // scroll velocity smears the field against the direction of travel
    p.x += uVel * 9.0 * (0.35 + aSeed);
    p.y += uVel * 4.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(0.001, -mv.z);

    vec2 pw = uPointer * (depth * uTan) * vec2(uAspect, 1.0);
    vec2 d = mv.xy - pw;
    float dist = length(d);
    float repel = smoothstep(15.0, 0.0, dist);
    float shell = smoothstep(46.0, 14.0, dist) * 0.5;
    vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
    mv.xy += dir * (repel * 4.2 - shell * 1.7);

    // click shockwave — a travelling ring of displacement
    if (uShockStrength > 0.001) {
      vec2 sc = uShockCenter * (depth * uTan) * vec2(uAspect, 1.0);
      vec2 sd = mv.xy - sc;
      float sr = length(sd);
      float radius = uShockAge * 60.0;
      float ring = exp(-pow((sr - radius) / 12.0, 2.0));
      vec2 sdir = sr > 0.0001 ? sd / sr : vec2(0.0);
      mv.xy += sdir * ring * uShockStrength * 22.0;
      vGlow = max(vGlow, ring * uShockStrength);
    } else {
      vGlow = repel;
    }

    gl_Position = projectionMatrix * mv;

    float fade = smoothstep(2.0, 30.0, depth) * (1.0 - smoothstep(90.0, 235.0, depth));
    float twinkle = 0.74 + 0.26 * sin(uTime * (0.45 + aSeed * 0.9) + aSeed * 30.0);
    vAlpha = aAlpha * fade * twinkle;
    vTone = aTone;

    gl_PointSize = aSize * uSizeMul * uDpr * (320.0 / depth) * (1.0 + repel * 0.85) * uSpread;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying float vAlpha;
  varying float vTone;
  varying float vGlow;

  void main() {
    float m = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(uA, uB, smoothstep(0.1, 0.86, vTone));
    col = mix(col, uC, step(0.955, vTone));
    col += vGlow * 0.5;
    float a = m * vAlpha;
    if (a < 0.0035) discard;
    gl_FragColor = vec4(col, a);
  }
`;

export default function HeroField() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gateRef = useRef<{ paused: boolean } | null>(null);
  const ready = useIdleMount(240);
  const reduced = usePrefersReducedMotion();
  const compact = useIsCompact();
  const active = useRenderGate(hostRef);

  const { scrollYProgress } = useScroll();
  const wrapOpacity = useTransform(scrollYProgress, [0, 0.16, 0.55, 1], [1, 0.72, 0.5, 0.34]);
  const wrapScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    if (!ready || reduced || !hasWebGL()) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const q = qualityTier();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(q.dpr);
    renderer.setSize(host.clientWidth, host.clientHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, host.clientWidth / Math.max(1, host.clientHeight), 0.1, 260);
    camera.position.set(0, 0, 48);

    const world = new THREE.Group();
    scene.add(world);

    /* ------------------------------------------------------------ particles */
    const COUNT = q.particles;
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);
    const alpha = new Float32Array(COUNT);
    const tone = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.62);
      const theta = Math.random() * Math.PI * 2;
      const spreadX = 96;
      const spreadY = 58;
      pos[i * 3] = Math.cos(theta) * r * spreadX * (0.55 + Math.random() * 0.7);
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * spreadY * (0.45 + r * 0.75);
      pos[i * 3 + 2] = -Math.pow(Math.random(), 1.35) * 190 + 18;

      const luminous = Math.random() > 0.965;
      size[i] = luminous ? 2.4 + Math.random() * 2.6 : 0.5 + Math.random() * 1.35;
      seed[i] = Math.random();
      alpha[i] = (luminous ? 0.55 + Math.random() * 0.4 : 0.1 + Math.random() * 0.4) * (q.compact ? 1.25 : 1);
      tone[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute("aTone", new THREE.BufferAttribute(tone, 1));

    const dotTex = makeDotTexture();
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVel: { value: 0 },
      uDpr: { value: q.dpr },
      uSpread: { value: 1 },
      uSizeMul: { value: q.compact ? 1.25 : 1 },
      uTan: { value: Math.tan(((58 / 2) * Math.PI) / 180) },
      uAspect: { value: camera.aspect },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uShockCenter: { value: new THREE.Vector2(0, 0) },
      uShockAge: { value: 0 },
      uShockStrength: { value: 0 },
      uMap: { value: dotTex },
      uA: { value: PALETTE.gold.clone() },
      uB: { value: PALETTE.aqua.clone() },
      uC: { value: PALETTE.bone.clone() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, material);
    world.add(points);

    /* ------------------------------------------------- node graph + links */
    const NODES = q.nodes;
    const nodeBase: THREE.Vector3[] = [];
    const nodeNow: THREE.Vector3[] = [];
    const nodeMeta = Array.from({ length: NODES }, () => ({
      sx: 0.1 + Math.random() * 0.22,
      sy: 0.08 + Math.random() * 0.2,
      p: Math.random() * 100,
    }));
    for (let i = 0; i < NODES; i++) {
      const v = new THREE.Vector3(
        (Math.random() * 2 - 1) * 62,
        (Math.random() * 2 - 1) * 34,
        -Math.random() * 52 + 6
      );
      nodeBase.push(v);
      nodeNow.push(v.clone());
    }
    const nodeGeo = new THREE.BufferGeometry();
    const nodePos = new Float32Array(NODES * 3);
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    const nodeMat = new THREE.PointsMaterial({
      size: 0.72,
      map: dotTex,
      color: PALETTE.bone,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    world.add(new THREE.Points(nodeGeo, nodeMat));

    const MAXL = q.maxLines;
    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(MAXL * 6);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);
    const lineMat = new THREE.LineBasicMaterial({
      color: PALETTE.aqua,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const links = new THREE.LineSegments(lineGeo, lineMat);
    world.add(links);

    /* --------------------------------------------- faint geometric shells */
    const shellMatA = new THREE.LineBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.055 });
    const shellMatB = new THREE.LineBasicMaterial({ color: PALETTE.aqua, transparent: true, opacity: 0.05 });
    const ico = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(30, 1)), shellMatA);
    ico.position.set(-26, 12, -74);
    const ico2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(21, 1)), shellMatB);
    ico2.position.set(34, -16, -54);
    const ringGeo = new THREE.BufferGeometry();
    const ringPts: number[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      ringPts.push(Math.cos(a) * 46, Math.sin(a) * 46, 0);
    }
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(ringPts, 3));
    const ring = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: PALETTE.bone, transparent: true, opacity: 0.045 }));
    ring.position.set(12, 6, -96);
    ring.rotation.x = 0.7;
    world.add(ico, ico2, ring);

    /* ------------------------------------------------------------ lifecycle */
    let frame = 0;
    let tick = 0;
    const gate = { paused: false };
    gateRef.current = gate;
    const clock = { t: performance.now() };
    const pointerSmooth = new THREE.Vector2(0, 0);
    const pointerTarget = new THREE.Vector2(0, 0);

    // shockwave state — one impulse at a time, plenty for a signature moment
    let shockActive = 0;
    let shockAge = 0;
    const shockAt = new THREE.Vector2();

    const onClick = (e: PointerEvent) => {
      // ignore clicks on interactive elements (buttons, links, etc.)
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("a,button,input,select,textarea,label,[role='slider']")) return;
      // only fire when the hero section is roughly on screen
      if (scrollState.progress > 0.18) return;
      shockAt.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      shockActive = 1;
      shockAge = 0;
    };
    window.addEventListener("pointerdown", onClick, { passive: true });

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (gate.paused) return;
      // mid-range phones: hold the ambient field at ~30fps to protect scroll feel
      if (q.compact && tick % 2 === 0) {
        tick++;
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.05, (now - clock.t) / 1000);
      clock.t = now;
      tick++;

      const time = uniforms.uTime.value + dt;
      uniforms.uTime.value = time;
      uniforms.uScroll.value = scrollState.progress;
      uniforms.uVel.value += (scrollState.velocity - uniforms.uVel.value) * 0.09;

      pointerTarget.set(pointerState.x, pointerState.y);
      pointerSmooth.lerp(pointerTarget, 0.05);
      uniforms.uPointer.value.copy(pointerSmooth);

      // decay the shockwave
      if (shockActive > 0.001) {
        shockAge += dt;
        shockActive = Math.max(0, 1 - shockAge * 0.9);
        uniforms.uShockCenter.value.copy(shockAt);
        uniforms.uShockAge.value = shockAge;
        uniforms.uShockStrength.value = shockActive;
      } else {
        uniforms.uShockStrength.value = 0;
      }

      camera.position.x += (pointerSmooth.x * 5.4 - camera.position.x) * 0.045;
      camera.position.y += (pointerSmooth.y * 3.2 - camera.position.y) * 0.045;
      camera.position.z = 48 - scrollState.progress * 14;
      camera.lookAt(0, scrollState.progress * -4, -20);

      world.rotation.y = pointerSmooth.x * 0.05 + scrollState.progress * 0.28;
      world.rotation.x = -pointerSmooth.y * 0.03 + scrollState.progress * 0.08;
      uniforms.uSpread.value = 1 + Math.abs(uniforms.uVel.value) * 0.35;

      ico.rotation.y += dt * 0.02;
      ico.rotation.x += dt * 0.012;
      ico2.rotation.y -= dt * 0.026;
      ico2.rotation.z += dt * 0.01;
      ring.rotation.z += dt * 0.008;

      if (tick % q.lineEvery === 0) {
        let li = 0;
        for (let i = 0; i < NODES; i++) {
          const b = nodeBase[i];
          const m = nodeMeta[i];
          nodeNow[i].set(
            b.x + Math.sin(time * m.sx + m.p) * 7.5 + pointerSmooth.x * (2 + b.z * 0.03),
            b.y + Math.cos(time * m.sy + m.p) * 5.2 + pointerSmooth.y * (1.6 + b.z * 0.03),
            b.z + Math.sin(time * 0.1 + m.p) * 4
          );
          nodePos[i * 3] = nodeNow[i].x;
          nodePos[i * 3 + 1] = nodeNow[i].y;
          nodePos[i * 3 + 2] = nodeNow[i].z;
        }
        nodeGeo.attributes.position.needsUpdate = true;

        const LIMIT = 19;
        for (let i = 0; i < NODES && li < MAXL; i++) {
          for (let j = i + 1; j < NODES && li < MAXL; j++) {
            const dx = nodeNow[i].x - nodeNow[j].x;
            const dy = nodeNow[i].y - nodeNow[j].y;
            const dz = nodeNow[i].z - nodeNow[j].z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < LIMIT * LIMIT) {
              const o = li * 6;
              linePos[o] = nodeNow[i].x;
              linePos[o + 1] = nodeNow[i].y;
              linePos[o + 2] = nodeNow[i].z;
              linePos[o + 3] = nodeNow[j].x;
              linePos[o + 4] = nodeNow[j].y;
              linePos[o + 5] = nodeNow[j].z;
              li++;
            }
          }
        }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, li * 2);
      }

      renderer.render(scene, camera);
    };

    frame = requestAnimationFrame(loop);

    const resize = () => {
      if (!host.clientWidth) return;
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = camera.aspect;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    return () => {
      gate.paused = true;
      gateRef.current = null;
      window.removeEventListener("pointerdown", onClick);
      cancelAnimationFrame(frame);
      ro.disconnect();
      geo.dispose();
      material.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ico.geometry.dispose();
      ico2.geometry.dispose();
      ring.geometry.dispose();
      shellMatA.dispose();
      shellMatB.dispose();
      dotTex.dispose();
      renderer.dispose();
    };
  }, [ready, reduced, compact]);

  // pause / resume rendering while off-screen or in a background tab
  useEffect(() => {
    if (hostRef.current) hostRef.current.style.visibility = active ? "visible" : "hidden";
    if (gateRef.current) gateRef.current.paused = !active;
  }, [active]);

  if (reduced) {
    return (
      <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(110% 80% at 62% 18%, rgba(232,192,122,0.12), transparent 60%), radial-gradient(90% 70% at 12% 78%, rgba(102,212,194,0.1), transparent 62%)",
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      ref={hostRef}
      aria-hidden
      style={{ opacity: wrapOpacity, scale: wrapScale }}
      className="pointer-events-none fixed inset-0 z-0 will-change-[opacity,transform]"
    >
      <motion.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full"
      />
      {/* atmospheric light — sits under the type, over the field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70% 52% at 68% 22%, rgba(232,192,122,0.11), transparent 62%), radial-gradient(58% 46% at 14% 68%, rgba(47,143,134,0.14), transparent 66%), radial-gradient(120% 90% at 50% 120%, rgba(4,7,10,0.9), transparent 58%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
    </motion.div>
  );
}
