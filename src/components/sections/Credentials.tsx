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
  const publications = getPublications(content.projects);
  const certifications = getCertifications(content.projects);
  return (
    <Section
      id="credentials"
      eyebrow="Credentials"
      title="Research and certifications"
    >
      <div className="credentials-layout">
        <div>
          <h3 className="sub-title">
            Publications <span>{publications.length}</span>
          </h3>
          <div className="publication-list">
            {publications.map((p) => (
              <article className="publication reveal" key={p.slug}>
                <span className="tile-icon">
                  <BookIcon />
                </span>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h3 className="sub-title">
            Certifications <span>{certifications.length}</span>
          </h3>
          <ul className="cert-grid">
            {certifications.map((p) => (
              <li key={p.slug} className="reveal">
                <a
                  className="cert-card"
                  href={p.links.credential}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="tile-icon">
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
