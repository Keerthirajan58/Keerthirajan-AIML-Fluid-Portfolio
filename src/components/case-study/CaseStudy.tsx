import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CaseStudy as CaseStudyContent, Project } from "@/content/types";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  AwardIcon,
  BookIcon,
  DevpostIcon,
  GitHubIcon,
} from "@/components/ui/icons";
import {
  chaptersOf,
  parentOf,
  projectLinks,
  type linkOrder,
} from "@/lib/projects";
import { getImageSize } from "@/lib/server/images";
import { ProjectGallery } from "./ProjectGallery";

/** Project links become real buttons: GitHub in ink, Devpost in its teal. */
const linkStyles: Record<
  (typeof linkOrder)[number],
  { label: string; icon: ReactNode }
> = {
  github: { label: "View on GitHub", icon: <GitHubIcon /> },
  devpost: { label: "View on Devpost", icon: <DevpostIcon /> },
  blog: { label: "Read the write-up", icon: <BookIcon /> },
};

function BackToWork() {
  return (
    <Link href="/#projects" className="back-link">
      <ArrowLeftIcon width={16} height={16} />
      Back to work
    </Link>
  );
}

/** A project's case-study page: header, story sections and gallery. */
export function CaseStudy({
  project: p,
  caseStudy: cs,
  projects,
}: {
  project: Project;
  caseStudy: CaseStudyContent;
  /** All projects, to link chapters both ways. */
  projects: readonly Project[];
}) {
  const links = projectLinks(p);
  const parent = parentOf(p, projects);
  return (
    <article className="case-study">
      <header className="case-hero shell">
        <BackToWork />
        <p className="eyebrow">{p.badge}</p>
        <h1>{p.title}</h1>
        <p className="case-description">{p.description}</p>
        {p.achievement && (
          <p className="achievement">
            <span className="chip-icon">
              <AwardIcon />
            </span>
            {p.achievement.label} · {p.achievement.detail}
          </p>
        )}
        <dl className="case-meta">
          <div>
            <dt>Focus</dt>
            <dd>{cs.focus}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{cs.timeline}</dd>
          </div>
        </dl>
        {links.length > 0 && (
          <div className="case-actions">
            {links.map(({ kind, href }) => (
              <a
                key={kind}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="case-action"
                data-kind={kind}
              >
                {linkStyles[kind].icon}
                {linkStyles[kind].label}
                <ArrowUpRightIcon width={14} height={14} />
              </a>
            ))}
          </div>
        )}
        <ul className="tag-list">
          {(cs.tech ?? p.tags).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {chaptersOf(p, projects).map(
          (next) =>
            next.chapter && (
              <Link
                key={next.slug}
                href={`/projects/${next.slug}`}
                className="related-mini"
              >
                <span className="chip-icon">
                  <AwardIcon />
                </span>
                <span>
                  <small>The next chapter</small>
                  {next.chapter.teaser}
                </span>
                <ArrowUpRightIcon />
              </Link>
            ),
        )}
        {parent && p.chapter && (
          <Link href={`/projects/${parent.slug}`} className="related-mini">
            <span className="chip-icon">
              <ArrowLeftIcon />
            </span>
            <span>{p.chapter.back}</span>
          </Link>
        )}
      </header>
      <div className="case-sheet shell">
        <div className="case-body surface">
          {cs.sections.map((s) => (
            <section key={s.heading} className="reveal">
              <h2>{s.heading}</h2>
              <div className="case-section-body">
                {s.metrics && (
                  <dl className="case-metrics">
                    {s.metrics.map((m) => (
                      <div key={m.label}>
                        <dt>
                          <strong>{m.value}</strong>
                        </dt>
                        <dd>
                          <span>{m.label}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {s.body && <p>{s.body}</p>}
                {s.media && (
                  <Image
                    src={s.media.src}
                    alt={s.media.alt}
                    width={1200}
                    height={800}
                    sizes="(max-width: 767px) 100vw, 800px"
                    className="case-media"
                  />
                )}
                {s.bullets && (
                  <ul className="result-list">
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
        <div className="case-gallery">
          <h2 className="subheading">A closer look</h2>
          <ProjectGallery
            images={[cs.gallery.cover, ...cs.gallery.slides].map((src) => ({
              src,
              ...getImageSize(src),
            }))}
            title={p.title}
          />
          <BackToWork />
        </div>
      </div>
    </article>
  );
}
