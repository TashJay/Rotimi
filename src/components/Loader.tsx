import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* =============================================================================
   LOADER — "Geometric Assembler".
   A blueprint-style construction: the JI monogram is drawn from raw geometry
   (J = stem + quarter arc, I = rectangle outline) while a protractor ring of
   ticks, crosshairs, corner brackets, dashed orbits and counter-rotating
   diamonds assemble around it. A progress hairline + mono counter run the
   count, then the whole construction expands and wipes away.
   Pure SVG + CSS transforms — fast on every device, theme-aware via currentColor.
   ============================================================================= */

const EASE = [0.65, 0, 0.35, 1] as const;
const S = 180; // center x
const C = 120; // center y

const TICKS = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const major = i % 6 === 0;
  return { a, r1: major ? 117 : 122, major };
});

const ORBIT_DOTS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  return { x: S + Math.cos(a) * 116, y: C + Math.sin(a) * 116 };
});

const BRACKETS = [
  "M 16 54 L 16 16 L 54 16",
  "M 306 16 L 344 16 L 344 54",
  "M 344 186 L 344 224 L 306 224",
  "M 54 224 L 16 224 L 16 186",
];

const TAGLINE = "Transforming Ideas Into Digital Reality";

export default function Loader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    const dur = reduced ? 300 : 1900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!fired.current) {
        fired.current = true;
        setFinishing(true);
        window.setTimeout(onDone, reduced ? 0 : 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onDone]);

  const d0 = (x: number) => (reduced ? 0 : x);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.05, filter: reduced ? "none" : "blur(12px)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] overflow-hidden bg-ink-900 text-bone"
      aria-hidden
    >
      {/* blueprint grid */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(rgba(233,237,234,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(233,237,234,0.035) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "radial-gradient(78% 70% at 50% 46%, #000, transparent 82%)",
          WebkitMaskImage: "radial-gradient(78% 70% at 50% 46%, #000, transparent 82%)",
        }}
      />
      {/* radial glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 44% at 66% 30%, rgba(232,192,122,0.1), transparent 62%), radial-gradient(44% 40% at 28% 74%, rgba(102,212,194,0.09), transparent 60%)",
        }}
      />
      <div className="grain-layer pointer-events-none absolute inset-0" />

      {/* top labels */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6 sm:p-10">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: d0(0.1) }}
          className="font-display text-[0.82rem] font-semibold tracking-[0.22em] text-bone"
        >
          JAMES IRUNGU
        </motion.p>
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: d0(0.16) }}
          className="mono-label text-mute"
        >
          Geometric intro — 001
        </motion.p>
      </div>

      {/* center construction */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: finishing ? 1.07 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: d0(0.05) }}
          className="relative flex flex-col items-center"
        >
          <svg
            viewBox="0 0 360 240"
            className="w-[min(80vw,330px)] sm:w-[min(60vh,400px)]"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="ji-j" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--color-gold)" }} />
                <stop offset="100%" style={{ stopColor: "var(--color-clay)" }} />
              </linearGradient>
              <linearGradient id="ji-i" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" style={{ stopColor: "var(--color-aqua)" }} />
                <stop offset="100%" style={{ stopColor: "var(--color-aqua-deep)" }} />
              </linearGradient>
            </defs>

            {/* construction crosshairs */}
            <g className="text-bone/14">
              <motion.line
                x1="0" y1={C} x2="360" y2={C}
                stroke="currentColor" strokeWidth="1"
                initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: d0(0.12) }}
              />
              <motion.line
                x1={S} y1="6" x2={S} y2="234"
                stroke="currentColor" strokeWidth="1"
                initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: d0(0.2) }}
              />
            </g>

            {/* protractor ticks */}
            <g className="text-bone/45">
              {TICKS.map((t, i) => (
                <motion.line
                  key={i}
                  x1={S + Math.cos(t.a) * t.r1}
                  y1={C + Math.sin(t.a) * t.r1}
                  x2={S + Math.cos(t.a) * 128}
                  y2={C + Math.sin(t.a) * 128}
                  stroke="currentColor"
                  strokeWidth={t.major ? 1.4 : 0.7}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: t.major ? 0.55 : 0.35 }}
                  transition={{ delay: d0(0.1 + i * 0.011), duration: 0.3 }}
                />
              ))}
            </g>

            {/* counter-rotating diamonds */}
            <g className="text-aqua/20 animate-[spin_52s_linear_infinite_reverse]">
              <rect x="95" y="35" width="170" height="170" fill="none" stroke="currentColor" strokeWidth="1" />
            </g>
            <g className="text-gold/18 animate-[spin_38s_linear_infinite]">
              <rect x="120" y="60" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="1" />
            </g>

            {/* dashed orbit + solid ring */}
            <g className="text-gold/35 animate-[spin_46s_linear_infinite]">
              <motion.circle
                cx={S} cy={C} r="116" fill="none"
                stroke="currentColor" strokeWidth="1" strokeDasharray="3 9"
                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: d0(0.25) }}
              />
              {ORBIT_DOTS.map((d, i) => (
                <motion.circle
                  key={i}
                  cx={d.x} cy={d.y} r="2.4"
                  fill="currentColor"
                  initial={reduced ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.8, scale: 1 }}
                  transition={{ delay: d0(0.32 + i * 0.07), duration: 0.35, type: "spring", stiffness: 260, damping: 18 }}
                />
              ))}
            </g>
            <motion.circle
              cx={S} cy={C} r="88" fill="none"
              stroke="currentColor" strokeWidth="1"
              className="text-bone/12"
              initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: d0(0.28) }}
            />

            {/* corner brackets */}
            {BRACKETS.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none" stroke="currentColor" strokeWidth="1.4"
                className="text-gold/50"
                initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, ease: EASE, delay: d0(0.2 + i * 0.06) }}
              />
            ))}

            {/* ---------------- the monogram ---------------- */}
            {/* J — a stem and a quarter arc, drawn from the top down */}
            <g className="text-gold">
              <motion.path
                d={`M 152 52 L 152 148 A 48 48 0 0 0 104 100 L 104 76`}
                fill="none" stroke="currentColor" strokeWidth="12.5" strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.85, ease: EASE, delay: d0(0.5) }}
              />
              <motion.path
                d={`M 152 52 L 152 148 A 48 48 0 0 0 104 100 L 104 76 L 152 76 Z`}
                fill="url(#ji-j)"
                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 0.16 }}
                transition={{ duration: 0.7, delay: d0(1.15) }}
              />
            </g>

            {/* I — a rectangle outline, drawn from the bottom-left */}
            <g className="text-aqua">
              <motion.path
                d={`M 196 148 L 196 52 L 256 52 L 256 148`}
                fill="none" stroke="currentColor" strokeWidth="12.5" strokeLinecap="round"
                initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: d0(0.62) }}
              />
              <motion.path
                d={`M 196 52 L 256 52 L 256 148 L 196 148 Z`}
                fill="url(#ji-i)"
                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 0.16 }}
                transition={{ duration: 0.7, delay: d0(1.2) }}
              />
            </g>

            {/* centre anchor */}
            <motion.circle
              cx={S} cy={C} r="2.6" fill="currentColor"
              className="text-gold"
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: d0(0.42), duration: 0.4, type: "spring", stiffness: 300, damping: 16 }}
            />
          </svg>

          {/* tagline under the construction */}
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: d0(1.0) }}
            className="mono-label mt-4 text-center text-mute-2"
          >
            {TAGLINE}
          </motion.p>
        </motion.div>
      </div>

      {/* bottom readouts */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-10">
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d0(0.35) }}
          className="mono-label flex items-center gap-2.5 text-mute-2"
        >
          <span className="h-1.5 w-1.5 animate-[blink_2.4s_ease-in-out_infinite] rounded-full bg-aqua" />
          Initialising experience
        </motion.p>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d0(0.35) }}
          className="font-mono text-[clamp(2.4rem,9vw,5.6rem)] font-medium leading-none text-bone/25 tabular-nums"
        >
          {String(pct).padStart(3, "0")}
        </motion.p>
      </div>

      {/* progress hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-bone/10">
        <div
          className="h-full origin-left bg-gradient-to-r from-gold via-aqua to-gold shadow-[0_0_14px_rgba(232,192,122,0.6)]"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>

      {/* completion flash */}
      <motion.div
        animate={finishing ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, rgba(232,192,122,0.5), transparent 70%)",
        }}
      />
    </motion.div>
  );
}
