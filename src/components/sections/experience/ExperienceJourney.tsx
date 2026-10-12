"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the experience timeline: the crimson line fills with reading
 * progress, a pin rides its tip, and the role crossing the middle of the
 * screen becomes active. When the pin reaches a company badge it docks at
 * the badge's rim (never over the logo), the badge sends out an impact
 * ripple, and the pin pops back out below once the line moves past.
 * Writes attributes/CSS variables directly, so scrolling never re-renders.
 */
export function ExperienceJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    // The badge the pin is docked in; undefined until the first measurement,
    // so arriving mid-page never fires an impact.
    let docked: number | null | undefined;
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
      // The tip of the line, which runs 10px in from each end.
      const tip = 10 + progress * Math.max(0, box.height - 20);
      let dock: number | null = null,
        pinY = tip;
      el.querySelectorAll<HTMLElement>(".timeline-node").forEach((node, i) => {
        const r = node.getBoundingClientRect();
        const top = r.top - box.top,
          bottom = r.bottom - box.top;
        if (tip >= top - 6 && tip <= bottom + 6) {
          dock = i;
          pinY = top - 6;
        }
      });
      el.style.setProperty("--cursor-y", `${pinY.toFixed(1)}px`);
      el.querySelector(".timeline-cursor")?.toggleAttribute(
        "data-docked",
        dock !== null,
      );
      if (docked !== undefined && dock !== null && dock !== docked) {
        const node = el.querySelectorAll<HTMLElement>(".timeline-node")[dock];
        // Restart the ripple even if this badge was hit a moment ago.
        node.removeAttribute("data-impact");
        void node.offsetWidth;
        node.setAttribute("data-impact", "");
      }
      docked = dock;
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
      <span className="timeline-cursor" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
