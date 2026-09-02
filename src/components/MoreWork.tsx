import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, PROJECTS, type CategoryId } from "@/data/portfolio";
import { useTilt } from "@/lib/hooks";
import { Reveal, SPRING, StaggerText } from "./motion";
import Chapter from "./Chapter";
import ProjectCover from "./ProjectCover";
import { cn } from "@/utils/cn";

/* =============================================================================
   MORE WORK — a filterable archive. Push new entries into PROJECTS and they
   appear here, in the hero carousel of the case-study router, automatically.
   ============================================================================= */

export default function MoreWork({ onOpen }: { onOpen: (slug: string) => void }) {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const reduced = useReducedMotion();

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: PROJECTS.length };
    CATEGORIES.forEach((c) => {
      if (c.id === "all") return;
      map[c.id] = PROJECTS.filter((p) => p.categories.includes(c.id as CategoryId)).length;
    });
    return map;
  }, []);

  const shown = useMemo(
    () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.categories.includes(filter as CategoryId))),
    [filter]
  );

  return (
    <section id="archive" className="relative z-10 border-t border-bone/8 px-5 py-24 sm:px-8 md:py-32">
      <Chapter index="05" label="ARCHIVE" accent="gold" align="right" />
      <div className="relative mx-auto max-w-[1440px]">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mono-label mb-5 flex items-center gap-3 text-gold">
              <span className="inline-block h-px w-8 bg-gold/50" />
              05 — Archive
            </p>
            <h2 className="font-display text-[clamp(2.1rem,6.6vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
              <StaggerText text="More work," /> <StaggerText text="filtered." delay={0.1} className="text-mute" />
            </h2>
          </div>

          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="neo flex w-max items-center gap-1.5 rounded-full p-1.5 backdrop-blur-sm">
              {CATEGORIES.map((c) => {
                const activeF = filter === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setFilter(c.id)}
                    aria-pressed={activeF}
                    className={cn(
                      "relative shrink-0 rounded-full px-4 py-2 text-[0.78rem] font-medium transition-colors duration-300",
                      activeF ? "text-ink-950" : "text-mute hover:text-bone"
                    )}
                  >
                    {activeF && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-bone"
                        transition={{ type: "spring", stiffness: 340, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{c.label}</span>
                    <span
                      className={cn(
                        "relative z-10 ml-1.5 font-mono text-[0.6rem]",
                        activeF ? "text-ink-950/60" : "text-mute-2"
                      )}
                    >
                      {counts[c.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.div
                layout={!reduced}
                key={p.slug}
                initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.97 }}
                transition={{ ...SPRING, delay: Math.min(i * 0.05, 0.3) }}
              >
                <ArchiveCard slug={p.slug} onOpen={onOpen} disabled={!!reduced} />
              </motion.div>
            ))}
          </AnimatePresence>

          {shown.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="col-span-full flex min-h-[220px] flex-col items-start justify-center gap-4 border border-dashed border-bone/12 p-8"
            >
              <p className="mono-label text-gold">Empty set</p>
              <p className="max-w-[46ch] font-display text-[1.3rem] leading-snug tracking-[-0.02em] text-bone-dim">
                Nothing is filed under {CATEGORIES.find((c) => c.id === filter)?.label} yet — new work lands here
                as it ships.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="text-[0.82rem] font-semibold text-aqua underline decoration-aqua/40 underline-offset-4 hover:decoration-aqua"
              >
                Show everything
              </button>
            </motion.div>
          )}
        </div>

        <Reveal className="mt-12">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mute-2">
            <span className="inline-block h-1.5 w-1.5 animate-[blink_2.4s_ease-in-out_infinite] rounded-full bg-aqua" />
            Archive grows with every build — {PROJECTS.length} projects indexed
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ArchiveCard({ slug, onOpen, disabled }: { slug: string; onOpen: (s: string) => void; disabled: boolean }) {
  const project = PROJECTS.find((p) => p.slug === slug)!;
  const tiltRef = useTilt<HTMLDivElement>({ disabled, max: 9 });

  return (
    <div ref={tiltRef} className="tilt-3d group h-full">
      <button onClick={() => onOpen(slug)} className="block h-full w-full text-left" aria-label={`Open ${project.title}`}>
        <ProjectCover
          cover={project.cover}
          image={project.image}
          accent={project.accent}
          alt={`${project.title} preview`}
          className="aspect-[4/3] w-full border border-bone/10 transition-all duration-700 group-hover:border-gold/30"
        />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[1.18rem] font-medium leading-tight tracking-[-0.02em] text-bone transition-colors duration-300 group-hover:text-gold">
              {project.title}
            </h3>
            <p className="mt-1.5 text-[0.8rem] leading-snug text-mute">{project.line}</p>
          </div>
          <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bone/12 text-bone-dim transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink-950">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.services.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full border border-bone/8 px-2.5 py-0.5 text-[0.66rem] text-mute-2">
              {s}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
