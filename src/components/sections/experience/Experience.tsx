import { localContent } from "@/content";
import { sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { MapPinIcon } from "@/components/ui/icons";
import { endYear } from "@/lib/dates";
import { splitByTerms } from "@/lib/highlight";
import { CompanyMark } from "./CompanyMark";
import { ExperienceJourney } from "./ExperienceJourney";

export function Experience({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { eyebrow, title, lede } = sectionInfo("experience");
  // Bold the tools recruiters scan for, using the skills list as the glossary.
  const terms = content.skills.flatMap((group) => group.skills);
  return (
    <Section id="experience" eyebrow={eyebrow} title={title} lede={lede}>
      <ExperienceJourney>
        <ol className="timeline">
          {content.experience.map((job, i) => (
            <li
              id={`role-${i}`}
              tabIndex={-1}
              className="timeline-item"
              key={`${job.company} ${job.dates}`}
            >
              <div className="timeline-when" aria-hidden="true">
                <span className="timeline-year">{endYear(job.dates)}</span>
              </div>
              <div className="timeline-node" aria-hidden="true">
                <CompanyMark logo={job.logo} />
              </div>
              <article className="timeline-card surface reveal">
                <header className="timeline-head">
                  <div>
                    <h3>{job.role}</h3>
                    <p className="job-org">
                      <strong>{job.company}</strong>
                      <span>
                        <MapPinIcon aria-hidden="true" />
                        {job.location}
                      </span>
                    </p>
                  </div>
                  <span className="job-dates">{job.dates}</span>
                </header>
                <ul className="result-list">
                  {job.bullets.map((b) => (
                    <li key={b}>
                      {splitByTerms(b, terms).map((part, k) =>
                        part.hit ? (
                          <strong key={k}>{part.text}</strong>
                        ) : (
                          part.text
                        ),
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </ExperienceJourney>
    </Section>
  );
}
