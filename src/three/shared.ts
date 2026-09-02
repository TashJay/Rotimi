import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useIsCompact, scrollState, pointerState, clamp } from "@/lib/hooks";

/* --------------------------------------------------------------- capability */

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/** Device-aware quality budget so mid-range Android phones stay smooth. */
export function qualityTier() {
  const compact = typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) < 760;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const lowPower = compact || cores <= 4 || mem <= 4;
  const dpr = clamp(window.devicePixelRatio || 1, 1, lowPower ? 1.4 : 2);
  return {
    compact: lowPower,
    dpr,
    particles: lowPower ? 1500 : 4200,
    nodes: lowPower ? 34 : 78,
    maxLines: lowPower ? 240 : 900,
    lineEvery: lowPower ? 3 : 2,
  };
}

/** Mount the scene only after first paint, so 3D never blocks page load. */
export function useIdleMount(delay = 260) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return ready;
}

/** True while the canvas is on screen (or the tab is focused) — gates rendering. */
export function useRenderGate(ref: React.RefObject<HTMLElement | null>) {
  const onScreen = useRef(true);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const evaluate = () => {
      const visible = !document.hidden && (onScreen.current ?? true);
      setActive(visible);
    };
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              onScreen.current = entries.some((e) => e.isIntersecting);
              evaluate();
            },
            { threshold: 0.015 }
          )
        : null;
    io?.observe(el);
    document.addEventListener("visibilitychange", evaluate);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", evaluate);
    };
  }, [ref]);
  return active;
}

export function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.32, "rgba(255,255,255,0.62)");
  g.addColorStop(0.7, "rgba(255,255,255,0.09)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export const PALETTE = {
  gold: new THREE.Color("#e8c07a"),
  aqua: new THREE.Color("#66d4c2"),
  bone: new THREE.Color("#e9edea"),
  deep: new THREE.Color("#2f8f86"),
  clay: new THREE.Color("#cf8a68"),
};

export { THREE, scrollState, pointerState, clamp, usePrefersReducedMotion, useIsCompact };
