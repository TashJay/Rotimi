import { useState } from "react";
import { cn } from "@/utils/cn";
import type { CoverKey } from "@/data/portfolio";

/* =============================================================================
   Project covers are drawn, not stock: each one is an abstract distillation of
   the project's own visual language. Drop real imagery into the project data
   and it will render above this layer.
   ============================================================================= */

const ACCENT = {
  gold: { main: "#e8c07a", soft: "rgba(232,192,122,0.16)", line: "rgba(232,192,122,0.42)" },
  aqua: { main: "#66d4c2", soft: "rgba(102,212,194,0.14)", line: "rgba(102,212,194,0.42)" },
  clay: { main: "#cf8a68", soft: "rgba(207,138,104,0.16)", line: "rgba(207,138,104,0.42)" },
} as const;

type Props = { cover: CoverKey; accent: keyof typeof ACCENT; image?: string; alt?: string; className?: string };

export default function ProjectCover({ cover, accent, image, alt = "", className }: Props) {
  const a = ACCENT[accent];
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-ink-850", className)}>
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={alt || `${cover} project cover art`}
      >
        <defs>
          <linearGradient id={`bg-${cover}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d141b" />
            <stop offset="55%" stopColor="#0a0f15" />
            <stop offset="100%" stopColor="#04070a" />
          </linearGradient>
          <radialGradient id={`glow-${cover}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={a.soft} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <pattern id={`grid-${cover}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(233,237,234,0.05)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="500" fill={`url(#bg-${cover})`} />
        <rect width="800" height="500" fill={`url(#grid-${cover})`} />
        <rect width="800" height="500" fill={`url(#glow-${cover})`} />

        {cover === "yancy" && <Yancy a={a} />}
        {cover === "racing" && <Racing a={a} />}
        {cover === "travels" && <Travels a={a} />}
        {cover === "skypaints" && <Skypaints a={a} />}
        {cover === "generic" && <Generic a={a} />}

        {/* abstract site skeleton, common to every cover */}
        <g className="cv-chrome" opacity="0.5">
          <rect x="40" y="36" width="120" height="7" rx="3.5" fill="rgba(233,237,234,0.22)" />
          <rect x="580" y="34" width="52" height="10" rx="5" fill={a.main} opacity="0.55" />
          <rect x="648" y="34" width="112" height="10" rx="5" fill="rgba(233,237,234,0.14)" />
          <path d="M40 62H760" stroke="rgba(233,237,234,0.08)" strokeWidth="1" />
        </g>
        <g className="cv-title">
          <rect x="40" y="330" width="300" height="14" rx="7" fill="rgba(233,237,234,0.28)" />
          <rect x="40" y="356" width="212" height="14" rx="7" fill="rgba(233,237,234,0.14)" />
          <rect x="40" y="392" width="96" height="26" rx="13" fill={a.main} opacity="0.72" />
        </g>
      </svg>

      {/* primary cover artwork — the SVG scene stays as a loading backdrop */}
      {image ? (
        <img
          src={image}
          alt={alt}
          width={1280}
          height={800}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "project-image absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            loaded && "loaded",
            loaded ? "scale-100 blur-0" : "scale-[1.04] blur-[6px]"
          )}
        />
      ) : null}

      {/* scan sheen on hover */}
      <div
        className="cv-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] opacity-0"
        style={{ background: `linear-gradient(90deg, transparent, ${a.soft}, transparent)` }}
      />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(4,7,10,0.85)]" />
    </div>
  );
}

type Art = { a: (typeof ACCENT)[keyof typeof ACCENT] };

function Yancy({ a }: Art) {
  return (
    <g>
      <g className="cv-spin" style={{ transformOrigin: "620px 210px" }}>
        <circle cx="620" cy="210" r="118" fill="none" stroke={a.line} strokeWidth="1.2" strokeDasharray="3 12" />
        <circle cx="620" cy="210" r="86" fill="none" stroke="rgba(233,237,234,0.12)" strokeWidth="1" />
      </g>
      <g className="cv-lift">
        <path d="M470 300 C520 160 620 150 690 236 C736 292 700 372 620 372 C556 372 520 336 470 380" fill="none" stroke={a.main} strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <g className="cv-lift-2">
        <path d="M430 340 C500 250 600 300 660 320" fill="none" stroke="rgba(233,237,234,0.4)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M500 130 C560 96 640 108 690 152" fill="none" stroke="rgba(233,237,234,0.18)" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <g opacity="0.9">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={120 + i * 34} y={108} width="16" height={54 + i * 26} rx="8" fill={i === 2 ? a.main : "rgba(233,237,234,0.16)"} className={`cv-bar cv-bar-${i}`} />
        ))}
      </g>
      <text x="120" y="230" className="cv-type" fill={a.main} fontSize="64" fontWeight="700" letterSpacing="-2" opacity="0.16">
        YG
      </text>
    </g>
  );
}

function Racing({ a }: Art) {
  return (
    <g>
      <path d="M0 300 C220 210 560 210 800 300" fill="none" stroke={a.line} strokeWidth="1.4" />
      <path d="M0 330 C240 250 540 250 800 330" fill="none" stroke="rgba(233,237,234,0.1)" strokeWidth="1" />
      <g className="cv-streaks">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={80 + i * 96}
            y={356 - i * 4}
            width={160 - i * 8}
            height="3"
            rx="1.5"
            fill={i % 3 === 0 ? a.main : "rgba(233,237,234,0.22)"}
            opacity={0.75 - i * 0.07}
          />
        ))}
      </g>
      <g className="cv-dash">
        <path d="M40 200 H760" stroke={a.main} strokeWidth="2.6" strokeDasharray="46 34" strokeLinecap="round" fill="none" />
      </g>
      <g opacity="0.85" className="cv-checker">
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={40 + i * 46} y="418" width="23" height="14" fill={i % 2 ? "rgba(233,237,234,0.4)" : a.main} opacity={i % 2 ? 0.35 : 0.75} />
        ))}
      </g>
      <g className="cv-ship" style={{ transformOrigin: "600px 150px" }}>
        <path d="M560 150 L660 150 L700 172 L640 178 L600 200 L560 172 Z" fill="rgba(233,237,234,0.1)" stroke={a.main} strokeWidth="1.6" />
        <circle cx="628" cy="166" r="5" fill={a.main} className="cv-blink" />
      </g>
      <circle cx="180" cy="150" r="52" fill="none" stroke="rgba(233,237,234,0.14)" strokeWidth="1" />
      <path d="M180 106 V150 L210 168" stroke={a.main} strokeWidth="2" fill="none" className="cv-hand" />
    </g>
  );
}

function Travels({ a }: Art) {
  return (
    <g>
      <g className="cv-drift">
        <path d="M0 402 C140 340 230 396 340 360 C470 318 560 386 800 330 L800 500 L0 500 Z" fill="rgba(233,237,234,0.05)" />
        <path d="M0 430 C160 380 250 430 380 400 C520 366 620 424 800 380 L800 500 L0 500 Z" fill="rgba(233,237,234,0.07)" />
        <path d="M0 458 C180 420 260 462 400 438 C540 414 660 456 800 424 L800 500 L0 500 Z" fill={a.soft} />
      </g>
      <circle cx="612" cy="126" r="42" fill="none" stroke={a.line} strokeWidth="1.4" />
      <circle cx="612" cy="126" r="20" fill={a.main} opacity="0.28" className="cv-pulse" />
      <g>
        <path id={`route-${a.main}`} d="M120 300 C260 170 420 250 560 150 C640 92 700 120 740 170" fill="none" stroke={a.main} strokeWidth="1.8" strokeDasharray="9 11" className="cv-route" />
      </g>
      {[
        [120, 300],
        [352, 214],
        [560, 150],
        [740, 170],
      ].map(([x, y], i) => (
        <g key={i} className={`cv-node cv-node-${i}`}>
          <circle cx={x} cy={y} r="5.5" fill="#04070a" stroke={a.main} strokeWidth="1.6" />
          <circle cx={x} cy={y} r="12" fill="none" stroke={a.line} strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
      <g className="cv-plane">
        <path d="M0 0 L26 8 L0 16 L6 8 Z" fill={a.main} transform="translate(300 232) rotate(-16)" />
      </g>
    </g>
  );
}

function Skypaints({ a }: Art) {
  return (
    <g>
      <g className="cv-bands">
        {[
          { y: 92, h: 34, o: 0.1 },
          { y: 138, h: 22, o: 0.16 },
          { y: 172, h: 46, o: 0.08 },
        ].map((b, i) => (
          <rect key={i} x="0" y={b.y} width="800" height={b.h} fill="rgba(233,237,234,0.5)" opacity={b.o} />
        ))}
      </g>
      <g className="cv-swatches">
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${470 + i * 66} ${196})`}>
            <rect
              x="0"
              y={i * 9}
              width="52"
              height={168 - i * 22}
              rx="4"
              fill={i % 2 ? a.main : "rgba(233,237,234,0.16)"}
              opacity={i % 2 ? 0.55 - i * 0.06 : 0.5}
              className={`cv-swatch cv-swatch-${i}`}
            />
          </g>
        ))}
      </g>
      <g className="cv-roller">
        <path d="M120 300 C170 240 250 250 300 300 C348 348 300 396 240 384 C186 374 176 330 120 344" fill="none" stroke={a.main} strokeWidth="9" strokeLinecap="round" opacity="0.75" />
        <path d="M120 300 C170 240 250 250 300 300" fill="none" stroke="rgba(233,237,234,0.35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 16" className="cv-drip" />
      </g>
      <path d="M300 120 H470" stroke="rgba(233,237,234,0.14)" strokeWidth="1" />
      <circle cx="470" cy="120" r="3.5" fill={a.main} />
    </g>
  );
}

function Generic({ a }: Art) {
  return (
    <g className="cv-drift">
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={90 + i * 92} y={120 + (i % 3) * 40} width="56" height={220 - (i % 3) * 46} rx="6" fill={i === 3 ? a.main : "rgba(233,237,234,0.12)"} opacity={i === 3 ? 0.5 : 0.6} />
      ))}
    </g>
  );
}
