import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/* =============================================================================
   AMBIENT PARALLAX — a fixed layer of restrained decorative marks that
   parallax at multiple depths across the whole page. Sits between the
   atmosphere bands and the WebGL field. Never intercepts pointer events,
   always reads as background texture.
   ============================================================================= */

type Mark = {
  kind: "digit" | "glyph" | "hairline" | "ring" | "cross" | "brace";
  content?: string;
  depth: number; // 0 = far / slow, 1 = near / fast
  x: string; // start position
  y: string;
  size?: string;
  tint?: "gold" | "aqua" | "clay" | "bone";
  rotate?: number;
  weight?: "thin" | "regular" | "bold";
};

const TINT: Record<NonNullable<Mark["tint"]>, string> = {
  gold: "text-gold/[0.09]",
  aqua: "text-aqua/[0.09]",
  clay: "text-clay/[0.10]",
  bone: "text-bone/[0.06]",
};

/* Curated set — each mark corresponds loosely to a chapter of the page.
   Depth values are unique per mark so nothing scrolls at the exact same
   rate. */
const MARKS: Mark[] = [
  { kind: "digit", content: "01", depth: 0.15, x: "6%", y: "16%", size: "clamp(3rem,7vw,6rem)", tint: "gold", weight: "bold" },
  { kind: "digit", content: "//", depth: 0.42, x: "88%", y: "22%", size: "clamp(2rem,4vw,3rem)", tint: "aqua", weight: "regular" },
  { kind: "digit", content: "02", depth: 0.28, x: "82%", y: "36%", size: "clamp(3rem,8vw,7rem)", tint: "aqua", weight: "bold" },
  { kind: "digit", content: "→", depth: 0.55, x: "12%", y: "44%", size: "clamp(2.4rem,5vw,4rem)", tint: "bone", weight: "thin" },
  { kind: "digit", content: "03", depth: 0.38, x: "4%", y: "62%", size: "clamp(3rem,7vw,6rem)", tint: "aqua", weight: "bold" },
  { kind: "digit", content: "04", depth: 0.62, x: "86%", y: "72%", size: "clamp(3rem,8vw,7rem)", tint: "clay", weight: "bold" },
  { kind: "digit", content: "05", depth: 0.48, x: "10%", y: "84%", size: "clamp(3rem,7vw,6rem)", tint: "gold", weight: "bold" },
  { kind: "digit", content: "06", depth: 0.72, x: "72%", y: "94%", size: "clamp(2.6rem,6vw,5rem)", tint: "gold", weight: "bold" },
  { kind: "glyph", content: "◇", depth: 0.36, x: "50%", y: "10%", size: "clamp(1rem,2vw,1.8rem)", tint: "bone" },
  { kind: "glyph", content: "△", depth: 0.68, x: "40%", y: "48%", size: "clamp(1.2rem,2.4vw,2rem)", tint: "aqua" },
  { kind: "glyph", content: "✕", depth: 0.85, x: "62%", y: "56%", size: "clamp(1rem,2vw,1.6rem)", tint: "clay" },
  { kind: "glyph", content: "◍", depth: 0.28, x: "78%", y: "82%", size: "clamp(1.4rem,2.6vw,2.2rem)", tint: "bone" },
  { kind: "brace", content: "{ }", depth: 0.52, x: "26%", y: "28%", size: "clamp(1.4rem,2.6vw,2.1rem)", tint: "aqua", weight: "regular" },
  { kind: "brace", content: "[  ]", depth: 0.32, x: "58%", y: "76%", size: "clamp(1.4rem,2.6vw,2.1rem)", tint: "gold", weight: "regular" },
  { kind: "hairline", depth: 0.22, x: "3%", y: "34%", rotate: -8 },
  { kind: "hairline", depth: 0.58, x: "68%", y: "58%", rotate: 12 },
  { kind: "hairline", depth: 0.44, x: "35%", y: "88%", rotate: -3 },
  { kind: "ring", depth: 0.18, x: "82%", y: "8%", size: "clamp(3rem,7vw,5rem)", tint: "gold" },
  { kind: "ring", depth: 0.66, x: "16%", y: "72%", size: "clamp(2rem,5vw,3.5rem)", tint: "aqua" },
  { kind: "cross", depth: 0.48, x: "44%", y: "18%", size: "clamp(0.7rem,1.4vw,1.1rem)", tint: "bone" },
  { kind: "cross", depth: 0.76, x: "68%", y: "34%", size: "clamp(0.7rem,1.4vw,1.1rem)", tint: "gold" },
  { kind: "cross", depth: 0.32, x: "22%", y: "60%", size: "clamp(0.7rem,1.4vw,1.1rem)", tint: "clay" },
];

export default function AmbientParallax() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 40, damping: 22, mass: 0.7 });
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[0] overflow-hidden">
      {MARKS.map((m, i) => (
        <ParallaxMark key={i} mark={m} smooth={smooth} reduced={!!reduced} />
      ))}
    </div>
  );
}

function ParallaxMark({ mark, smooth, reduced }: { mark: Mark; smooth: MotionValue<number>; reduced: boolean }) {
  // depth → travel distance (further marks travel less, near marks travel more)
  const travel = 180 + mark.depth * 340;
  const y = useTransform(smooth, [0, 1], reduced ? [0, 0] : [travel * 0.55, -travel * 0.55]);
  // slight horizontal counter-drift so the field doesn't feel monolithic
  const x = useTransform(smooth, [0, 1], reduced ? [0, 0] : [(mark.depth - 0.5) * -34, (mark.depth - 0.5) * 34]);
  const opacity = useTransform(smooth, [0, 0.5, 1], [0.5 + mark.depth * 0.4, 1, 0.5 + mark.depth * 0.4]);

  const tint = TINT[mark.tint ?? "bone"];
  const style: React.CSSProperties = { left: mark.x, top: mark.y, fontSize: mark.size };

  if (mark.kind === "hairline") {
    return (
      <motion.span
        style={{ ...style, y, x, opacity, rotate: mark.rotate ?? 0 }}
        className="absolute block h-px w-[14vw] max-w-[220px] bg-gradient-to-r from-transparent via-bone/12 to-transparent"
      />
    );
  }

  if (mark.kind === "ring") {
    return (
      <motion.span style={{ ...style, y, x, opacity }} className="absolute">
        <span
          className={`block aspect-square rounded-full border border-current ${tint}`}
          style={{ width: mark.size }}
        />
      </motion.span>
    );
  }

  if (mark.kind === "cross") {
    return (
      <motion.span style={{ ...style, y, x, opacity }} className={`absolute ${tint}`}>
        <span className="relative block" style={{ width: mark.size, height: mark.size }}>
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
        </span>
      </motion.span>
    );
  }

  const weightClass = mark.weight === "bold" ? "font-display font-bold" : mark.weight === "thin" ? "font-mono font-light" : "font-mono";
  return (
    <motion.span
      style={{ ...style, y, x, opacity }}
      className={`absolute select-none whitespace-nowrap leading-none tracking-[-0.04em] ${tint} ${weightClass}`}
    >
      {mark.content}
    </motion.span>
  );
}
