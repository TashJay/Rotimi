import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Code2, Database, Layers3, PenTool, Sparkles, type LucideIcon } from "lucide-react";
import { SERVICES } from "@/data/portfolio";
import { goToSection } from "@/lib/router";
import { Reveal, SPRING, StaggerText } from "./motion";
import Chapter from "./Chapter";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  layers: Layers3,
  pen: PenTool,
  dataset: Database,
  spark: Sparkles,
};

export default function Services({ navigate, onCasePage }: { navigate: (to: string) => void; onCasePage: boolean }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const current = SERVICES[active];

  return (
    <section id="services" className="relative z-10 border-t border-bone/8 px-5 py-24 sm:px-8 md:py-32 lg:py-40">
      <Chapter index="02" label="SERVICES" accent="aqua" align="left" />
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* -------------------------------------------------------- list */}
        <div className="lg:col-span-7">
          <header className="mb-12">
            <p className="mono-label mb-5 flex items-center gap-3 text-aqua">
              <span className="inline-block h-px w-8 bg-aqua/50" />
              02 — Services
            </p>
            <h2 className="font-display text-[clamp(2.3rem,7.4vw,4.9rem)] font-semibold leading-[0.94] tracking-[-0.04em]">
              <StaggerText text="What I take off" />
              <br />
              <StaggerText text="your plate." delay={0.08} className="text-mute" />
            </h2>
            <p className="mt-6 max-w-[52ch] text-[0.98rem] leading-relaxed text-mute">
              Design, build and maintain — one person across the whole digital surface, so nothing gets lost
              between the mockup and the live URL.
            </p>
          </header>

          <ul className="divide-y divide-bone/8 border-y border-bone/8">
            {SERVICES.map((s, i) => {
              const Icon = ICONS[s.icon] ?? Sparkles;
              const open = active === i;
              return (
                <motion.li
                  key={s.id}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: SPRING } }}
                  initial={reduced ? false : "hidden"}
                  whileInView="show"
                  viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                  className="relative"
                >
                  <button
                    onMouseEnter={() => !reduced && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-expanded={open}
                    className={cn(
                      "group flex w-full items-start gap-4 px-1 py-6 text-left transition-colors duration-500 sm:gap-6",
                      open ? "text-bone" : "text-bone-dim"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 font-mono text-[0.68rem] tracking-[0.18em] transition-colors duration-500",
                        open ? "text-gold" : "text-mute-2"
                      )}
                    >
                      {s.index}
                    </span>

                    <span
                      className={cn(
                        "neo-icon relative mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-all duration-500",
                        open ? "text-gold" : "text-mute"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 transition-transform duration-700",
                          open ? "rotate-0 scale-110" : "scale-100"
                        )}
                        strokeWidth={1.6}
                      />
                      {open && !reduced && (
                        <motion.span
                          layoutId="service-ring"
                          className="absolute inset-0 rounded-full ring-1 ring-gold/35"
                          transition={{ type: "spring", stiffness: 210, damping: 26 }}
                        />
                      )}
                    </span>

                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-display text-[clamp(1.2rem,3.4vw,1.72rem)] font-medium leading-tight tracking-[-0.025em]">
                          {s.title}
                        </span>
                        <span className="mono-label !text-[0.6rem] text-mute-2">{s.id.replace(/-/g, " / ")}</span>
                      </span>
                      <span className="mt-2 block max-w-[52ch] text-[0.92rem] leading-relaxed text-mute">{s.blurb}</span>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.ul
                            key="detail"
                            initial={reduced ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <span className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
                              {s.detail.map((d) => (
                                <span key={d} className="flex items-center gap-2 text-[0.82rem] text-bone-dim/85">
                                  <span className="h-1 w-1 rounded-full bg-aqua" />
                                  {d}
                                </span>
                              ))}
                            </span>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </span>

                    <ArrowUpRight
                      className={cn(
                        "mt-1 h-4.5 w-4.5 shrink-0 transition-all duration-500",
                        open ? "translate-x-0 -translate-y-0 text-gold opacity-100" : "text-mute-2 opacity-0 sm:opacity-0"
                      )}
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* ---------------------------------------------------- live panel */}
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28">
            <div className="neo relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(232,192,122,0.16),transparent_65%)] blur-xl"
              />
              <div className="flex items-center justify-between">
                <span className="mono-label text-mute-2">Active capability</span>
                <span className="font-mono text-[0.64rem] text-gold">{current.index}/05</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="mt-5 font-display text-[clamp(1.5rem,4vw,2.1rem)] font-semibold leading-tight tracking-[-0.03em]">
                    {current.title}
                  </h3>
                  <p className="mt-3 text-[0.94rem] leading-relaxed text-bone-dim/80">{current.blurb}</p>

                  {/* abstract capability diagram — bars keyed to the service */}
                  <svg viewBox="0 0 320 96" className="mt-7 w-full" aria-hidden>
                    <defs>
                      <linearGradient id="svc-g" x1="0" x2="1">
                        <stop offset="0%" stopColor="#e8c07a" />
                        <stop offset="100%" stopColor="#66d4c2" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 22 }).map((_, i) => {
                      const h = 8 + ((i * 7 + active * 13) % 5) * 14 + (i % 3) * 5;
                      return (
                        <motion.rect
                          key={i}
                          x={i * 14.6}
                          y={96 - h}
                          width="6"
                          rx="3"
                          height={h}
                          fill={i % 4 === active % 4 ? "url(#svc-g)" : "rgba(233,237,234,0.14)"}
                          initial={reduced ? false : { scaleY: 0.2, opacity: 0.3 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ delay: i * 0.018, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          style={{ transformOrigin: "bottom" }}
                        />
                      );
                    })}
                  </svg>

                  <ul className="mt-6 space-y-2.5 border-t border-bone/8 pt-5">
                    {current.detail.map((d, i) => (
                      <motion.li
                        key={d}
                        initial={reduced ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.4 }}
                        className="flex items-start gap-3 text-[0.86rem] text-mute"
                      >
                        <span className="mt-[0.42rem] h-1 w-3 shrink-0 bg-gold/70" />
                        {d}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between border-t border-bone/8 pt-5">
                <span className="mono-label text-mute-2">Engagements</span>
                <div className="flex gap-2">
                  {["One-off site", "Ongoing", "Data batches"].map((m) => (
                    <span key={m} className="rounded-full border border-bone/10 px-3 py-1 text-[0.7rem] text-bone-dim">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => goToSection("contact", navigate, onCasePage)}
                className="neo-btn group mt-6 flex w-full items-center justify-between gap-3 rounded-full px-5 py-3.5 text-[0.84rem] font-semibold text-bone hover:text-gold"
              >
                Discuss a project like this
                <ArrowUpRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
