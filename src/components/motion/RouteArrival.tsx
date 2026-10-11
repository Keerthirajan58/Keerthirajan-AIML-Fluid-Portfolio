"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "./useMotionEnabled";
/** Next owns routing; this only nudges the new page in after it has rendered. */
export function RouteArrival() {
  const path = usePathname(),
    previous = useRef(path),
    enabled = useMotionEnabled();
  useEffect(() => {
    if (previous.current === path) return;
    previous.current = path;
    const main = document.getElementById("main");
    if (!main) return;
    if (!location.hash) main.focus({ preventScroll: true });
    if (!enabled) return;
    let animation: Animation | undefined;
    try {
      animation = main.animate(
        [{ transform: "translateY(10px)" }, { transform: "translateY(0)" }],
        { duration: 240, easing: "cubic-bezier(.22,1,.36,1)" },
      );
    } catch {
      /* Navigation has already succeeded: motion is optional. */
    }
    return () => animation?.cancel();
  }, [path, enabled]);
  return null;
}
