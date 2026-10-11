"use client";
import { useState } from "react";
export function SkillsMarquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <div className="marquee-controls">
        <button onClick={() => setPaused((v) => !v)} aria-pressed={paused}>
          {paused ? "Play" : "Pause"} technology marquee
        </button>
      </div>
      <div
        className="marquee"
        data-paused={paused}
        tabIndex={0}
        role="region"
        aria-label="Technology highlights"
      >
        <div className="marquee-track">
          <ul>
            {items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <ul aria-hidden="true">
            {items.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
