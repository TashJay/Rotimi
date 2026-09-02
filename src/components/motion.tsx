import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  type Variants,
} from "framer-motion";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ spring */

export const SPRING = { type: "spring" as const, stiffness: 68, damping: 20, mass: 0.9 };
export const SOFT = { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

export const groupUp: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

/* ------------------------------------------------------------------ reveal */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span" | "li";
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -12% 0px" });
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ ...SPRING, delay: reduced ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}

/* --------------------------------------------------------- staggered words */

export function StaggerText({
  text,
  className,
  wordClass,
  delay = 0,
  stagger = 0.055,
  y = "0.42em",
  start = true,
}: {
  text: string;
  className?: string;
  wordClass?: string;
  delay?: number;
  stagger?: number;
  y?: string;
  start?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      animate={start ? "show" : "hidden"}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden py-[0.06em] align-bottom">
          <motion.span
            aria-hidden
            className={cn("inline-block", wordClass)}
            variants={{
              hidden: { y, opacity: 0, rotate: reduced ? 0 : -1.6 },
              show: { y: 0, opacity: 1, rotate: 0, transition: SPRING },
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------ scramble text */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*/<>{}[]=+_·";

export function Scramble({ text, className, start = true }: { text: string; className?: string; start?: boolean }) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced || !start ? text : "");

  useEffect(() => {
    if (reduced || !start) {
      setOut(text);
      return;
    }
    let raf = 0;
    let frame = 0;
    const total = text.length * 3 + 16;
    const tick = () => {
      frame++;
      const revealed = Math.floor((frame / total) * text.length * 1.35);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") s += " ";
        else if (i < revealed) s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (frame < total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, start]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-block whitespace-pre">
        {out || text}
      </span>
    </span>
  );
}

/* --------------------------------------------------------- scroll nudge fx */

/** Gently drifts a heading against scroll so type feels physical, not static. */
export function DriftOnScroll({
  children,
  className,
  distance = 40,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const dir = reverse ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [dir * distance, -dir * distance]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 1.015]);
  // the measured element stays static; the animated element is its child
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y, scale }}>{children}</motion.div>
    </div>
  );
}

/** Horizontal parallax travel for band-like elements. */
export function ParallaxX({ children, amount = 60, className }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={reduced ? undefined : { x }}>{children}</motion.div>
    </div>
  );
}

/** Vertical parallax slab — child moves against the containing block. */
export function ParallaxY({
  children,
  amount = 60,
  className,
  offset = ["start end", "end start"] as [string, string],
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
  offset?: [string, string];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as never });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ marquee */

export function Marquee({
  items,
  className,
  speed = "normal",
  separator = "◆",
}: {
  items: string[];
  className?: string;
  speed?: "normal" | "slow";
  separator?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          <span className="mono-label text-bone-dim/70">{t}</span>
          <span className="text-[0.6rem] text-gold/55">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("edge-fade-x group relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max group-hover:[animation-play-state:paused]",
          speed === "slow" ? "animate-[marquee_90s_linear_infinite]" : "animate-[marquee_46s_linear_infinite]"
        )}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- interactions */

/** Pointer-magnetic wrapper: nudge-toward-cursor micro interaction. */
export function Magnetic({ children, className, strength = 0.22 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength * 0.55);
    };
    const leave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reduced, strength, x, y]);

  return (
    <motion.span
      ref={ref}
      style={reduced ? undefined : { x: sx, y: sy }}
      className={cn("inline-block will-change-transform", className)}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ dividers */

export function RuleLabel({ index, label, className }: { index?: string; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {index && <span className="mono-label text-gold">{index}</span>}
      <span className="mono-label">{label}</span>
      <span className="hairline h-px flex-1" />
    </div>
  );
}
