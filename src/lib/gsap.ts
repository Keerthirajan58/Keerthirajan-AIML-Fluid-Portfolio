"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins — import gsap/ScrollTrigger from
 * here (client components only) so registration happens exactly once.
 */
gsap.registerPlugin(ScrollTrigger);

// Mobile browsers fire resize when the URL bar collapses; recalculating every
// trigger on that is both wasteful and a jank source.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

/** Live check — media query, not a snapshot, so OS-level toggles apply on reload. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
