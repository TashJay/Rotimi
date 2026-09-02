import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ media */

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" && "matchMedia" in window ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsCompact = () => useMediaQuery("(max-width: 900px)");

/* --------------------------------------------------------------- scrolling */

/** Raw window scroll offset, rAF-throttled. */
export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setY(window.scrollY);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return y;
}

/** Shared, non-reactive scroll-state singleton consumed by the WebGL scenes. */
export const scrollState = {
  y: 0,
  velocity: 0,
  progress: 0,
};

let lastY = 0;
let listening = false;
export function attachScrollTracker() {
  if (listening || typeof window === "undefined") return () => {};
  listening = true;
  lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    scrollState.y = y;
    // eased velocity, normalised to roughly -1..1
    const target = Math.max(-1, Math.min(1, delta / 55));
    scrollState.velocity += (target - scrollState.velocity) * 0.24;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollState.progress = y / max;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    listening = false;
    window.removeEventListener("scroll", onScroll);
  };
}

/** IntersectionObserver visibility gate — used to pause WebGL work off-screen. */
export function useInViewOnce<T extends Element>(rootMargin = "120px") {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setSeen(true));
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, seen]);
  return { ref, seen };
}

export function useVisibility(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => setVisible(e.isIntersecting)), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

/* ------------------------------------------------------------------ pointer */

export const pointerState = { x: 0, y: 0, tx: 0, ty: 0, active: false };

export function attachPointerTracker(enabled: boolean) {
  if (typeof window === "undefined") return () => {};
  let raf = 0;
  const set = (cx: number, cy: number) => {
    pointerState.tx = (cx / window.innerWidth) * 2 - 1;
    pointerState.ty = -((cy / window.innerHeight) * 2 - 1);
    pointerState.active = true;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    set(e.clientX, e.clientY);
  };
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) set(t.clientX, t.clientY);
  };
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    pointerState.tx = Math.max(-1, Math.min(1, e.gamma / 38));
    pointerState.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 38));
    pointerState.active = true;
  };
  const loop = () => {
    pointerState.x += (pointerState.tx - pointerState.x) * 0.055;
    pointerState.y += (pointerState.ty - pointerState.y) * 0.055;
    raf = requestAnimationFrame(loop);
  };
  const idle = () => {
    pointerState.active = false;
  };
  const opts = { passive: true } as AddEventListenerOptions;
  const DOR = (
    window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<unknown> } }
  ).DeviceOrientationEvent;
  const requestGyro = DOR?.requestPermission
    ? () => {
        void DOR.requestPermission?.().catch(() => "denied");
      }
    : () => {};

  if (enabled) {
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("touchmove", onTouch, opts);
    // Gyroscope parallax: passive where allowed (Android), permission-gated on iOS.
    window.addEventListener("deviceorientation", onOrient, opts);
    window.addEventListener("pagehide", idle);
    window.addEventListener("touchstart", requestGyro, { once: true, passive: true });
  }
  raf = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("touchmove", onTouch);
    window.removeEventListener("deviceorientation", onOrient);
    window.removeEventListener("pagehide", idle);
    window.removeEventListener("touchstart", requestGyro);
    if (raf) cancelAnimationFrame(raf);
  };
}

/* -------------------------------------------------------------- section spy */

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.15, 0.5, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join("|")]);
  return active;
}

/* ----------------------------------------------------------------- clock */

export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

/* ---------------------------------------------------------------- copy */

export function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(
    async (text: string, key: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          /* clipboard unavailable — silently no-op */
        }
        document.body.removeChild(ta);
      }
      setCopied(key);
      window.setTimeout(() => setCopied(null), timeout);
    },
    [timeout]
  );
  return { copied, copy };
}

/* ------------------------------------------------------------- tilt helper */

export function useTilt<T extends HTMLElement>({ disabled = false, max = 8 }: { disabled?: boolean; max?: number }) {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    let rect = el.getBoundingClientRect();
    const measure = () => {
      rect = el.getBoundingClientRect();
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (frame.current) return;
      const x = e.clientX;
      const y = e.clientY;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const px = (x - rect.left) / Math.max(1, rect.width) - 0.5;
        const py = (y - rect.top) / Math.max(1, rect.height) - 0.5;
        el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(px + 0.5).toFixed(3)}`);
        el.style.setProperty("--my", `${(py + 0.5).toFixed(3)}`);
      });
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--mx", "0.5");
      el.style.setProperty("--my", "0.5");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      ro?.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [disabled, max]);

  return ref;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
