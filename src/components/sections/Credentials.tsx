import Image from "next/image";
import { getCertifications, getPublications } from "@/lib/projects";
import { certLogo } from "@/lib/certLogos";
import { Section } from "@/components/ui/Section";
import { BookIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { DepthCard } from "@/components/ui/DepthCard";
import { localContent, type PortfolioContent } from "@/content/repository";

/** "Presented at the X, Y, India (May 2023)." → venue + date, unchanged text. */
function describe(description: string) {
  const date = description.match(/\(([^)]*\d{4})\)/)?.[1] ?? "";
  const venue = description
    .replace(/^Presented at (the )?/, "")
    .replace(/\s*\([^)]*\d{4}\)\.?\s*$/, "");
  return { date, year: date.match(/\d{4}/)?.[0] ?? "", venue };
}

const issuerOf = (description: string) =>
  description.replace(
    / (course |project |web development course |database course )?certification\.$/,
    "",
  );

/** Square marks get the most height, long wordmarks the least. */
const logoShape = ({ width, height }: { width: number; height: number }) =>
  width / height <= 1.6 ? "mark" : width / height <= 3 ? "compact" : "wordmark";

const monogram = (issuer: string) => {
  const words = issuer.split(/\s+/).filter(Boolean);
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : issuer.slice(0, 2);
};

export function Credentials({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  return (
    <Section
      id="credentials"
      eyebrow="Credentials"
      title="Research & certifications"
    >
      <div className="credentials-layout">
        <div>
          <h3 className="sub-title">Publications</h3>
          <div className="publication-list">
            {getPublications(content.projects).map((p) => {
              const { date, year, venue } = describe(p.description);
              return (
                <DepthCard className="publication surface reveal" key={p.slug}>
                  <div className="paper-art" aria-hidden="true">
                    <span className="paper-year">{year}</span>
                    <span className="paper-sheet">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <div className="publication-body">
                    <p className="publication-kicker">
                      <BookIcon aria-hidden="true" />
                      Conference paper{date && ` · ${date}`}
                    </p>
                    <h4>{p.title}</h4>
                    <p className="publication-venue">{venue}</p>
                  </div>
                </DepthCard>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="sub-title">Certifications</h3>
          <ul className="cert-grid">
            {getCertifications(content.projects).map((p, i) => {
              const issuer = issuerOf(p.description);
              const logo = certLogo(p.slug);
              return (
                <li key={p.slug} className="reveal">
                  <a
                    className="cert-card surface"
                    href={p.links.credential}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tone={i % 4}
                  >
                    <span
                      className="cert-mark"
                      data-logo={logo ? logoShape(logo) : undefined}
                      aria-hidden="true"
                    >
                      {logo ? (
                        <Image
                          src={logo.src}
                          width={logo.width}
                          height={logo.height}
                          alt=""
                          unoptimized
                        />
                      ) : (
                        monogram(issuer)
                      )}
                    </span>
                    <span className="cert-title">{p.title}</span>
                    <span className="cert-issuer">{issuer}</span>
                    <span className="cert-cta" aria-hidden="true">
                      View credential <ArrowUpRightIcon />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
