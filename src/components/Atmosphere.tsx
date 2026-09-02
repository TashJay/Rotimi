import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/* =============================================================================
   ATMOSPHERE — a stack of fixed background layers that gently shifts palette
   as the visitor scrolls between chapters, plus a scroll-velocity vignette
   that pulses when the visitor scrolls fast. Adds a sense of place without
   ever competing with the WebGL field or the copy.
   ============================================================================= */

type Band = { hue: string; y: string; x: string; size: string };

const BANDS: Band[] = [
  { hue: "232,192,122", y: "8%", x: "72%", size: "60%" }, // hero — gold
  { hue: "232,192,122", y: "26%", x: "18%", size: "50%" }, // work
  { hue: "102,212,194", y: "44%", x: "78%", size: "56%" }, // services — aqua
  { hue: "102,212,194", y: "60%", x: "18%", size: "62%" }, // data annotation
  { hue: "207,138,104", y: "76%", x: "72%", size: "55%" }, // about — clay
  { hue: "232,192,122", y: "92%", x: "38%", size: "70%" }, // contact — gold return
];

export default function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 40, damping: 22, mass: 0.7 });
  const reduced = useReducedMotion();

  // scroll-velocity vignette: only runs while scroll is actively happening,
  // decays to zero and idles the rAF loop
  const velRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = window.scrollY;
    let vel = 0;

    const tick = () => {
      const y = window.scrollY;
      const target = Math.min(1, Math.abs(y - last) / 60);
      last = y;
      vel += (target - vel) * 0.14;
      if (velRef.current) velRef.current.style.setProperty("--v", vel.toFixed(3));
      if (vel > 0.001 || target > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // one drifting radial per chapter, cross-fading with scroll progress
  const layers = useMemo(
    () =>
      BANDS.map((b, i) => ({
        band: b,
        // each band peaks around its own chapter position
        peak: i / (BANDS.length - 1),
      })),
    []
  );

  return (
    <>
      {/* palette bands (sit behind the WebGL field but above the page bg) */}
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: -1 }}>
        {layers.map(({ band, peak }, i) => (
          <BandLayer key={i} band={band} peak={peak} smooth={smooth} reduced={!!reduced} />
        ))}
      </div>

      {/* scroll-velocity vignette — bloom-like edges when scrolling fast */}
      <div
        ref={velRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[4]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 45%, rgba(4,7,10,calc(var(--v,0)*0.55)) 100%)",
          transition: "background 0.16s linear",
        }}
      />
    </>
  );
}

function BandLayer({
  band,
  peak,
  smooth,
  reduced,
}: {
  band: Band;
  peak: number;
  smooth: MotionValue<number>;
  reduced: boolean;
}) {
  // triangular window centred on `peak`: fade in, hold, fade out
  const inRange: [number, number, number] = [Math.max(0, peak - 0.25), peak, Math.min(1, peak + 0.25)];
  const opacity = useTransform(smooth, inRange, [0, 0.7, 0]);
  const yRange: [string, string] = reduced ? ["0%", "0%"] : ["-6%", "6%"];
  const y = useTransform(smooth, [0, 1], yRange);
  return (
    <motion.div
      style={{
        opacity,
        y,
        background: `radial-gradient(${band.size} ${band.size} at ${band.x} ${band.y}, rgba(${band.hue},0.18), rgba(${band.hue},0) 70%)`,
      }}
      className="absolute inset-0"
    />
  );
}
