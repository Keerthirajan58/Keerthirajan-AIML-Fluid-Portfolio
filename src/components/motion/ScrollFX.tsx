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
    // Declared here (not inside matchMedia's callback) so the cleanup below
    // can always reach them, whether or not the reduced-motion query matched.
    let revealObserver: IntersectionObserver | undefined;
    const cleanupFns: (() => void)[] = [];

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // --- Staggered rise reveals ---------------------------------------
      // Deliberately IntersectionObserver-driven, not ScrollTrigger-driven:
      // ScrollTrigger.batch's onEnter/onLeave are scroll-*event*-based, so a
      // big instant jump (keyboard End/PageDown, browser scroll restoration,
      // fragment-navigation on load, Lenis/native-scroll desync) can skip
      // past a trigger's threshold without ever firing it, leaving real
      // content permanently invisible. IntersectionObserver is computed from
      // actual layout/paint each time the browser settles, so it can't be
      // skipped — and it fires immediately for anything already in view on
      // `observe()`, which covers "already scrolled down on load" too.
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (reveals.length > 0) {
        gsap.set(reveals, { y: 24 });
        let i = 0;
        const animateIn = (el: HTMLElement, immediate: boolean) =>
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: immediate ? 0 : 0.7,
            ease: "power2.out",
            delay: immediate ? 0 : (i++ % 4) * 0.06,
            overwrite: true,
            // Leave inline opacity (overrides the CSS pre-hide) but drop the
            // inline transform so CSS hover/active states keep working.
            clearProps: "transform",
          });

        revealObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              revealObserver!.unobserve(entry.target);
              animateIn(entry.target as HTMLElement, false);
            }
          },
          { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
        );

        // An *instant* scroll jump (hash-fragment navigation on load — how
        // the header's cross-page "/#section" links work when you're not
        // already on "/"; also browser back/forward scroll restoration)
        // moves straight from the old position to the new one with no
        // intermediate frames. Anything the jump lands on or passes over
        // genuinely never intersects at any single moment, so
        // IntersectionObserver alone would leave it stuck invisible. Anything
        // not entirely below the fold at setup time — already visible or
        // already scrolled past — gets shown immediately, no animation;
        // only elements still below the fold get the lazy, animated reveal.
        const sweep = () => {
          const viewportBottom = window.innerHeight;
          reveals.forEach((el) => {
            if (getComputedStyle(el).opacity !== "0") return;
            if (el.getBoundingClientRect().top < viewportBottom) {
              revealObserver!.unobserve(el);
              animateIn(el, true);
            }
          });
        };
        sweep();
        reveals.forEach((el) => {
          if (getComputedStyle(el).opacity === "0") revealObserver!.observe(el);
        });
        // Belt-and-suspenders for any other instant jump mid-session (e.g. a
        // keyboard Home/End press the browser doesn't animate): re-sweep
        // whenever scrolling settles. Cheap — fires once per scroll gesture,
        // not per frame.
        ScrollTrigger.addEventListener("scrollEnd", sweep);
        cleanupFns.push(() =>
          ScrollTrigger.removeEventListener("scrollEnd", sweep),
        );
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
      revealObserver?.disconnect();
      cleanupFns.forEach((fn) => fn());
      mm.revert();
    };
  }, [pathname]);

  return null;
}
