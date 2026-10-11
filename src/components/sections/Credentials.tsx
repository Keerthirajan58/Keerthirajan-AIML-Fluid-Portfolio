import { getCertifications, getPublications } from "@/lib/projects";
import { Section } from "@/components/ui/Section";
import {
  CertificateIcon,
  BookIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { localContent, type PortfolioContent } from "@/content/repository";
export function Credentials({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  return (
    <Section
      id="credentials"
      eyebrow="05 / Continuing to learn"
      title="Research & credentials."
    >
      <div className="credentials-layout">
        <div className="publications-panel">
          <h3>
            <span>01</span>Publications
          </h3>
          {getPublications(content.projects).map((p) => (
            <article className="publication" key={p.slug}>
              <span className="publication-icon">
                <BookIcon />
              </span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="certifications-panel">
          <h3>
            <span>02</span>Certifications
          </h3>
          <ul className="cert-grid">
            {getCertifications(content.projects).map((p) => (
              <li key={p.slug}>
                <a
                  className="cert-card"
                  href={p.links.credential}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="credential-icon">
                    <CertificateIcon />
                  </span>
                  <span>
                    {p.title}
                    <small>
                      {p.description.replace(
                        / (course |project |web development course |database course )?certification\.$/,
                        "",
                      )}
                    </small>
                  </span>
                  <ArrowUpRightIcon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
