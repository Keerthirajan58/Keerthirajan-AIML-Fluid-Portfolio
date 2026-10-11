"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "./useMotionEnabled";
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
    let animation: Animation | undefined,
      cancelled = false;
    // Taxi never creates a Core, intercepts links, fetches pages or changes the DOM.
    void import("@unseenco/taxi")
      .then(({ Transition }) => {
        if (cancelled || !main.animate) return;
        class Arrival extends Transition {
          onEnter({ to, done }: { to: HTMLElement; done: () => void }) {
            animation = to.animate(
              [
                { transform: "translateY(10px)" },
                { transform: "translateY(0)" },
              ],
              { duration: 240, easing: "cubic-bezier(.22,1,.36,1)" },
            );
            void animation.finished.catch(() => {}).finally(done);
            setTimeout(done, 300);
          }
        }
        return new Arrival({ wrapper: main }).enter({
          to: main,
          trigger: false,
        });
      })
      .catch(() => {
        /* Navigation has already succeeded: motion is optional. */
      });
    return () => {
      cancelled = true;
      animation?.cancel();
    };
  }, [path, enabled]);
  return null;
}
