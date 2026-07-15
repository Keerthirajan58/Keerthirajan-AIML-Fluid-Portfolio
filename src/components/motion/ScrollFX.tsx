"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * All scroll-driven storytelling, orchestrated in one place. Server Components
 * opt in with data attributes ([data-reveal], [data-timeline], …) instead of
 * becoming client components. Everything lives inside a gsap.matchMedia
 * reduced-motion guard: for reduce users none of this runs and the CSS that
 * pre-hides [data-reveal] never applies (see globals.css).
 *
 * Re-runs on route change: matchMedia teardown kills the old page's triggers,
 * and the new page's elements get fresh ones.
 */
export function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // --- Staggered rise reveals -------------------------------------
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (reveals.length > 0) {
        gsap.set(reveals, { y: 24 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.08,
              overwrite: true,
              // Leave inline opacity (it overrides the CSS pre-hide) but drop
              // the inline transform so CSS hover/active transforms work again.
              clearProps: "transform",
            }),
        });
      }

      // --- Experience timeline: line draws down as you scroll ----------
      const line = document.querySelector<HTMLElement>("[data-timeline-line]");
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-timeline]",
              start: "top 70%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          },
        );
      }
      gsap.utils
        .toArray<HTMLElement>("[data-timeline-dot]")
        .forEach((dot) => {
          gsap.fromTo(
            dot,
            { scale: 0.3, autoAlpha: 0.3 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.45,
              ease: "back.out(2.2)",
              scrollTrigger: { trigger: dot, start: "top 72%" },
            },
          );
        });

      // --- Hero cluster: drifts slightly as it scrolls away ------------
      const cluster = document.querySelector<HTMLElement>("[data-hero-cluster]");
      if (cluster) {
        gsap.to(cluster, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: cluster,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });

    // Image-driven layout settles after load; recalculate trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
