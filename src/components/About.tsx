import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CONTACT, SKILL_GROUPS } from "@/data/portfolio";
import { useLocalTime } from "@/lib/hooks";
import { Marquee, ParallaxX, Reveal, SPRING, StaggerText } from "./motion";
import Chapter from "./Chapter";
import Portrait from "./Portrait";

const PRINCIPLES = [
  {
    k: "01",
    t: "Design and build are one job",
    d: "Interfaces are drawn with the browser in mind — what ships is what was designed, not an approximation of it.",
  },
  {
    k: "02",
    t: "Fast is a feature",
    d: "Lazy media, restrained effects, work that still behaves on a mid-range phone with a weak signal.",
  },
  {
    k: "03",
    t: "Details get argued for",
    d: "Hierarchy, spacing and copy are treated as product decisions — with reasons behind them, not taste alone.",
  },
];

export default function About() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const time = useLocalTime(CONTACT.timezone);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -70]);
  const frameRot = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-3.5, 2.5]);

  return (
    <section id="about" className="relative z-10 px-5 py-24 sm:px-8 md:py-32 lg:py-40">
      <Chapter index="04" label="ABOUT" accent="clay" align="left" />
      <div className="relative mx-auto max-w-[1440px]">
        <header className="mb-14 grid grid-cols-1 gap-8 border-t border-bone/10 pt-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mono-label mb-5 flex items-center gap-3 text-clay">
              <span className="inline-block h-px w-8 bg-clay/50" />
              04 — About
            </p>
            <h2 className="font-display text-[clamp(2.3rem,7.6vw,5rem)] font-semibold leading-[0.94] tracking-[-0.042em]">
              <StaggerText text="A designer who" />
              <br />
              <StaggerText text="ships the code." delay={0.08} />
            </h2>
          </div>
          <p className="mono-label lg:col-span-4 lg:text-right">
            {CONTACT.location} · <span className="text-bone-dim tabular-nums">{time || "--:--:--"}</span> EAT
          </p>
        </header>

        <div ref={ref} className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* figure — different treatment from the hero: framed, duotone, smaller */}
          <div className="relative lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div style={reduced ? undefined : { y: imgY, rotate: frameRot }} className="relative">
                <div className="relative aspect-[4/5] overflow-hidden border border-bone/10 bg-[linear-gradient(150deg,#0d141b,#04070a)]">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(233,237,234,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(233,237,234,0.04) 1px, transparent 1px)",
                      backgroundSize: "34px 34px",
                    }}
                  />
                  <Portrait
                    treatment="ghost"
                    className="absolute inset-0 h-full w-full"
                    imgClassName="object-cover object-[52%_18%] scale-[1.06]"
                    alt="James Irungu, photographed in rim light"
                  />
                  {/* duotone scrim — sets the ghost figure apart from the hero treatment */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink-950/45 mix-blend-multiply" />
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(102,212,194,0.10),transparent_45%,rgba(4,7,10,0.55))]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <p className="mono-label !text-[0.58rem] text-bone-dim">Fig. 02 — the practitioner</p>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-gold">J.I.</p>
                  </div>
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(4,7,10,0.9)]" />
                </div>
                <span aria-hidden className="absolute -bottom-3 -right-3 -z-10 h-full w-full border border-gold/20" />
              </motion.div>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-bone/8 pt-6">
                {[
                  { k: "Discipline", v: "Design · Development · Data" },
                  { k: "Works from", v: "Nairobi, Kenya (EAT)" },
                  { k: "Engagements", v: "Sites, product UI, AI data" },
                  { k: "Availability", v: CONTACT.availability },
                ].map((r) => (
                  <div key={r.k}>
                    <dt className="mono-label !text-[0.58rem] text-mute-2">{r.k}</dt>
                    <dd className="mt-1.5 text-[0.84rem] leading-snug text-bone-dim">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* text */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display text-[clamp(1.35rem,3.6vw,2.05rem)] font-medium leading-[1.28] tracking-[-0.025em] text-bone">
                I work at the seam between <span className="text-gold">creativity</span>,{" "}
                <span className="text-aqua">technology</span> and{" "}
                <span className="text-clay">problem-solving</span> — taking an idea from a rough brief to a
                live, measured digital product.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-mute">
                <p>
                  The practice spans the whole surface: composing the brand graphic, designing the interface,
                  writing the front-end, then wiring the motion and the data behind it. That continuity keeps
                  decisions consistent — the typography that works on the poster also works on the site, and the
                  interaction that delights in the prototype survives into production.
                </p>
                <p>
                  Alongside client work, I do AI and data work — image and text annotation, categorization,
                  labeling, validation and quality assurance — the same patient, detail-first approach
                  applied to datasets that models are trained on.
                </p>
              </div>
            </Reveal>

            <ul className="mt-10 space-y-px overflow-hidden border-y border-bone/8">
              {PRINCIPLES.map((p, i) => (
                <motion.li
                  key={p.k}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING, delay: i * 0.07 }}
                  className="group relative grid grid-cols-[auto_1fr] items-start gap-5 bg-transparent px-1 py-6 transition-colors duration-500 hover:bg-bone/[0.03]"
                >
                  <span className="font-mono text-[0.68rem] tracking-[0.18em] text-gold/80">{p.k}</span>
                  <div>
                    <h3 className="font-display text-[1.12rem] font-medium tracking-[-0.015em] text-bone">{p.t}</h3>
                    <p className="mt-1.5 max-w-[52ch] text-[0.88rem] leading-relaxed text-mute">{p.d}</p>
                  </div>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-gold/60 transition-[width] duration-700 group-hover:w-full" />
                </motion.li>
              ))}
            </ul>

            {/* toolkit */}
            <div className="mt-10">
              <p className="mono-label mb-5 text-mute-2">Toolkit</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {SKILL_GROUPS.map((g, gi) => (
                  <motion.div
                    key={g.id}
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: gi * 0.05 }}
                    className="border-l border-bone/10 pl-4"
                  >
                    <p className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-aqua">{g.label}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {g.items.map((s) => (
                        <li
                          key={s}
                          className="neo-chip rounded-full px-2.5 py-1 text-[0.74rem] text-bone-dim transition-colors duration-300 hover:text-gold"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParallaxX amount={40} className="mt-20 border-y border-bone/8 py-4">
        <Marquee
          items={["Websites", "Landing pages", "UI/UX", "Graphics", "Brand kits", "Annotation", "Validation", "WebGL", "Motion"]}
          speed="slow"
          separator="—"
        />
      </ParallaxX>
    </section>
  );
}
