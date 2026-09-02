import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { attachPointerTracker, attachScrollTracker, useActiveSection } from "@/lib/hooks";
import { NAV_LINKS } from "@/data/portfolio";
import { goToSection, useRoute } from "@/lib/router";
import { ThemeProvider } from "@/lib/theme";
import HeroField from "@/three/HeroField";
import Loader from "@/components/Loader";
import Atmosphere from "@/components/Atmosphere";
import AmbientParallax from "@/components/AmbientParallax";
import Spotlight from "@/components/Spotlight";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Services from "@/components/Services";
import DataAnnotation from "@/components/DataAnnotation";
import About from "@/components/About";
import MoreWork from "@/components/MoreWork";
import Contact, { Footer } from "@/components/Contact";
import CaseStudy from "@/components/CaseStudy";
import { cn } from "@/utils/cn";

export default function App() {
  const { route, navigate } = useRoute();
  const reduced = useReducedMotion();
  const onCasePage = route.name === "case";
  const [loading, setLoading] = useState(true);
  const ready = !loading;

  // global listeners shared by the WebGL scenes (bound once)
  useEffect(() => attachScrollTracker(), []);
  useEffect(() => attachPointerTracker(!reduced), [reduced]);

  const openCase = (slug: string) => navigate(`/work/${slug}`);

  return (
    <ThemeProvider>
    <div className="relative min-h-screen w-full overflow-x-clip bg-ink-900 text-bone antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-[0.8rem] focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>

      <AnimatePresence initial={false}>
        {loading && <Loader key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <Atmosphere />
      <AmbientParallax />
      <HeroField />
      {/* keeps the particle field from ever competing with body copy */}
      <div aria-hidden className="theme-vignette pointer-events-none fixed inset-0 z-[1]" />
      <Spotlight />
      <Grain />
      <Nav onCasePage={onCasePage} navigate={navigate} />
      <SectionRail onCasePage={onCasePage} navigate={navigate} />
      <Cursor />

      <main id="main" className="relative z-[2]">
        <AnimatePresence mode="wait" initial={false}>
          {onCasePage ? (
            <CaseStudy key={route.slug} slug={route.slug} onNavigate={navigate} />
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5 }}
            >
              <Hero ready={ready} />
              <Work onOpen={openCase} />
              <Services navigate={navigate} onCasePage={onCasePage} />
              <DataAnnotation navigate={navigate} onCasePage={onCasePage} />
              <About />
              <MoreWork onOpen={openCase} />
              <Contact navigate={navigate} onCasePage={onCasePage} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} onCasePage={onCasePage} />
    </div>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */

function Grain() {
  return (
    <div aria-hidden className="grain-layer pointer-events-none fixed inset-0 z-[70]">
      <div className="absolute inset-0" />
    </div>
  );
}

/** Right-hand section rail — orientation without chrome. */
function SectionRail({ onCasePage, navigate }: { onCasePage: boolean; navigate: (to: string) => void }) {
  const active = useActiveSection(onCasePage ? [] : NAV_LINKS.map((l) => l.id));
  if (onCasePage) return null;
  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ul className="flex flex-col items-end gap-4">
        {NAV_LINKS.map((l) => {
          const isActive = active === l.id;
          return (
            <li key={l.id} className="pointer-events-auto">
              <button
                onClick={() => goToSection(l.id, navigate, false)}
                className="group flex items-center gap-3"
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "mono-label !text-[0.56rem] transition-all duration-500",
                    isActive ? "translate-x-0 text-bone opacity-100" : "translate-x-2 text-mute-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )}
                >
                  {l.label}
                </span>
                <span
                  className={cn(
                    "block h-px transition-all duration-500",
                    isActive ? "w-7 bg-gold" : "w-3 bg-bone/25 group-hover:w-5 group-hover:bg-bone/60"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Minimal reticle cursor — desktop fine pointers only, never intercepts input. */
function Cursor() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 320, damping: 34, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 320, damping: 34, mass: 0.4 });

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    let hovering = false;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      const interactive = Boolean(el?.closest?.("a,button,input,select,textarea,[role='slider']"));
      if (interactive !== hovering) {
        hovering = interactive;
        document.documentElement.style.setProperty("--cursor-scale", interactive ? "1.85" : "1");
        document.documentElement.style.setProperty("--cursor-opacity", interactive ? "1" : "0.55");
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.style.removeProperty("--cursor-scale");
    };
  }, [reduced, x, y]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[75] hidden xl:block"
    >
      <div
        className="relative -ml-3 -mt-3 h-6 w-6 rounded-full border border-gold/70"
        style={{
          transform: "scale(var(--cursor-scale,1))",
          opacity: "var(--cursor-opacity,0.55)",
          transition: "transform .28s cubic-bezier(.22,1,.36,1), opacity .28s ease",
        }}
      >
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </div>
    </motion.div>
  );
}
