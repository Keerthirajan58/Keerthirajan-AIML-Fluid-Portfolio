"use client";
import { useRef, useState, type CSSProperties } from "react";
import { useChipIndicators } from "@/components/ui/useChipIndicators";
import type { SkillBubble } from "@/lib/skills";

/** Areas get a colour each, in order (`--tone-1` … `--tone-5`). */
const toneOf = (index: number) => (Math.max(0, index) % 5) + 1;

/**
 * A compact, interactive skills panel: every skill is a bubble sized by how
 * often it appears in real projects and roles, with a dot in its area's
 * colour. Each area's tab is filled with that colour; choosing one slides
 * the ink pill onto it and brings its bubbles forward with a quick pop;
 * hovering a bubble shows where it was used.
 */
export function SkillsCloud({
  categories,
  skills,
  note,
}: {
  categories: string[];
  skills: SkillBubble[];
  /** A line under the panel explaining the bubbles. */
  note?: string;
}) {
  const [active, setActive] = useState("all");
  // Bumped on every change so the bubbles' pop replays.
  const [wave, setWave] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  useChipIndicators(tabs, active);
  const tabList = ["all", ...categories];
  const count = (c: string) =>
    c === "all"
      ? skills.length
      : skills.filter((s) => s.categories.includes(c)).length;
  const isOn = (s: SkillBubble) =>
    active === "all" || s.categories.includes(active);
  const lit = skills.filter(isOn).map((s) => s.name);
  const tabLabel = (c: string) => (
    <>
      {c === "all" ? "All" : c}
      <span aria-hidden="true">{count(c)}</span>
    </>
  );
  return (
    <div className="skills-panel surface reveal">
      <div
        className="skill-tabs"
        role="group"
        aria-label="Highlight skills by area"
        ref={tabs}
      >
        {tabList.map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            data-tone={c === "all" ? undefined : toneOf(categories.indexOf(c))}
            aria-pressed={active === c}
            aria-controls="skill-cloud"
            onClick={() => {
              if (c === active) return;
              setActive(c);
              setWave((w) => w + 1);
            }}
          >
            {tabLabel(c)}
          </button>
        ))}
        <div className="chip-ink" aria-hidden="true">
          {tabList.map((c) => (
            <span className="chip" key={c}>
              {tabLabel(c)}
            </span>
          ))}
        </div>
        <span className="filter-lens" aria-hidden="true" />
      </div>
      <ul
        className="skill-cloud"
        id="skill-cloud"
        aria-label={active === "all" ? "All skills" : `${active} skills`}
        data-wave={wave ? (wave % 2 ? "a" : "b") : undefined}
      >
        {skills.map((s, i) => {
          const on = isOn(s);
          return (
            <li
              key={s.name}
              className="skill-bubble"
              data-size={Math.min(3, s.evidence.length)}
              data-tone={toneOf(categories.indexOf(s.categories[0]))}
              data-dim={on ? undefined : "true"}
              data-lit={on && active !== "all" ? "true" : undefined}
              style={
                {
                  "--i": i,
                  "--k": Math.max(0, lit.indexOf(s.name)),
                } as CSSProperties
              }
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
      {note && <p className="skills-note">{note}</p>}
    </div>
  );
}
