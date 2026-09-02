import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail, Moon, Phone, Send, Sun } from "lucide-react";
import { CONTACT, NAV_LINKS, SOCIALS } from "@/data/portfolio";
import { useTheme } from "@/lib/theme";
import { useCopy, useLocalTime } from "@/lib/hooks";
import { goToSection } from "@/lib/router";
import { Reveal, SPRING, Scramble, StaggerText } from "./motion";
import Chapter from "./Chapter";
import { cn } from "@/utils/cn";

const PROJECT_TYPES = ["Website", "Landing page", "UI/UX design", "Graphic design", "Data annotation", "Other"];
const BUDGETS = ["Not sure yet", "Under $500", "$500 – $1,500", "$1,500 – $5,000", "$5,000+"];

export default function Contact({ navigate, onCasePage }: { navigate: (to: string) => void; onCasePage: boolean }) {
  const reduced = useReducedMotion();
  const time = useLocalTime(CONTACT.timezone);
  const { copied, copy } = useCopy();

  const [form, setForm] = useState({ name: "", email: "", type: PROJECT_TYPES[0], budget: BUDGETS[0], message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const mailtoHref = (subject: string, body: string) =>
    `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Tell me who's writing";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "A working email, so a reply can land";
    if (form.message.trim().length < 12) next.message = "A sentence or two about the work helps";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = document.getElementById(`cf-${Object.keys(next)[0]}`);
      first?.focus();
      return;
    }
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Project type: ${form.type}`,
      `Budget range: ${form.budget}`,
      "",
      form.message.trim(),
      "",
      "— sent from jamesirungu portfolio",
    ].join("\n");
    window.location.href = mailtoHref(`${form.type} enquiry — ${form.name.trim()}`, body);
    setSent(true);
    window.setTimeout(() => setSent(false), 6000);
  };

  const field = (v: string) => v;

  return (
    <section id="contact" className="relative z-10 overflow-hidden px-5 pb-14 pt-24 sm:px-8 md:pt-32 lg:pt-40">
      <Chapter index="06" label="CONTACT" accent="gold" align="left" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-90"
        style={{ background: "radial-gradient(72% 60% at 22% 0%, rgba(232,192,122,0.13), transparent 62%)" }}
      />

      <div className="relative mx-auto max-w-[1440px]">
        <p className="mono-label mb-6 flex items-center gap-3 text-gold">
          <span className="inline-block h-px w-8 bg-gold/50" />
          06 — Contact
        </p>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* headline + routes */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.15rem,7vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.042em]">
              <StaggerText text="Have an idea?" />
              <br />
              <StaggerText text="Let’s turn it into" delay={0.06} />
              <br />
              <StaggerText text="something people can" delay={0.12} className="text-mute" />{" "}
              <StaggerText text="experience." delay={0.2} className="text-gold" />
            </h2>

            <Reveal delay={0.1}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={mailtoHref("Start a project — ", `Hi,\n\nI'd like to discuss:\n\n`)}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gold px-7 py-4 text-[0.9rem] font-semibold text-ink-950"
                >
                  <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
                  <span className="relative z-10">Start a Project</span>
                  <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <button
                  onClick={() => goToSection("archive", navigate, onCasePage)}
                  className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-6 py-4 text-[0.88rem] font-medium text-bone-dim transition-colors duration-400 hover:border-aqua/50 hover:text-bone"
                >
                  See the archive
                </button>
              </div>
            </Reveal>

            {/* contact rows */}
            <div className="mt-12 divide-y divide-bone/8 border-y border-bone/10">
              {[
                {
                  id: "email",
                  k: "Email",
                  v: CONTACT.email,
                  href: `mailto:${CONTACT.email}`,
                  icon: Mail,
                  note: "Opens your mail client",
                },
                {
                  id: "phone",
                  k: "Phone",
                  v: CONTACT.phoneDisplay,
                  href: CONTACT.phoneHref,
                  icon: Phone,
                  note: "Tap to call on mobile",
                },
              ].map((r) => (
                <Reveal key={r.id} className="group flex items-center gap-4 py-5">
                  <span className="mono-label w-20 shrink-0 !text-[0.6rem]">{r.k}</span>
                  <a
                    href={r.href}
                    className="flex flex-1 items-center gap-3 font-display text-[clamp(1.05rem,3.6vw,1.7rem)] font-medium tracking-[-0.02em] text-bone transition-colors duration-300 hover:text-gold"
                  >
                    <r.icon className="h-4 w-4 text-mute-2 transition-colors duration-300 group-hover:text-gold" strokeWidth={1.7} />
                    <span className="[background-image:linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                      {r.v}
                    </span>
                  </a>
                  <span className="hidden text-[0.7rem] text-mute-2 sm:block">{r.note}</span>
                  <button
                    onClick={() => copy(field(r.v), r.id)}
                    className="neo-btn grid h-9 w-9 shrink-0 place-items-center rounded-full text-mute transition-all duration-300 hover:text-aqua"
                    aria-label={`Copy ${r.k.toLowerCase()}`}
                  >
                    {copied === r.id ? <Check className="h-3.5 w-3.5 text-aqua" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </Reveal>
              ))}

              <Reveal className="flex flex-wrap items-center gap-4 py-5">
                <span className="mono-label w-20 shrink-0 !text-[0.6rem]">Based in</span>
                <span className="text-[0.95rem] text-bone-dim">{CONTACT.location}</span>
                <span className="font-mono text-[0.72rem] text-mute-2">
                  local time <span className="tabular-nums text-aqua">{time || "--:--:--"}</span>
                </span>
                <span className="ml-auto flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-mute-2">
                  <span className="h-1.5 w-1.5 animate-[blink_2.4s_ease-in-out_infinite] rounded-full bg-aqua" />
                  {CONTACT.availability}
                </span>
              </Reveal>
            </div>

            {SOCIALS.length === 0 && (
              <Reveal className="mt-8 flex flex-wrap items-center gap-2.5">
                <span className="mono-label mr-2">Professional profiles</span>
                {["LinkedIn", "GitHub", "Behance", "Dribbble"].map((s) => (
                  <span
                    key={s}
                    title="Links shared on request — add handles in src/data/portfolio.ts"
                    className="rounded-full border border-dashed border-bone/14 px-3.5 py-1.5 text-[0.78rem] text-mute"
                  >
                    {s}
                  </span>
                ))}
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Professional profile links")}`}
                  className="text-[0.78rem] text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
                >
                  Ask for links
                </a>
              </Reveal>
            )}

            {SOCIALS.length > 0 && (
              <Reveal className="mt-8 flex flex-wrap items-center gap-2.5">
                <span className="mono-label mr-2">Elsewhere</span>
                {SOCIALS.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-bone/12 px-3.5 py-1.5 text-[0.78rem] text-bone-dim transition-colors hover:border-gold/45 hover:text-gold"
                  >
                    {s.label}
                    <span className="text-mute-2 group-hover:text-gold/70">{s.handle}</span>
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </Reveal>
            )}
          </div>

          {/* form */}
          <div className="lg:col-span-5">
            <Reveal delay={0.06}>
              <form
                onSubmit={submit}
                noValidate
                className="neo relative overflow-hidden rounded-3xl p-6 sm:p-8"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                <p className="mono-label text-mute-2">
                  <Scramble text="Brief → mail draft" start={!reduced} />
                </p>
                <h3 className="mt-3 font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">
                  Write the brief here, send it from your inbox.
                </h3>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-mute">
                  Nothing is stored on a server: submitting composes a pre-filled email to{" "}
                  <span className="text-bone-dim">{CONTACT.email}</span> so you can review it before it leaves.
                </p>

                <div className="mt-6 space-y-4">
                  <Field id="name" label="Your name" error={errors.name}>
                    <input
                      id="cf-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Wanjiku"
                      className={inputCls(!!errors.name)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field id="email" label="Email" error={errors.email}>
                    <input
                      id="cf-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className={inputCls(!!errors.email)}
                      autoComplete="email"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="type" label="Project type">
                      <select
                        id="cf-type"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className={cn(inputCls(false), "appearance-none pr-8")}
                      >
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} className="bg-ink-900">
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="budget" label="Budget (optional)">
                      <select
                        id="cf-budget"
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        className={cn(inputCls(false), "appearance-none pr-8")}
                      >
                        {BUDGETS.map((b) => (
                          <option key={b} className="bg-ink-900">
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field id="message" label="What are we building?" error={errors.message}>
                    <textarea
                      id="cf-message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="A five-page site for a travel agency, mobile-first, ready in three weeks…"
                      className={cn(inputCls(!!errors.message), "resize-y")}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  className="neo-btn group mt-7 flex w-full items-center justify-between gap-3 rounded-full px-6 py-4 text-[0.88rem] font-semibold text-bone hover:text-gold"
                >
                  Compose the email
                  <Send className="h-4 w-4 transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                </button>

                <AnimatePresence>
                  {sent && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={SPRING}
                      className="mt-4 flex items-center gap-2 rounded-full border border-aqua/30 bg-aqua/8 px-4 py-2.5 text-[0.78rem] text-aqua"
                      role="status"
                    >
                      <Check className="h-3.5 w-3.5" /> Draft handed to your mail client — hit send and it’s on its way.
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- internals */

const inputCls = (invalid: boolean) =>
  cn(
    "neo-inset w-full rounded-xl px-4 py-3 text-[0.9rem] text-bone outline-none transition-shadow duration-300 placeholder:text-mute-2",
    "focus:ring-2 focus:ring-offset-0",
    invalid ? "focus:ring-signal/60" : "focus:ring-aqua/40"
  );

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`cf-${id}`} className={cn("mono-label mb-2 block !text-[0.6rem]", error && "text-signal")}>
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-1.5 text-[0.72rem] text-signal"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Footer({ navigate, onCasePage }: { navigate: (to: string) => void; onCasePage: boolean }) {
  const { theme, toggle } = useTheme();
  return (
    <footer className="relative z-10 border-t border-bone/10 px-5 pb-10 pt-14 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              onClick={() => (onCasePage ? navigate("/") : window.scrollTo({ top: 0, behavior: "smooth" }))}
              className="group text-left"
              aria-label="Back to top"
            >
              <p className="font-display text-[clamp(2.2rem,7vw,4.4rem)] font-semibold leading-none tracking-[-0.05em] text-bone transition-colors duration-500 group-hover:text-gold">
                JAMES IRUNGU
              </p>
            </button>
            <p className="mt-4 max-w-[42ch] text-[0.84rem] leading-relaxed text-mute">
              {CONTACT.role} — websites, interfaces, graphics and AI data work, built with care in Nairobi.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => goToSection(l.id, navigate, onCasePage)}
                className="group flex items-center gap-2 py-1 text-left text-[0.86rem] text-mute transition-colors hover:text-bone"
              >
                <span className="h-px w-4 bg-mute-2 transition-all duration-400 group-hover:w-7 group-hover:bg-gold" />
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-bone/8 pt-6 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-mute-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} James Irungu. All work shown belongs to its owners.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="group inline-flex items-center gap-2 transition-colors hover:text-gold"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" strokeWidth={1.8} /> : <Moon className="h-3.5 w-3.5" strokeWidth={1.8} />}
              {theme === "dark" ? "Light" : "Dark"} theme
            </button>
            <span className="h-3 w-px bg-bone/12" />
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-aqua/80" />
              Built with React · Framer Motion · Three.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
