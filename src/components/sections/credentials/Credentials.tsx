import Image from "next/image";
import { localContent } from "@/content";
import { copy, sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { DepthCard } from "@/components/ui/DepthCard";
import { ArrowUpRightIcon, BookIcon } from "@/components/ui/icons";
import { logoShape, monogram } from "@/lib/credentials";
import { yearOf } from "@/lib/dates";
import { getImageSize } from "@/lib/server/images";

export function Credentials({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { publications, certifications } = content;
  if (!publications.length && !certifications.length) return null;
  const { eyebrow, title } = sectionInfo("credentials");
  return (
    <Section id="credentials" eyebrow={eyebrow} title={title}>
      <div className="credentials-layout">
        {publications.length > 0 && (
          <div>
            <h3 className="sub-title">{copy.credentials.publications}</h3>
            <div className="publication-list">
              {publications.map((p) => (
                <DepthCard className="publication surface reveal" key={p.title}>
                  <div className="paper-art" aria-hidden="true">
                    <span className="paper-year">{yearOf(p.date)}</span>
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
                      Conference paper{p.date && ` · ${p.date}`}
                    </p>
                    <h4>{p.title}</h4>
                    <p className="publication-venue">{p.venue}</p>
                  </div>
                </DepthCard>
              ))}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <h3 className="sub-title">{copy.credentials.certifications}</h3>
            <ul className="cert-grid">
              {certifications.map((c, i) => {
                const logo = c.logo && { src: c.logo, ...getImageSize(c.logo) };
                return (
                  <li key={c.title + c.issuer} className="reveal">
                    <a
                      className="cert-card surface"
                      href={c.url}
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
                          monogram(c.issuer)
                        )}
                      </span>
                      <span className="cert-title">{c.title}</span>
                      <span className="cert-issuer">{c.issuer}</span>
                      <span className="cert-cta" aria-hidden="true">
                        View credential <ArrowUpRightIcon />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
