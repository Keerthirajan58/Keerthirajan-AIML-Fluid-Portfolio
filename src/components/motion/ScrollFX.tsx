"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useMotionEnabled } from "./useMotionEnabled";
export function ScrollFX() {
  const path = usePathname(),
    enabled = useMotionEnabled();
  useEffect(() => {
    if (!enabled) return;
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Transform-only: all copy is visible before initialization and after teardown.
        const context = gsap.context(() => {
          gsap.to(".hero-copy", {
            y: -64,
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
          gsap.to(".portrait img", {
            yPercent: 8,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: "#about",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
          gsap.utils.toArray<HTMLElement>(".project-image img").forEach((el) =>
            gsap.fromTo(
              el,
              { scale: 1.09 },
              {
                scale: 1,
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "center center",
                  scrub: 0.7,
                },
              },
            ),
          );
          gsap.utils.toArray<HTMLElement>(".experience-card").forEach((el) =>
            gsap.fromTo(
              el,
              { y: 18 },
              {
                y: 0,
                scrollTrigger: {
                  trigger: el,
                  start: "top 65%",
                  end: "bottom 45%",
                  scrub: true,
                },
              },
            ),
          );
        });
        return () => context.revert();
      },
    );
    return () => mm.revert();
  }, [path, enabled]);
  return null;
}
