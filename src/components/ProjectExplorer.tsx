"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  availableProjectFilters,
  matchesProjectFilter,
  type ProjectFilter,
} from "@/lib/projectFilters";
import { columnWidth, columnsFor, placeGrid } from "@/lib/masonry";
import { useActiveLens } from "@/components/ui/useActiveLens";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const GAP = 18;

/**
 * Cards are rendered on the server; this island owns filtering and layout.
 * The grid keeps standard rows (each row as tall as its tallest card), and
 * like the original site's Isotope grid, filtered-out cards scale and fade
 * away in place while the rest glide to their new spots. Without JavaScript
 * the cards fall back to a plain CSS grid.
 */
export function ProjectExplorer({
  items,
}: {
  items: { slug: string; filters: string[]; card: ReactNode }[];
}) {
  const [selected, setSelected] = useState<ProjectFilter>("all");
  const grid = useRef<HTMLDivElement>(null);
  const filterBar = useRef<HTMLDivElement>(null);
  const wasHidden = useRef<Set<string>>(new Set());
  const visible = items.filter((item) =>
    matchesProjectFilter(item.filters, selected),
  );

  const layout = useCallback(() => {
    const el = grid.current;
    if (!el) return;
    const width = el.clientWidth;
    if (!width) return;
    const slots = Array.from(el.children) as HTMLElement[];
    const shown = slots.filter((s) => s.dataset.hidden !== "true");
    const cols = columnsFor(width);
    const colW = columnWidth(width, cols, GAP);
    // Write widths and clear heights first, then read every natural height:
    // one reflow for the whole grid, not one per card.
    shown.forEach((s) => {
      s.style.width = `${colW}px`;
      s.style.height = "";
    });
    const { placements, height } = placeGrid(
      shown.map((s) => s.offsetHeight),
      cols,
      colW,
      GAP,
    );
    shown.forEach((s, i) => {
      s.style.height = `${placements[i].height}px`;
      s.style.setProperty("--x", `${placements[i].x}px`);
      s.style.setProperty("--y", `${placements[i].y}px`);
    });
    el.style.height = `${height}px`;
    if (!el.dataset.masonry) {
      el.dataset.masonry = "true";
      // Enable transitions only after the first placement, so nothing flies in.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.dataset.animate = "true";
        }),
      );
    }
  }, []);

  // Re-layout on filter change. Cards coming back appear in their new spot
  // (no slide from where they were hidden); everything else glides.
  useIsoLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const slots = Array.from(el.children) as HTMLElement[];
    const entering = slots.filter(
      (s) =>
        s.dataset.hidden !== "true" &&
        wasHidden.current.has(s.dataset.slug ?? ""),
    );
    entering.forEach((s) => (s.dataset.entering = "true"));
    layout();
    wasHidden.current = new Set(
      slots
        .filter((s) => s.dataset.hidden === "true")
        .map((s) => s.dataset.slug ?? ""),
    );
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        entering.forEach((s) => delete s.dataset.entering),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [selected, layout]);

  // Width changes and late web fonts change card heights: keep rows true.
  // (Card images use a fixed frame, so image loads never move anything.)
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    };
    void document.fonts?.ready.then(schedule);
    if (typeof ResizeObserver === "undefined")
      return () => cancelAnimationFrame(frame);
    let width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      schedule();
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [layout]);

  // A glass lens rides on top of the chosen filter.
  useActiveLens(filterBar, selected);

  return (
    <div className="project-explorer">
      <noscript>
        <style>{".project-toolbar,.project-notes-trigger{display:none}"}</style>
      </noscript>
      <div className="project-toolbar">
        <div
          className="project-filters"
          role="group"
          aria-label="Filter projects"
          ref={filterBar}
        >
          {availableProjectFilters(items).map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected === filter.id}
              aria-controls="project-results"
              onClick={() => setSelected(filter.id)}
            >
              {filter.label}
              <span aria-hidden="true">
                {filter.count.toString().padStart(2, "0")}
              </span>
            </button>
          ))}
          <span className="filter-lens" aria-hidden="true" />
        </div>
        <p className="project-count" role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div className="project-grid" id="project-results" ref={grid}>
        {items.map((item) => {
          const hidden = !matchesProjectFilter(item.filters, selected);
          return (
            <div
              className="project-slot"
              key={item.slug}
              data-slug={item.slug}
              data-hidden={hidden ? "true" : undefined}
              aria-hidden={hidden || undefined}
              inert={hidden}
            >
              {item.card}
            </div>
          );
        })}
      </div>
      {!visible.length && (
        <p className="empty-projects">No projects in this category yet.</p>
      )}
    </div>
  );
}
