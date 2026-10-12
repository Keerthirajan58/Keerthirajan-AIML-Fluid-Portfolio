"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
import { SECTIONS } from "@/lib/sections";

/**
 * The page background, everywhere: the soft Clear Air light field. Three
 * glows drift slowly; each home section re-composes them (CSS transitions
 * keyed on data-scene), and a crimson ember gathers behind Contact. A faint
 * warm glow eases after a fine pointer. Only transforms and opacity change.
 */
export function Atmosphere() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const pointer = useMotionEnabled();
  const path = usePathname();
  const home = path === "/";

  // Each section re-composes the light as it reaches the middle of the screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!home || typeof IntersectionObserver === "undefined") {
      el.dataset.scene = home ? "hero" : "page";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) el.dataset.scene = entry.target.id;
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [home]);

  // The warm glow eases after a fine pointer (never on touch).
  useEffect(() => {
    const el = glow.current;
    if (!pointer || !el) return;
    let x = window.innerWidth * 0.5,
      y = window.innerHeight * 0.42,
      tx = x,
      ty = y,
      frame = 0;
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      el.style.transform = "";
    };
  }, [pointer]);

  return (
    <div
      className="atmosphere"
      aria-hidden="true"
      ref={root}
      data-scene={home ? "hero" : "page"}
      data-live={pointer ? "true" : undefined}
    >
      <span className="glow glow-a" />
      <span className="glow glow-b" />
      <span className="glow glow-c" />
      <span className="glow glow-ember" />
      <span className="glow glow-pointer" ref={glow} />
      <span className="grain" />
    </div>
  );
}
