import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PROJECTS, type Project } from "@/data/portfolio";
import { useTilt } from "@/lib/hooks";
import Chapter from "./Chapter";
import { DriftOnScroll, Reveal, SPRING, StaggerText } from "./motion";
import ProjectCover from "./ProjectCover";
import { cn } from "@/utils/cn";

export default function Work({ onOpen }: { onOpen: (slug: string) => void }) {
  const first = PROJECTS[0];
  return (
    <section id="work" className="relative z-10 px-5 py-24 sm:px-8 md:py-32 lg:py-40">
      <Chapter index="01" label="SELECTED WORK" accent="gold" align="right" />
      <div className="relative mx-auto max-w-[1440px]">
        <header className="mb-14 flex flex-col gap-8 border-t border-bone/10 pt-8 md:mb-20 lg:flex-row lg:items-end lg:justify-between">
          <DriftOnScroll distance={26}>
            <p className="mono-label mb-5 flex items-center gap-3 text-gold">
              <span className="inline-block h-px w-8 bg-gold/50" />
              01 — Portfolio
            </p>
            <h2 className="font-display text-[clamp(2.4rem,8.4vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
              <StaggerText text="Selected Work" />
            </h2>
          </DriftOnScroll>
          <div className="flex max-w-sm flex-col gap-4 lg:pb-3">
            <p className="text-[1rem] leading-relaxed text-mute">Ideas I&rsquo;ve transformed into digital experiences.</p>
            <div className="flex items-center gap-4 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-mute-2">
              <span>{String(PROJECTS.length).padStart(2, "0")} projects</span>
              <span className="h-px flex-1 bg-bone/10" />
              <span>2024 —</span>
            </div>
          </div>
        </header>

        <div className="space-y-20 md:space-y-32">
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} onOpen={onOpen} />
          ))}
        </div>

        <Reveal className="mt-16 md:mt-20">
          <button
            onClick={() => onOpen(first.slug)}
            className="group flex w-full items-center justify-between gap-6 border-y border-bone/10 py-6 text-left transition-colors duration-500 hover:border-gold/40"
          >
            <span className="font-display text-[clamp(1.15rem,3.4vw,2rem)] tracking-[-0.02em] text-bone-dim transition-colors group-hover:text-bone">
              Start with a case study — {first.title}
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-bone/15 text-bone transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink-950">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- one row */

function ProjectRow({ project, index, onOpen }: { project: Project; index: number; onOpen: (slug: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tiltRef = useTilt<HTMLDivElement>({ disabled: !!reduced, max: 7 });
  const flip = index % 2 === 1;

  // Every scrolling element in the row moves at its own rate — the numeral
  // travels fastest (background feel), the cover next, the headline slowest,
  // and the meta drifts opposite. Three depth planes, one row.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const coverY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [58, -58]);
  const coverScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 0.98]);
  const headY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-14, 14]);
  const metaY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-40, 40]);
  const metaX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : flip ? [16, -16] : [-16, 16]);
  const numY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [110, -110]);

  const open = () => onOpen(project.slug);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-14% 0px -14% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      className={cn(
        "group relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12",
        flip && "lg:[direction:rtl]"
      )}
    >
      {/* text column */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: SPRING } }}
        className="relative z-20 lg:col-span-5 [direction:ltr]"
      >
        {/* headline plane — slow */}
        <motion.div style={reduced ? undefined : { y: headY }} className="flex items-start gap-4">
          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">{String(index + 1).padStart(2, "0")}</span>
          <div className="flex-1">
            <h3 className="font-display text-[clamp(1.9rem,5.2vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              <button onClick={open} className="text-left [background-image:linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_1px]">
                {project.title}
              </button>
            </h3>
            <p className="mt-3 max-w-[38ch] text-[0.94rem] leading-relaxed text-mute">{project.description}</p>
          </div>
        </motion.div>

        {/* meta plane — faster and drifting sideways against the cover */}
        <motion.dl
          style={reduced ? undefined : { y: metaY, x: metaX }}
          className="mt-7 space-y-2.5 border-t border-bone/8 pt-5 font-mono text-[0.7rem] uppercase tracking-[0.14em]"
        >
          <div className="flex gap-4">
            <dt className="w-24 shrink-0 text-mute-2">Scope</dt>
            <dd className="text-bone-dim">{project.line}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-24 shrink-0 text-mute-2">Services</dt>
            <dd className="text-bone-dim">{project.services.join(" · ")}</dd>
          </div>
        </motion.dl>

        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <button
            onClick={open}
            className="neo-btn group/btn inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.78rem] font-semibold text-bone hover:text-gold"
          >
            Case study
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
          {project.live ? (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.78rem] font-medium text-mute transition-colors hover:text-aqua"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Live site
            </a>
          ) : (
            <span className="rounded-full border border-dashed border-bone/12 px-4 py-2.5 text-[0.72rem] text-mute-2">
              Link shared on request
            </span>
          )}
        </div>
      </motion.div>

      {/* cover column */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 46, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: SPRING } }}
        style={reduced ? undefined : { y: coverY }}
        className="relative lg:col-span-7 [direction:ltr]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-4 -top-16 hidden font-display text-[9rem] font-bold leading-none text-bone/[0.045] lg:block"
        >
          <motion.span style={{ y: numY }} className="block">
            {String(index + 1).padStart(2, "0")}
          </motion.span>
        </span>

        <motion.div style={reduced ? undefined : { scale: coverScale, y: 0 }} className="relative">
          <div ref={tiltRef} className="tilt-3d relative">
            <button
              onClick={open}
              aria-label={`Open the ${project.title} case study`}
              className="block w-full cursor-pointer text-left"
            >
              <ProjectCover
                cover={project.cover}
                image={project.image}
                accent={project.accent}
                alt={`${project.title} — ${project.line}`}
                className={cn(
                  "aspect-[16/10] w-full rounded-2xl border border-bone/10 transition-shadow duration-700",
                  "shadow-[0_30px_80px_-40px_rgba(4,7,10,0.9)] group-hover:shadow-[0_40px_120px_-40px_rgba(232,192,122,0.25)]"
                )}
              />
              <span className="pointer-events-none absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-2xl border border-gold/0 transition-all duration-700 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-gold/25" />
            </button>
          </div>
        </motion.div>

        <div className="mt-4 flex items-center justify-between gap-4 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-mute-2">
          <span>{project.categories.map((c) => c.toUpperCase()).join(" / ")}</span>
          <span className="flex items-center gap-2 text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Open case study <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
