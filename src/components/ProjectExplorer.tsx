"use client";
import { useState, type ReactNode } from "react";
import {
  availableProjectFilters,
  matchesProjectFilter,
  type ProjectFilter,
} from "@/lib/projectFilters";

/** Cards are rendered on the server; this small island owns only filtering. */
export function ProjectExplorer({
  items,
}: {
  items: { slug: string; filters: string[]; card: ReactNode }[];
}) {
  const [selected, setSelected] = useState<ProjectFilter>("all");
  const visible = items.filter((item) =>
    matchesProjectFilter(item.filters, selected),
  );
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
        </div>
        <p className="project-count" role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div className="project-grid" id="project-results">
        {visible.map((item) => (
          <div className="project-slot" key={item.slug}>
            {item.card}
          </div>
        ))}
      </div>
      {!visible.length && (
        <p className="empty-projects">No projects in this category yet.</p>
      )}
    </div>
  );
}
