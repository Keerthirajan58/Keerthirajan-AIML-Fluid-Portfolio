"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the experience timeline: the crimson line fills with reading
 * progress, and the role crossing the middle of the screen becomes active.
 * Writes attributes/CSS variables directly, so scrolling never re-renders.
 */
export function ExperienceJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = root.current;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>(".timeline-item");
      if (!items.length) return;
      const readingLine = window.innerHeight * 0.5;
      let nearest = 0,
        distance = Infinity;
      items.forEach((item, index) => {
        const box = item.getBoundingClientRect();
        // Distance from the reading line to the item's bounds (0 inside it).
        const next = Math.max(
          box.top - readingLine,
          readingLine - box.bottom,
          0,
        );
        if (next < distance) {
          distance = next;
          nearest = index;
        }
      });
      items.forEach((item, index) => {
        item.toggleAttribute("data-active", index === nearest);
        item.toggleAttribute("data-reached", index <= nearest);
      });
      const box = el.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (readingLine - box.top) / Math.max(1, box.height)),
      );
      el.style.setProperty("--progress", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <div className="experience-journey" ref={root}>
      {children}
    </div>
  );
}
