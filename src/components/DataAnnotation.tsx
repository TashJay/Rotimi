import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Boxes, Check, MoveRight } from "lucide-react";
import { DATA_CAPABILITIES, DATA_SPEC, DATA_WORKFLOW } from "@/data/portfolio";
import { goToSection } from "@/lib/router";
import AnnotationField, { type AnnotationHandle } from "@/three/AnnotationField";
import { clamp } from "@/lib/hooks";
import { Reveal, SPRING, StaggerText } from "./motion";
import Chapter from "./Chapter";
import { cn } from "@/utils/cn";

/* =============================================================================
   DATA ANNOTATION — raw data on the left, structured & boxed data on the right.
   Morph is driven by the section's scroll position, overridden by the slider.
   ============================================================================= */

export default function DataAnnotation({ navigate, onCasePage }: { navigate: (to: string) => void; onCasePage: boolean }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const handleRef = useRef<AnnotationHandle | null>(null);
  const hudRef = useRef<HTMLParagraphElement | null>(null);
  const manualRef = useRef<number | null>(null);
  const [manual, setManual] = useState<number | null>(null);
  const [level, setLevel] = useState(0.2);
  const [openCap, setOpenCap] = useState(0);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "center center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 24, mass: 0.6 });

  useEffect(() => {
    const apply = (v: number) => {
      handleRef.current?.setMorph(v);
      if (hudRef.current) hudRef.current.textContent = `${Math.round(v * 100)}% structured`;
    };
    const unsub = smooth.on("change", (v) => {
      if (manualRef.current != null) return;
      apply(clamp(0.06 + v * 1.05));
    });
    return unsub;
  }, [smooth]);

  const setMorph = (v: number | null) => {
    manualRef.current = v;
    setManual(v);
    if (v != null) handleRef.current?.setMorph(clamp(v));
  };

  const classes = ["image", "text", "category"];

  return (
    <section
      id="data-annotation"
      ref={sectionRef}
      className="relative z-10 overflow-hidden border-y border-bone/10 bg-ink-950/72 py-24 md:py-32"
    >
      <Chapter index="03" label="DATA · AI" accent="aqua" align="right" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(233,237,234,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(233,237,234,0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(80% 60% at 50% 40%, #000, transparent 78%)",
          WebkitMaskImage: "radial-gradient(80% 60% at 50% 40%, #000, transparent 78%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8">
        <header className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mono-label mb-5 flex items-center gap-3 text-aqua">
              <span className="inline-block h-px w-8 bg-aqua/50" />
              03 — Data Annotation &amp; AI Data Work
            </p>
            <h2 className="font-display text-[clamp(2.3rem,7.6vw,5rem)] font-semibold leading-[0.94] tracking-[-0.042em]">
              <StaggerText text="Clean labels for" />
              <br />
              <StaggerText text="honest machines." delay={0.08} className="text-aqua" />
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[0.98rem] leading-relaxed text-mute">
              Models are only as good as the data behind them. I contribute to AI/ML data workflows through
              careful, guideline-faithful work: accurate labeling, categorization, annotation, validation
              and quality assurance — one item at a time, checked before it ships.
            </p>
          </div>
        </header>

        {/* ------------------------------------------------- the visualisation */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="relative h-[380px] overflow-hidden border border-bone/10 bg-[linear-gradient(160deg,rgba(13,20,27,0.9),rgba(4,7,10,0.94))] sm:h-[460px] lg:h-[560px]">
              <AnnotationField structureRef={handleRef} onLevel={(v) => setLevel(v)} />

              {reduced && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <p className="mono-label text-mute">Reduced motion — static diagram</p>
                </div>
              )}

              {/* HUD */}
              <div className="pointer-events-none absolute inset-0">
                {[
                  "left-0 top-0 border-l border-t",
                  "right-0 top-0 border-r border-t",
                  "left-0 bottom-0 border-l border-b",
                  "right-0 bottom-0 border-r border-b",
                ].map((c) => (
                  <span key={c} className={cn("absolute m-3 h-5 w-5 border-aqua/40", c)} />
                ))}
                <div className="absolute left-5 top-5 space-y-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-mute-2">
                  <p className="text-bone-dim">
                    <span className="text-signal">●</span> annotation viewport
                  </p>
                  <p>
                    classes <span className="text-bone-dim">03</span>
                  </p>
                  <p ref={hudRef} className="text-gold">
                    20% structured
                  </p>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-mute-2">
                  {classes.map((c, i) => (
                    <span key={c} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-500",
                          i === 0 ? "bg-gold" : i === 1 ? "bg-aqua" : "bg-bone-dim"
                        )}
                      />
                      {c}
                      <span className="text-bone-dim/70 tabular-nums">
                        {Math.round(clamp(level, 0, 1) * (i === 1 ? 41 : i === 0 ? 28 : 17) + 4)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* control */}
              <div className="neo-chip absolute bottom-5 right-5 flex items-center gap-3 rounded-full px-4 py-2.5 backdrop-blur-md">
                <label htmlFor="morph" className="mono-label !text-[0.6rem] text-mute-2">
                  Scatter
                </label>
                <input
                  id="morph"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((manual ?? clamp(0.06 + Number(smooth.get()) * 1.05)) * 100)}
                  onChange={(e) => setMorph(Number(e.target.value) / 100)}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-bone/15 accent-aqua sm:w-36"
                  aria-label="Move between scattered data and structured, labelled data"
                />
                <span className="mono-label !text-[0.6rem] text-mute-2">Structured</span>
                <button
                  onClick={() => setMorph(null)}
                  className={cn(
                    "ml-1 rounded-full px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] transition-colors",
                    manual == null ? "bg-aqua/18 text-aqua" : "text-mute-2 hover:text-bone"
                  )}
                  aria-label="Return control to scroll"
                >
                  Auto
                </button>
              </div>
            </div>
          </Reveal>

          {/* capability ledger */}
          <div className="lg:col-span-4">
            <ul className="neo h-full divide-y divide-bone/8 rounded-3xl">
              {DATA_CAPABILITIES.map((c, i) => {
                const open = openCap === i;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setOpenCap(open ? -1 : i)}
                      onMouseEnter={() => !reduced && setOpenCap(i)}
                      className="group flex w-full items-center gap-4 px-5 py-5 text-left"
                      aria-expanded={open}
                    >
                      <span
                        className={cn(
                          "font-mono text-[0.62rem] tracking-[0.16em] transition-colors duration-400",
                          open ? "text-aqua" : "text-mute-2 group-hover:text-aqua"
                        )}
                      >
                        {c.id}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-[1.06rem] font-medium tracking-[-0.015em] text-bone">
                          {c.label}
                        </span>
                        <motion.span
                          initial={false}
                          animate={{ height: open && !reduced ? "auto" : 0, opacity: open ? 1 : 0 }}
                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-wrap gap-x-4 gap-y-1.5 overflow-hidden pt-0"
                        >
                          {c.items.map((it) => (
                            <span key={it} className="flex items-center gap-1.5 text-[0.78rem] text-mute">
                              <Check className="h-3 w-3 text-aqua/70" strokeWidth={2.4} />
                              {it}
                            </span>
                          ))}
                        </motion.span>
                      </span>
                      <Boxes className={cn("h-4 w-4 shrink-0 transition-all duration-500", open ? "text-aqua" : "text-mute-2")} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------------- the loop */}
        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-bone/8 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mono-label mb-6 text-mute-2">How a batch runs</p>
            <ol className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              {DATA_WORKFLOW.map((w, i) => (
                <motion.li
                  key={w.step}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING, delay: i * 0.06 }}
                  className="group relative flex-1 border-l border-bone/10 pl-4 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-4"
                >
                  <span className="mono-label block text-gold/80">{w.step}</span>
                  <span className="mt-1.5 block font-display text-[1.05rem] font-medium tracking-[-0.01em] text-bone">
                    {w.label}
                  </span>
                  <span className="mt-1 block max-w-[22ch] text-[0.78rem] leading-snug text-mute-2">{w.note}</span>
                  <span
                    className={cn(
                      "absolute left-0 top-0 hidden h-px w-0 bg-gold transition-[width] duration-700 group-hover:w-full sm:block",
                      i === DATA_WORKFLOW.length - 1 && "sm:hidden"
                    )}
                  />
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {DATA_SPEC.map((s) => (
                <div key={s.k} className="flex flex-col border-t border-bone/8 pt-3">
                  <dt className="mono-label text-mute-2">{s.k}</dt>
                  <dd className="mt-1.5 text-[0.84rem] leading-snug text-bone-dim">{s.v}</dd>
                </div>
              ))}
            </dl>
            <button
              onClick={() => goToSection("contact", navigate, onCasePage)}
              className="group mt-7 inline-flex items-center gap-2 text-[0.86rem] font-semibold text-aqua"
            >
              Discuss a data or annotation task
              <MoveRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-1" />
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-400 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
