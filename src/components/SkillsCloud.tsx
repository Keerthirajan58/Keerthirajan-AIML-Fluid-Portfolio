"use client";
import { useRef, useState, type CSSProperties } from "react";
import { useActiveLens } from "@/components/ui/useActiveLens";

export type SkillBubble = {
  name: string;
  categories: string[];
  /** Projects and roles whose stack lists this skill. */
  evidence: string[];
};

/**
 * A compact, interactive skills panel: every skill is a glass bubble sized by
 * how often it appears in real projects and roles. Choosing an area brings
 * its bubbles forward; hovering one shows where it was used.
 */
export function SkillsCloud({
  categories,
  skills,
}: {
  categories: string[];
  skills: SkillBubble[];
}) {
  const [active, setActive] = useState("all");
  const tabs = useRef<HTMLDivElement>(null);
  useActiveLens(tabs, active);
  const count = (c: string) =>
    c === "all"
      ? skills.length
      : skills.filter((s) => s.categories.includes(c)).length;
  return (
    <div className="skills-panel glass reveal">
      <div
        className="skill-tabs"
        role="group"
        aria-label="Highlight skills by area"
        ref={tabs}
      >
        <span className="filter-lens" aria-hidden="true" />
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            aria-controls="skill-cloud"
            onClick={() => setActive(c)}
          >
            {c === "all" ? "All" : c}
            <span aria-hidden="true">{count(c)}</span>
          </button>
        ))}
      </div>
      <ul
        className="skill-cloud"
        id="skill-cloud"
        aria-label={active === "all" ? "All skills" : `${active} skills`}
      >
        {skills.map((s, i) => {
          const on = active === "all" || s.categories.includes(active);
          return (
            <li
              key={s.name}
              className="skill-bubble"
              data-size={Math.min(3, s.evidence.length)}
              data-dim={on ? undefined : "true"}
              style={{ "--i": i } as CSSProperties}
            >
              {s.name}
              {s.evidence.length > 0 && (
                <>
                  <span className="sr-only">
                    {` (used in ${s.evidence.join(", ")})`}
                  </span>
                  <span className="skill-evidence" aria-hidden="true">
                    <b>Used in</b>
                    {s.evidence.join(" · ")}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <p className="skills-note">
        Bigger bubbles appear in more of my projects and roles. Hover one to see
        where.
      </p>
    </div>
  );
}
