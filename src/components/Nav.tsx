import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { CONTACT, NAV_LINKS } from "@/data/portfolio";
import { goToSection } from "@/lib/router";
import { useTheme } from "@/lib/theme";
import { useActiveSection, useLocalTime, usePrefersReducedMotion } from "@/lib/hooks";
import { Magnetic, SPRING } from "./motion";
import { cn } from "@/utils/cn";

export default function Nav({ onCasePage, navigate }: { onCasePage: boolean; navigate: (to: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { theme, toggle } = useTheme();
  const time = useLocalTime(CONTACT.timezone);
  const active = useActiveSection(onCasePage ? [] : NAV_LINKS.map((l) => l.id));
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    goToSection(id, navigate, onCasePage);
  };

  const toTop = () => {
    setOpen(false);
    if (onCasePage) {
      navigate("/");
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: reduced ? 0 : -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "border-b border-bone/8 bg-ink-950/78 backdrop-blur-xl supports-[backdrop-filter]:bg-ink-950/62"
              : "border-b border-transparent bg-transparent"
          )}
        >
          <nav
            aria-label="Primary"
            className={cn(
              "mx-auto flex max-w-[1440px] items-center gap-4 px-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8",
              scrolled ? "h-[62px]" : "h-[82px]"
            )}
          >
            {/* brand */}
            <button
              onClick={toTop}
              className="group relative flex items-baseline gap-2.5 text-left"
              aria-label="James Irungu — back to top"
            >
              <span
                className={cn(
                  "font-display font-semibold text-bone transition-all duration-500",
                  scrolled ? "text-[0.94rem] tracking-[0.16em]" : "text-[1.02rem] tracking-[0.2em]"
                )}
              >
                JAMES&nbsp;IRUNGU
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-aqua/60 animate-[pulse-ring_3s_ease-out_infinite]" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-aqua" />
              </span>
            </button>

            {/* desktop links */}
            <ul className="ml-auto hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((l) => {
                const isActive = !onCasePage && active === l.id;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => go(l.id)}
                      className={cn(
                        "group relative px-3.5 py-2 text-[0.83rem] font-medium tracking-wide transition-colors duration-300",
                        isActive ? "text-bone" : "text-mute hover:text-bone"
                      )}
                    >
                      {l.label}
                      <span
                        className={cn(
                          "absolute inset-x-3 bottom-1 h-px origin-left bg-gold/80 transition-transform duration-400",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto flex items-center gap-3 lg:ml-4">
              <span className="mono-label hidden text-mute-2 xl:inline">
                NBO <span className="text-mute tabular-nums">{time || "--:--:--"}</span>
              </span>
              <Magnetic strength={0.12}>
                <button
                  onClick={toggle}
                  aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                  className="group grid h-10 w-10 place-items-center rounded-full border border-bone/12 text-bone-dim transition-colors duration-300 hover:border-gold/50 hover:text-gold"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={theme}
                      initial={{ opacity: 0, rotate: reduced ? 0 : -70, scale: 0.5 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: reduced ? 0 : 70, scale: 0.5 }}
                      transition={{ duration: 0.24 }}
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.8} /> : <Moon className="h-4 w-4" strokeWidth={1.8} />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </Magnetic>
              <Magnetic strength={0.14}>
                <button
                  onClick={() => go("contact")}
                  className="group relative hidden items-center gap-2 overflow-hidden rounded-full border border-gold/45 px-5 py-2.5 text-[0.8rem] font-semibold tracking-wide text-gold transition-colors duration-400 hover:text-ink-950 sm:inline-flex"
                >
                  <span className="absolute inset-0 -z-0 translate-y-full bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
                  <span className="relative z-10">Let&rsquo;s Work Together</span>
                  <ArrowUpRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </Magnetic>
              <button
                onClick={() => setOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full border border-bone/12 text-bone transition-colors hover:border-bone/30 lg:hidden"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "x" : "menu"}
                    initial={{ opacity: 0, rotate: reduced ? 0 : -14, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: reduced ? 0 : 14, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </nav>

          <motion.div
            style={{ scaleX: progress, originX: 0 }}
            className={cn(
              "absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-gold via-aqua to-gold transition-opacity duration-500",
              scrolled ? "opacity-90" : "opacity-0"
            )}
          />
        </div>
      </motion.header>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-ink-950/94 backdrop-blur-2xl" onClick={() => setOpen(false)} />
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
              className="relative flex h-full flex-col justify-between px-6 pb-10 pt-28"
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: SPRING } }}
                    className="border-b border-bone/8"
                  >
                    <button
                      onClick={() => go(l.id)}
                      className="group flex w-full items-baseline gap-4 py-4 text-left"
                    >
                      <span className="mono-label text-gold/70">0{i + 1}</span>
                      <span className="font-display text-[2rem] leading-none text-bone transition-transform duration-300 group-active:translate-x-1">
                        {l.label}
                      </span>
                      <ArrowUpRight className="ml-auto h-5 w-5 text-mute transition-all duration-300 group-hover:text-gold" />
                    </button>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: SPRING } }}
                className="space-y-4"
              >
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    go("contact");
                  }}
                  className="flex items-center justify-between rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink-950"
                >
                  Let&rsquo;s Work Together
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <button
                  onClick={toggle}
                  className="neo-btn flex w-full items-center justify-between rounded-full px-6 py-3.5 text-sm font-medium text-bone-dim transition-colors hover:text-gold"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.8} /> : <Moon className="h-4 w-4" strokeWidth={1.8} />}
                    {theme === "dark" ? "Switch to light" : "Switch to dark"}
                  </span>
                  <span className="mono-label !text-[0.58rem]">{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
                <div className="flex flex-col gap-1 text-sm text-mute">
                  <a href={`mailto:${CONTACT.email}`} className="w-fit hover:text-bone">
                    {CONTACT.email}
                  </a>
                  <a href={CONTACT.phoneHref} className="w-fit hover:text-bone">
                    {CONTACT.phoneDisplay}
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
