"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/** Height of the sticky header — anchor scrolls stop just below it. */
const HEADER_OFFSET = -72;

/**
 * Initializes Lenis (wheel-smoothing only — touch stays native so mobile keeps
 * platform scroll physics) and keeps ScrollTrigger in sync with it. Renders
 * nothing. Skipped entirely under prefers-reduced-motion: the browser's normal
 * scrolling is the reduced-motion behavior.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1 });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Route same-page anchor clicks through Lenis so they get the same easing
    // and stop below the sticky header. Links to other pages pass through.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href*="#"]',
      );
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: HEADER_OFFSET });
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
