import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";

/* =============================================================================
   Cursor spotlight — a fixed-position soft light that follows the cursor.
   Uses CSS variables + rAF instead of React state so pointer moves never
   cause a re-render. Disabled on coarse pointers and reduced motion.
   ============================================================================= */

export default function Spotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      raf = 0;
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.setProperty("--sx", `${x}px`);
      el.style.setProperty("--sy", `${y}px`);
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    loop();
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[3] hidden xl:block"
      style={{
        /* two stacked lights so the spotlight is warm at the core and cools out */
        background: `
          radial-gradient(380px 380px at var(--sx,50%) var(--sy,50%),
            ${theme === "light" ? "rgba(20,24,27,0.09)" : "rgba(232,192,122,0.08)"},
            transparent 60%),
          radial-gradient(560px 560px at var(--sx,50%) var(--sy,50%),
            ${theme === "light" ? "rgba(20,24,27,0.05)" : "rgba(102,212,194,0.045)"},
            transparent 65%)
        `,
        mixBlendMode: theme === "light" ? "multiply" : "screen",
        transition: "background 0.7s ease",
      }}
    />
  );
}
