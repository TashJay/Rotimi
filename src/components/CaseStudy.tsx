import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Code2, ExternalLink, Mail } from "lucide-react";
import { CONTACT, PROJECTS, getProject } from "@/data/portfolio";
import { useTilt } from "@/lib/hooks";
import { Reveal, SPRING, Scramble, StaggerText } from "./motion";
import ProjectCover from "./ProjectCover";
import { cn } from "@/utils/cn";

export default function CaseStudy({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate: (to: string) => void;
}) {
  const project = getProject(slug);
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const tiltRef = useTilt<HTMLDivElement>({ disabled: !!reduced, max: 5 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -70]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);
  const coverY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 90]);

  if (!project) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[70svh] max-w-3xl flex-col items-start justify-center gap-6 px-5 sm:px-8">
        <p className="mono-label text-gold">404 — route not found</p>
        <h1 className="font-display text-[clamp(2rem,7vw,4rem)] font-semibold leading-none tracking-[-0.04em]">
          No project lives at this address.
        </h1>
        <button
          onClick={() => onNavigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-3 text-[0.85rem] font-semibold text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </button>
      </div>
    );
  }

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];

  const meta = [
    { k: "Scope", v: project.line },
    { k: "Role", v: project.role || "To be confirmed" },
    { k: "Year", v: project.year || "To be confirmed" },
    { k: "Services", v: project.services.join(" · ") || "To be confirmed" },
    { k: "Technologies", v: project.technologies.length ? project.technologies.join(" · ") : "To be confirmed" },
  ];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -18, transition: { duration: 0.3 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 px-5 pb-16 pt-[120px] sm:px-8 md:pt-[150px]"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => onNavigate("/")}
            className="group inline-flex items-center gap-2 text-[0.82rem] font-medium text-mute transition-colors hover:text-bone"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-400 group-hover:-translate-x-1" />
            All work
          </button>
          <p className="mono-label">
            <Scramble text={`Case study ${String(idx + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`} start={!reduced} />
          </p>
        </div>

        <header className="mt-10 border-t border-bone/10 pt-8">
          <motion.div style={reduced ? undefined : { y: titleY, opacity: titleOpacity }}>
            <h1 className="font-display text-[clamp(2.5rem,10vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
              <StaggerText text={project.title} />
            </h1>
            <p className="mt-5 max-w-[46ch] text-[1rem] leading-relaxed text-mute sm:text-[1.1rem]">{project.description}</p>
          </motion.div>
        </header>

        {/* cover */}
        <motion.div style={reduced ? undefined : { y: coverY }} className="mt-12">
          <div ref={tiltRef} className="tilt-3d group">
            <ProjectCover
              cover={project.cover}
              image={project.image}
              accent={project.accent}
              alt={`${project.title} — project artwork`}
              className="aspect-[16/9] w-full border border-bone/10"
            />
          </div>
          {project.gallery.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.gallery.map((g) => (
                <figure key={g.src}>
                  <img src={g.src} alt={g.caption} loading="lazy" decoding="async" className="w-full border border-bone/10" />
                  <figcaption className="mono-label mt-2">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
          <p className="mono-label mt-4 flex items-center gap-2 text-mute-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
            Project preview artwork shown — full production screenshots on request
          </p>
        </motion.div>

        {/* meta + body */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <dl className="divide-y divide-bone/8 border-y border-bone/10">
              {meta.map((m) => (
                <div key={m.k} className="grid grid-cols-[7.2rem_1fr] gap-4 py-4">
                  <dt className="mono-label pt-0.5">{m.k}</dt>
                  <dd className={cn("text-[0.88rem] leading-snug", m.v === "To be confirmed" ? "text-mute-2" : "text-bone-dim")}>
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {project.live ? (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-bone px-4 py-2.5 text-[0.8rem] font-semibold text-ink-950 transition-colors hover:bg-gold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Visit live site
                </a>
              ) : (
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Request: live link for ${project.title}`)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2.5 text-[0.8rem] font-medium text-bone-dim transition-colors hover:border-gold/45 hover:text-gold"
                >
                  <Mail className="h-3.5 w-3.5" /> Request the live link
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2.5 text-[0.8rem] font-medium text-bone-dim transition-colors hover:border-aqua/45 hover:text-aqua"
                >
                  <Code2 className="h-3.5 w-3.5" /> Source
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <Reveal>
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.3rem)] font-semibold leading-tight tracking-[-0.03em]">
                The brief, in one line
              </h2>
              <p className="mt-4 max-w-[58ch] text-[1.02rem] leading-relaxed text-bone-dim/85">
                <span className="text-bone">{project.title}</span> — {project.line.toLowerCase()}. Built to look
                considered at every screen size, load quickly and give the visitor one obvious thing to do next.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-bone/10 bg-bone/8 sm:grid-cols-2">
              {project.services.map((s, i) => (
                <motion.div
                  key={s}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING, delay: i * 0.06 }}
                  className="group bg-ink-900 p-6 transition-colors duration-500 hover:bg-ink-850"
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 font-display text-[1.18rem] font-medium tracking-[-0.02em] text-bone">{s}</p>
                  <span className="mt-4 block h-px w-8 bg-bone/20 transition-all duration-500 group-hover:w-16 group-hover:bg-gold/70" />
                </motion.div>
              ))}
            </div>

            {/* honest placeholder: filled in once the detail is supplied */}
            <div className="relative mt-10 overflow-hidden border border-dashed border-bone/14 p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.5]"
                style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(233,237,234,0.045) 0 1px, transparent 1px 9px)" }}
              />
              <p className="mono-label relative text-aqua">Full walkthrough</p>
              <p className="relative mt-3 max-w-[56ch] text-[0.95rem] leading-relaxed text-bone-dim">
                Process, constraints, wireframes and measurable results for this build are shared directly with
                prospective clients rather than published. Ask for the complete case-study pack and it will be put
                together for you.
              </p>
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Case-study pack — ${project.title}`)}&body=${encodeURIComponent("Hi,\n\nCould you walk me through the " + project.title + " project?\n\nThanks,")}`}
                className="relative mt-5 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-gold"
              >
                Request the pack
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* prev / next */}
        <nav className="mt-20 grid grid-cols-1 gap-px overflow-hidden border-y border-bone/10 bg-bone/8 sm:grid-cols-2" aria-label="More projects">
          <button
            onClick={() => onNavigate(`/work/${prev.slug}`)}
            className="group flex items-center gap-4 bg-ink-900 p-6 text-left transition-colors hover:bg-ink-850"
          >
            <ArrowLeft className="h-4 w-4 text-mute transition-all duration-400 group-hover:-translate-x-1 group-hover:text-gold" />
            <span>
              <span className="mono-label block">Previous</span>
              <span className="mt-1 block font-display text-[1.3rem] tracking-[-0.02em] text-bone group-hover:text-gold">
                {prev.title}
              </span>
            </span>
          </button>
          <button
            onClick={() => onNavigate(`/work/${next.slug}`)}
            className="group flex items-center justify-end gap-4 bg-ink-900 p-6 text-right transition-colors hover:bg-ink-850"
          >
            <span>
              <span className="mono-label block">Next</span>
              <span className="mt-1 block font-display text-[1.3rem] tracking-[-0.02em] text-bone group-hover:text-gold">
                {next.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-mute transition-all duration-400 group-hover:translate-x-1 group-hover:text-gold" />
          </button>
        </nav>
      </div>
    </motion.article>
  );
}
