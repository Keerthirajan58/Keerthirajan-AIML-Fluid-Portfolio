import { experience, education } from "@/content/data";
import { Section } from "@/components/ui/Section";

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I've worked">
      <ol className="relative border-l border-ink/10 pl-6 sm:pl-8">
        {experience.map((job) => (
          <li key={`${job.company}-${job.dates}`} className="mb-10 last:mb-0">
            <span
              className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-paper bg-crimson"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-ink-muted">{job.dates}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink sm:text-xl">
              {job.role} ·{" "}
              <span className="text-crimson">{job.company}</span>
            </h3>
            <p className="text-sm text-ink-muted">{job.location}</p>
            <ul className="mt-3 space-y-2">
              {job.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-sm leading-6 text-ink-muted sm:text-base"
                >
                  {b}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <h3 className="mb-6 mt-14 text-xs font-semibold uppercase tracking-[0.22em] text-crimson">
        Education
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {education.map((e) => (
          <div
            key={e.degree}
            className="rounded-2xl border border-ink/10 bg-surface p-5"
          >
            <p className="text-sm font-medium text-ink-muted">{e.dates}</p>
            <h4 className="mt-1 font-display text-base font-semibold text-ink">
              {e.degree}
            </h4>
            <p className="text-sm text-ink-muted">{e.institution}</p>
            <ul className="mt-3 space-y-2">
              {e.bullets.map((b, i) => (
                <li key={i} className="text-sm leading-6 text-ink-muted">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
