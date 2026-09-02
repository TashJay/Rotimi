import { useCallback, useEffect, useState } from "react";

/* Hash routing keeps the single-file build portable: no server rewrites needed.
   "/"           → the landing experience
   "/work/:slug" → a dedicated case-study page                                            */

export type Route = { name: "home" } | { name: "case"; slug: string };

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, "");
  const m = clean.match(/^\/work\/([a-z0-9-]+)/i);
  if (m) return { name: "case", slug: m[1] };
  return { name: "home" };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { name: "home" } : parse(window.location.hash)
  );

  useEffect(() => {
    const onHash = () => {
      const next = parse(window.location.hash);
      setRoute(next);
      const target = next.name === "case" ? "case" : `home:${window.sessionStorage.getItem("ji_return") ?? ""}`;
      if (next.name === "case") {
        window.sessionStorage.setItem("ji_return", String(window.scrollY));
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      } else {
        const back = Number(window.sessionStorage.getItem("ji_return") ?? "0");
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        if (target.startsWith("home") && back > 0) {
          requestAnimationFrame(() => window.scrollTo({ top: back, behavior: "instant" as ScrollBehavior }));
        }
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    if (`#${to}` === window.location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = to;
  }, []);

  return { route, navigate };
}

/** Scroll to a section id, compensating for the sticky header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 66 : 78);
  window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
}

/** Nav works from inside a case study too: go home first, then scroll. */
export function goToSection(id: string, navigate: (to: string) => void, onCase: boolean) {
  if (!onCase) {
    scrollToId(id);
    return;
  }
  window.sessionStorage.setItem("ji_return", "0");
  navigate("/");
  window.setTimeout(() => scrollToId(id), 90);
}
