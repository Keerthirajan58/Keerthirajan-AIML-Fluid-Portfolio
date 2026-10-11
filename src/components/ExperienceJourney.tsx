"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function ExperienceJourney({
  steps,
  children,
}: {
  steps: { company: string; dates: string; mark: ReactNode }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards =
        root.current?.querySelectorAll<HTMLElement>(".experience-card");
      if (!cards?.length) return;
      let nearest = 0,
        distance = Infinity;
      cards.forEach((card, index) => {
        const box = card.getBoundingClientRect();
        // Select the card containing the reading line, or the nearest edge
        // between cards. Measuring title positions misidentifies short cards
        // after native scroll-padding / scroll-margin offsets are applied.
        const readingLine = window.innerHeight * 0.5;
        const next = Math.max(
          box.top - readingLine,
          readingLine - (box.top + box.height),
          0,
        );
        if (next < distance) {
          distance = next;
          nearest = index;
        }
      });
      setActive(nearest);
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
    <div
      className="experience-journey"
      ref={root}
      style={
        {
          "--journey-progress":
            steps.length > 1 ? active / (steps.length - 1) : 0,
        } as CSSProperties
      }
    >
      <nav className="journey-tracker" aria-label="Experience timeline">
        <p className="eyebrow">The journey</p>
        <div className="journey-stops">
          {steps.map((step, index) => (
            <a
              href={`#role-${index}`}
              key={step.company}
              aria-current={active === index ? "step" : undefined}
              onClick={() => {
                setActive(index);
              }}
            >
              {step.mark}
              <span>
                <strong>{step.company}</strong>
                <small>{step.dates}</small>
              </span>
              <span className="journey-dot" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="journey-caption">
          <span>{String(active + 1).padStart(2, "0")}</span> /{" "}
          {String(steps.length).padStart(2, "0")}
        </p>
      </nav>
      {children}
    </div>
  );
}
