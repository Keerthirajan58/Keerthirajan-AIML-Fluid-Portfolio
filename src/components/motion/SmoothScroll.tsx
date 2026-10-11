"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { registerScroller } from "@/lib/smoothScroll";
import { useMotionEnabled } from "./useMotionEnabled";

/** Desktop wheel smoothing; also the engine AnchorGlide and the header use. */
export function SmoothScroll() {
  const enabled = useMotionEnabled();
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
    });
    registerScroller(lenis);
    return () => {
      registerScroller(null);
      lenis.destroy();
    };
  }, [enabled]);
  return null;
}
