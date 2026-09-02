import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CONTACT, HERO_DISCIPLINES } from "@/data/portfolio";
import { scrollToId } from "@/lib/router";
import { Marquee, SPRING, Scramble, StaggerText } from "./motion";
import Portrait from "./Portrait";

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 130]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const portraitRotX = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 9]);
  const portraitRotY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -13]);
  const ringRot = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const railOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // pointer parallax on the figure (desktop only — mobile uses the gyroscope field)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 48, damping: 18, mass: 0.7 });
  const sy = useSpring(my, { stiffness: 48, damping: 18, mass: 0.7 });
  const pRotY = useTransform(sx, [-1, 1], [-7, 7]);
  const pRotX = useTransform(sy, [-1, 1], [5, -5]);
  const pX = useTransform(sx, [-1, 1], [-16, 16]);
  const pY = useTransform(sy, [-1, 1], [-10, 10]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate min-h-[100svh] w-full overflow-hidden pb-10 pt-[104px] md:pt-[120px]"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 sm:px-8 lg:min-h-[calc(100svh-160px)] lg:grid-cols-12 lg:items-center">
        {/* ------------------------------------------------------------ copy */}
        <motion.div
          style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
          className="relative z-20 lg:col-span-7 xl:col-span-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-aqua/50 animate-[pulse-ring_3s_ease-out_infinite]" />
              <span className="relative h-2 w-2 rounded-full bg-aqua" />
            </span>
            <span className="mono-label">
              <Scramble text="Portfolio · Nairobi, KE · Available for work" start={ready} />
            </span>

          </div>

          <h1 className="text-shadow-ink font-display text-[clamp(2.65rem,10.4vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-bone">
            <StaggerText text="Transforming Ideas" delay={0.15} start={ready} />
            <br />
            <span className="inline-block">
              <StaggerText text="Into" delay={0.4} className="text-mute" start={ready} />{" "}
              <StaggerText text="Digital" delay={0.48} className="text-gold" wordClass="[text-shadow:0_0_44px_rgba(232,192,122,0.28)]" start={ready} />{" "}
              <StaggerText text="Reality." delay={0.62} start={ready} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ ...SPRING, delay: 0.8 }}
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-bone-dim sm:text-[0.8rem]"
          >
            {["Designer", "Developer", "Data Annotation Specialist", "Creative Technologist"].map((r, i) => (
              <span key={r} className="flex items-center gap-3">
                {i > 0 && <span className="text-gold/60">•</span>}
                {r}
              </span>
            ))}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ ...SPRING, delay: 0.92 }}
            className="mt-5 max-w-[46ch] text-[0.98rem] leading-relaxed text-mute sm:text-[1.06rem]"
          >
            I build websites and digital experiences, design interfaces that convert, draw the graphics
            around them — and train machines with carefully annotated data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...SPRING, delay: 1.02 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => scrollToId("work")}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-bone px-6 py-3.5 text-[0.86rem] font-semibold text-ink-950"
            >
              <span className="absolute inset-0 -z-0 translate-y-full bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              <span className="relative z-10">View Selected Work</span>
              <ArrowDown className="relative z-10 h-4 w-4 transition-transform duration-400 group-hover:translate-y-0.5" />
            </button>
            <a
              href={`mailto:${CONTACT.email}?subject=Project%20enquiry%20via%20portfolio`}
              className="neo-btn group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[0.86rem] font-medium text-bone-dim hover:text-aqua"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* --------------------------------------------------------- portrait */}
        <div className="relative z-10 lg:col-span-5 lg:col-start-8 xl:col-span-6 xl:col-start-7">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.94 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            style={reduced ? undefined : { y: portraitY, scale: portraitScale, rotateX: portraitRotX, rotateY: portraitRotY }}
            className="relative [transform-style:preserve-3d]"
          >
            {/* rotating ring, anchored to the figure, not a box */}
            <motion.div
              aria-hidden
              style={{ rotate: ringRot, x: reduced ? 0 : pX }}
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[122%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-bone/10"
            >
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
              <span className="absolute left-0 top-[28%] h-1 w-1 rounded-full bg-aqua" />
            </motion.div>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 top-[12%] bottom-[6%] -z-10 rounded-[46%] bg-[radial-gradient(60%_50%_at_50%_40%,rgba(47,143,134,0.2),transparent_70%)] blur-2xl"
            />

            <motion.div
              style={reduced ? undefined : { rotateY: pRotY, rotateX: pRotX, x: pX, y: pY }}
              className="relative mx-auto h-[42vh] max-h-[460px] w-[92%] sm:h-[58vh] sm:w-[80%] lg:h-[78vh] lg:max-h-[720px] lg:w-full"
            >
              <Portrait priority className="h-full w-full" imgClassName="object-contain object-bottom lg:object-top" />
            </motion.div>

            {/* nameplate strip, floating off the image edge */}
            <div className="pointer-events-none absolute -bottom-1 right-0 flex items-center gap-3 border-l-2 border-gold/70 bg-ink-950/55 py-2 pl-3 pr-3 backdrop-blur-[2px] sm:right-[6%] lg:right-[-4%]">
              <div>
                <p className="mono-label !tracking-[0.3em] text-gold">James Irungu</p>
                <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mute-2">
                  Design · Code · Data
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ------------------------------------------------------------ details */}
      <motion.div
        style={reduced ? undefined : { opacity: railOpacity }}
        className="pointer-events-none absolute bottom-28 left-5 hidden items-center gap-3 sm:left-8 lg:flex"
      >
        <button
          onClick={() => scrollToId("work")}
          className="pointer-events-auto group flex items-center gap-3"
          aria-label="Scroll to selected work"
        >
          <span className="mono-label text-mute-2 transition-colors group-hover:text-bone">Scroll</span>
          <span className="relative block h-14 w-px overflow-hidden bg-bone/12">
            <span className="absolute inset-x-0 top-0 h-5 bg-gold animate-[scanline_2.6s_ease-in-out_infinite]" />
          </span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 mx-auto mt-10 max-w-[1440px] px-5 sm:px-8"
      >
        <div className="flex items-center gap-6 border-y border-bone/8 py-3">
          <span className="mono-label hidden shrink-0 text-mute-2 sm:inline">Disciplines</span>
          <Marquee items={HERO_DISCIPLINES} className="flex-1" />
          <span className="mono-label hidden shrink-0 text-mute-2 md:inline">Est. practice</span>
        </div>
      </motion.div>

    </section>
  );
}
