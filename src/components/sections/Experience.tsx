import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { CompanyMark } from "@/components/ui/CompanyMark";
import { ExperienceJourney } from "@/components/ExperienceJourney";
import { MapPinIcon } from "@/components/ui/icons";
import { splitByTerms } from "@/lib/highlight";

const endYear = (dates: string) => dates.match(/(\d{4})\s*$/)?.[1] ?? "";

export function Experience({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  // Bold the tools recruiters scan for, using the skills list as the glossary.
  const terms = content.skills.flatMap((group) => group.skills);
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Where I've worked"
      lede="From web development to modeling and evaluation work on Siri."
    >
      <ExperienceJourney>
        <ol className="timeline">
          {content.experience.map((job, i) => (
            <li
              id={`role-${i}`}
              tabIndex={-1}
              className="timeline-item"
              key={job.company}
            >
              <div className="timeline-when" aria-hidden="true">
                <span className="timeline-year">{endYear(job.dates)}</span>
              </div>
              <div className="timeline-node" aria-hidden="true">
                <CompanyMark company={job.company} />
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
