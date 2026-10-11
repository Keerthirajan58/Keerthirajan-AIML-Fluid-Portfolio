"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getAnchorTarget } from "@/lib/navigation";
import { useMotionEnabled } from "./useMotionEnabled";
export function SmoothScroll() {
  const enabled = useMotionEnabled();
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const click = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const link =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const id = getAnchorTarget(link.href, location.href),
        target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", link.href);
      lenis.scrollTo(target, {
        offset: -88,
        duration: 0.7,
        onComplete: () => target.focus({ preventScroll: true }),
      });
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [enabled]);
  return null;
}
