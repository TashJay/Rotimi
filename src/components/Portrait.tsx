import { useState } from "react";
import portraitSrc from "@/assets/portrait.jpg";

/* =============================================================================
   James's supplied cut-out. The source sits on a near-black field, so it is
   screen-blended straight into the page — no box, no border, no re-drawing.
   To swap in your transparent PNG: drop it at src/assets/portrait.png,
   change the import above, and delete the `cutout` blend class if you no
   longer need the black field dissolved.
   ============================================================================= */

export default function Portrait({
  className,
  imgClassName,
  priority = false,
  alt = "James Irungu — designer, developer and digital creative",
  treatment = "hero",
}: {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  alt?: string;
  treatment?: "hero" | "ghost";
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={className}>
      <div className="relative h-full w-full">
        {/* dark aura so the screen-blend cut-out reads on both themes */}
        <div aria-hidden className="portrait-scrim pointer-events-none absolute inset-0" />
        {/* light behind the figure — gives the cut-out something to blend into */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[16%] h-[62%] w-[70%] -translate-x-1/2 rounded-full blur-[70px]"
          style={{
            background:
              treatment === "hero"
                ? "radial-gradient(circle, rgba(232,192,122,0.24), rgba(47,143,134,0.18) 46%, transparent 72%)"
                : "radial-gradient(circle, rgba(102,212,194,0.14), transparent 70%)",
          }}
        />
        <img
          src={portraitSrc}
          alt={alt}
          width={832}
          height={1216}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          className={[
            "cutout relative h-full w-full object-cover object-top",
            "transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-[1.04]",
            "portrait-mask",
            imgClassName ?? "",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
