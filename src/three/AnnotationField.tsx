import { useEffect, useRef } from "react";
import {
  THREE,
  hasWebGL,
  makeDotTexture,
  qualityTier,
  useIdleMount,
  useRenderGate,
  usePrefersReducedMotion,
  scrollState,
  pointerState,
  PALETTE,
} from "./shared";

/* =============================================================================
   ANNOTATION FIELD — abstract data visualisation for the AI/ML service.
   Raw noise resolves into structured, boxed, labelled clusters.
   • morph is driven by the section's scroll position AND the visitor's slider
   • a scan line sweeps the cloud; points flare as it passes
   • wireframe boxes + label anchors fade in as the data becomes classed
   ============================================================================= */

const VERT = /* glsl */ `
  attribute vec3 aStruct;
  attribute float aSeed;
  attribute float aCluster;
  attribute float aSize;

  uniform float uTime;
  uniform float uMorph;
  uniform float uDpr;
  uniform float uScan;
  uniform vec2 uPointer;

  varying float vAlpha;
  varying float vCluster;
  varying float vFlare;

  // cheap hash-based easing per point so the grid assembles organically
  float stagger(float s) {
    return clamp(uMorph * 1.45 - s * 0.45, 0.0, 1.0);
  }

  void main() {
    float m = stagger(aSeed);
    m = m * m * (3.0 - 2.0 * m);

    vec3 noise = position;
    float t = uTime * (0.11 + aSeed * 0.14);
    noise.x += sin(t + aSeed * 19.0) * 3.4;
    noise.y += cos(t * 1.17 + aSeed * 7.0) * 2.6;
    noise.z += sin(t * 0.83 + aSeed * 26.0) * 3.0;

    vec3 p = mix(noise, aStruct, m);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(0.001, -mv.z);
    mv.x += uPointer.x * (depth * 0.035);
    mv.y += uPointer.y * (depth * 0.028);

    gl_Position = projectionMatrix * mv;

    float flare = 1.0 - smoothstep(0.0, 5.5, abs(p.x - uScan));
    vFlare = flare * (1.0 - m * 0.45);

    float twinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed) + aSeed * 24.0);
    vAlpha = (0.22 + 0.5 * m) * twinkle + vFlare * 0.55;
    vCluster = aCluster;

    gl_PointSize = aSize * uDpr * (150.0 / depth) * (1.0 + vFlare * 1.4 + m * 0.25);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  varying float vAlpha;
  varying float vCluster;
  varying float vFlare;

  void main() {
    float m = texture2D(uMap, gl_PointCoord).a;
    vec3 col = mix(vec3(0.49, 0.56, 0.60), vec3(0.54, 0.62, 0.66), vCluster);
    if (vCluster < 0.34) col = vec3(0.910, 0.753, 0.478);
    else if (vCluster < 0.67) col = vec3(0.400, 0.831, 0.760);
    col += vFlare * 0.5;
    float a = m * clamp(vAlpha, 0.0, 1.0);
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;

type Handle = { setMorph: (v: number) => void; render: (() => void) | null };

export default function AnnotationField({
  structureRef,
  onLevel,
}: {
  structureRef: React.RefObject<Handle | null>;
  onLevel?: (v: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ready = useIdleMount(320);
  const reduced = usePrefersReducedMotion();
  const active = useRenderGate(hostRef);
  const gateRef = useRef<{ paused: boolean } | null>(null);

  useEffect(() => {
    if (!ready || !hasWebGL()) return;
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
    const camera = new THREE.PerspectiveCamera(46, host.clientWidth / Math.max(1, host.clientHeight), 0.1, 200);
    camera.position.set(0, 6, 62);
    camera.lookAt(0, 0, 0);

    const world = new THREE.Group();
    world.rotation.x = -0.06;
    scene.add(world);

    /* ----------------------------------------------------------- the cloud */
    const COUNT = q.compact ? 380 : 820;
    const PER = Math.floor(COUNT / 3);
    const scatter = new Float32Array(COUNT * 3);
    const struct = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const clusters = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);

    const centers = [
      new THREE.Vector3(-26, 9, -6),
      new THREE.Vector3(3, -8, 6),
      new THREE.Vector3(28, 11, -12),
    ];
    const dims = [
      [14, 9, 8],
      [11, 12, 7],
      [16, 8, 10],
    ];

    for (let i = 0; i < COUNT; i++) {
      const c = i < PER ? 0 : i < PER * 2 ? 1 : 2;
      scatter[i * 3] = (Math.random() * 2 - 1) * 44;
      scatter[i * 3 + 1] = (Math.random() * 2 - 1) * 26;
      scatter[i * 3 + 2] = (Math.random() * 2 - 1) * 34;

      const d = dims[c];
      const gx = Math.floor(Math.random() * d[0]);
      const gy = Math.floor(Math.random() * d[1]);
      const gz = Math.floor(Math.random() * d[2]);
      struct[i * 3] = centers[c].x + (gx / d[0] - 0.5) * 20;
      struct[i * 3 + 1] = centers[c].y + (gy / d[1] - 0.5) * 13;
      struct[i * 3 + 2] = centers[c].z + (gz / d[2] - 0.5) * 12;

      seeds[i] = Math.random();
      clusters[i] = c / 2;
      sizes[i] = 0.55 + Math.random() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute("aStruct", new THREE.BufferAttribute(struct, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aCluster", new THREE.BufferAttribute(clusters, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const dotTex = makeDotTexture();
    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: reduced ? 0.72 : 0 },
      uDpr: { value: q.dpr },
      uScan: { value: -50 },
      uPointer: { value: new THREE.Vector2() },
      uMap: { value: dotTex },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    world.add(new THREE.Points(geo, mat));

    /* --------------------------------------------------- bounding boxes + rails */
    const boxGroup = new THREE.Group();
    world.add(boxGroup);
    const boxMat = new THREE.LineBasicMaterial({ color: PALETTE.bone, transparent: true, opacity: 0.18 });
    const cornerMat = new THREE.LineBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.6 });
    const railMat = new THREE.LineBasicMaterial({ color: PALETTE.aqua, transparent: true, opacity: 0.12 });

    centers.forEach((c, idx) => {
      const d = dims[idx];
      const w = d[0] * 1.5;
      const h = d[1] * 1.0 + 2;
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d[2] * 1.5)),
        idx === 1 ? cornerMat : boxMat
      );
      box.position.copy(c);
      boxGroup.add(box);

      // bracket ticks: the visual language of a selection box
      const bracket = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 3.4, h + 3.4, 0.01)),
        new THREE.LineBasicMaterial({ color: PALETTE.aqua, transparent: true, opacity: 0.22 })
      );
      bracket.position.set(c.x, c.y, c.z + d[2] * 0.75 + 2);
      boxGroup.add(bracket);

      const railPts = new Float32Array([c.x, c.y - h / 2, c.z, c.x, -24, c.z]);
      const rail = new THREE.Line(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(railPts, 3)), railMat);
      boxGroup.add(rail);
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.7 })
      );
      dot.position.set(c.x, -24, c.z);
      boxGroup.add(dot);
    });
    boxGroup.traverse((o) => o.scale.setScalar(0.001));
    boxGroup.visible = false;

    /* -------------------------------------------------------------- base grid */
    const gridPts: number[] = [];
    for (let i = -6; i <= 6; i++) {
      gridPts.push(-46, -24, i * 6, 46, -24, i * 6);
      gridPts.push(i * 8, -24, -36, i * 8, -24, 36);
    }
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3)),
      new THREE.LineBasicMaterial({ color: PALETTE.deep, transparent: true, opacity: 0.16 })
    );
    world.add(grid);

    /* --------------------------------------------------------- scan sweep mesh */
    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 70),
      new THREE.MeshBasicMaterial({ color: PALETTE.aqua, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scan.rotation.y = Math.PI / 2;
    world.add(scan);

    const handle: Handle = {
      setMorph: (v: number) => {
        uniforms.uMorph.value = v;
        const s = Math.min(1, Math.max(0.001, v * 1.15));
        boxGroup.visible = v > 0.06;
        boxGroup.traverse((o) => o.scale.setScalar(0.82 + s * 0.18));
        (boxMat as THREE.LineBasicMaterial).opacity = 0.05 + v * 0.2;
        (railMat as THREE.LineBasicMaterial).opacity = v * 0.16;
        grid.material && ((grid.material as THREE.LineBasicMaterial).opacity = 0.06 + v * 0.14);
        if (reduced) renderer.render(scene, camera);
      },
      render: () => renderer.render(scene, camera),
    };
    structureRef.current = handle;

    /* -------------------------------------------------------------- the loop */
    let frame = 0;
    let tick = 0;
    const gate = { paused: false };
    gateRef.current = gate;
    const clock = { t: performance.now() };
    const pSmooth = new THREE.Vector2();
    const pTarget = new THREE.Vector2();
    let lastLevel = -1;

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (gate.paused || reduced) return;
      if (q.compact && tick % 2 === 0) {
        tick++;
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.05, (now - clock.t) / 1000);
      clock.t = now;
      tick++;

      uniforms.uTime.value += dt;
      pTarget.set(pointerState.x, pointerState.y);
      pSmooth.lerp(pTarget, 0.06);
      uniforms.uPointer.value.copy(pSmooth);

      const sweep = ((uniforms.uTime.value * 0.34) % 2.4) / 2.4;
      const scanX = -50 + sweep * 100;
      uniforms.uScan.value = scanX;
      scan.position.set(scanX, 0, 0);
      (scan.material as THREE.MeshBasicMaterial).opacity = 0.05 + 0.12 * Math.sin(sweep * Math.PI);

      world.rotation.y += (pSmooth.x * 0.16 + scrollState.velocity * 0.05 - world.rotation.y) * 0.05;
      world.rotation.x += (-0.06 + pSmooth.y * 0.05 - world.rotation.x) * 0.05;
      grid.position.z = ((uniforms.uTime.value * 1.4) % 12) - 6;

      boxGroup.children.forEach((o, i) => {
        if (o instanceof THREE.LineSegments) o.rotation.z = Math.sin(uniforms.uTime.value * 0.4 + i) * 0.006;
      });

      if (tick % 20 === 0) {
        // coarse steps keep React re-renders rare while scrolling
        const lvl = Math.round(uniforms.uMorph.value * 20) / 20;
        if (lvl !== lastLevel) {
          lastLevel = lvl;
          onLevel?.(lvl);
        }
      }

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);
    handle.setMorph(uniforms.uMorph.value);

    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      if (reduced) handle.render?.();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    return () => {
      gate.paused = true;
      gateRef.current = null;
      structureRef.current = null;
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((o) => {
        const any = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        any.geometry?.dispose?.();
        const m = any.material;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m?.dispose?.();
      });
      dotTex.dispose();
      renderer.dispose();
    };
  }, [ready, reduced]);

  useEffect(() => {
    if (gateRef.current) gateRef.current.paused = !active;
  }, [active]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export type { Handle as AnnotationHandle };
