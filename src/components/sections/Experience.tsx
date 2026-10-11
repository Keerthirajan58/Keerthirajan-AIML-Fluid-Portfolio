import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { CompanyMark } from "@/components/ui/CompanyMark";
import { ExperienceJourney } from "@/components/ExperienceJourney";
export function Experience({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  return (
    <Section
      id="experience"
      eyebrow="02 / Experience"
      title="Where I've put it to work."
    >
      <ExperienceJourney
        steps={content.experience.map((job) => ({
          company: job.company,
          dates: job.dates,
          mark: <CompanyMark company={job.company} />,
        }))}
      >
        <ol className="experience-list">
          {content.experience.map((job, i) => (
            <li
              id={`role-${i}`}
              tabIndex={-1}
              className={`experience-card company-${i}`}
              key={job.company}
            >
              <div className="job-identity">
                <CompanyMark company={job.company} />
                <div>
                  <span className="eyebrow">{job.dates}</span>
                  <h3>{job.company}</h3>
                  <p className="job-location">{job.location}</p>
                </div>
              </div>
              <div className="job-work">
                <h4>{job.role}</h4>
                <ul className="result-list">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </ExperienceJourney>
    </Section>
  );
}
