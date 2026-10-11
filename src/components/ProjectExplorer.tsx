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
import { useActiveLens } from "@/components/ui/useActiveLens";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const GAP = 18;

/**
 * Cards are rendered on the server; this island owns filtering and the
 * masonry layout. Like the original site's Isotope grid, filtered-out cards
 * scale and fade away in place while the rest glide to their new spots.
 * Without JavaScript the cards fall back to a plain CSS grid.
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
    const cols = width >= 960 ? 3 : width >= 600 ? 2 : 1;
    const colWidth = (width - GAP * (cols - 1)) / cols;
    // Write all widths first, then read all heights: one reflow, not eleven.
    slots.forEach((s) => (s.style.width = `${colWidth}px`));
    const heights = slots.map((s) => s.offsetHeight);
    const columns = new Array(cols).fill(0);
    slots.forEach((s, i) => {
      if (s.dataset.hidden === "true") return;
      let c = 0;
      for (let k = 1; k < cols; k++) if (columns[k] < columns[c] - 1) c = k;
      s.style.setProperty("--x", `${c * (colWidth + GAP)}px`);
      s.style.setProperty("--y", `${columns[c]}px`);
      columns[c] += heights[i] + GAP;
    });
    el.style.height = `${Math.max(0, Math.max(...columns) - GAP)}px`;
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

  // Card heights can change (fonts, image decode, resize): keep the grid true.
  useEffect(() => {
    const el = grid.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    });
    observer.observe(el);
    Array.from(el.children).forEach((s) => observer.observe(s));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [layout]);

  // The glass pill under the active filter springs to each new choice.
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
          <span className="filter-lens" aria-hidden="true" />
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
