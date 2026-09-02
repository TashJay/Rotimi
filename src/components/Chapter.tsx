import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/utils/cn";

/* =============================================================================
   CHAPTER — a huge, restrained background numeral pinned to a section, with
   heavy parallax and drift, plus an optional side-label. Gives every section
   a cinematic anchor without shouting; sits behind the actual header content.
   ============================================================================= */

type Props = {
  index: string; // "01", "02", …
  label: string; // e.g. "SELECTED WORK"
  align?: "left" | "right";
  accent?: "gold" | "aqua" | "clay";
  className?: string;
  children?: ReactNode;
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  gold: "text-gold/6",
  aqua: "text-aqua/6",
  clay: "text-clay/6",
};

export default function Chapter({ index, label, align = "right", accent = "gold", className, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [80, -140]);
  const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : align === "right" ? [40, -20] : [-40, 20]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.2]);
  const barScaleX = useTransform(scrollYProgress, [0, 0.35, 1], [0, 1, 1]);

  return (
    <div ref={ref} className={cn("pointer-events-none absolute inset-0 -z-[1] overflow-hidden", className)}>
      <motion.div
        aria-hidden
        style={{ y, x, scale, opacity }}
        className={cn(
          "absolute -top-6 flex select-none items-baseline gap-6 whitespace-nowrap font-display font-bold leading-none tracking-[-0.06em]",
          align === "right" ? "right-[-1.2vw]" : "left-[-1.2vw]",
          "text-[clamp(11rem,32vw,26rem)]",
          ACCENT[accent]
        )}
      >
        {index}
      </motion.div>

      {/* the side rail — vertical rotated label, subtly drifting */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -60]), opacity }}
        aria-hidden
        className={cn(
          "absolute top-1/2 flex origin-top -translate-y-1/2 items-center gap-3",
          align === "right" ? "right-3 sm:right-6" : "left-3 sm:left-6"
        )}
      >
        <motion.span
          style={{ scaleY: barScaleX }}
          className="block h-24 w-px origin-top bg-gradient-to-b from-bone/40 via-bone/10 to-transparent"
        />
        <span
          className="mono-label !text-[0.58rem] !tracking-[0.34em] text-mute-2"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {label}
        </span>
      </motion.div>

      {children}
    </div>
  );
}
