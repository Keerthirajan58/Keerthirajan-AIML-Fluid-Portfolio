import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  caseStudySlugs,
  getCaseStudySections,
} from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import { getImageSize } from "@/lib/imageSize";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  AwardIcon,
  BookIcon,
  DevpostIcon,
  GitHubIcon,
} from "@/components/ui/icons";
import { loadContent } from "@/content/load";
export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

/** Project links become real buttons: GitHub in ink, Devpost in its teal. */
const linkStyles: Record<string, { label: string; icon: ReactNode }> = {
  github: { label: "View on GitHub", icon: <GitHubIcon /> },
  devpost: { label: "View on Devpost", icon: <DevpostIcon /> },
  blog: { label: "Read the write-up", icon: <BookIcon /> },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const content = await loadContent();
  const p = getProjectBySlug((await params).slug, content.projects);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      ...(p.gallery ? { images: [p.gallery.cover] } : {}),
    },
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const content = await loadContent();
  const p = getProjectBySlug((await params).slug, content.projects);
  if (!p?.gallery) notFound();
  const sections = getCaseStudySections(p, content.experience),
    links = Object.entries(p.links).filter(
      ([key, value]) => key !== "detailsPage" && value,
    );
  return (
    <article className="case-study">
      <header className="case-hero shell">
        <Link href="/#projects" className="back-link">
          <ArrowLeftIcon width={16} height={16} />
          Back to work
        </Link>
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
            <dd>{p.caseStudy?.category ?? p.badge}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>
              {p.caseStudy?.dates ??
                (p.parentSlug
                  ? "2026 · April 22–23 finals"
                  : "May – August 2025")}
            </dd>
          </div>
        </dl>
        {links.length > 0 && (
          <div className="case-actions">
            {links.map(([key, href]) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="case-action"
                data-kind={key}
              >
                {linkStyles[key]?.icon}
                {linkStyles[key]?.label ?? key}
                <ArrowUpRightIcon width={14} height={14} />
              </a>
            ))}
          </div>
        )}
        <ul className="tag-list">
          {(p.caseStudy?.tech ?? p.tags).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {p.slug === "barterbrain" && (
          <Link href="/projects/barterbrain-nvc" className="related-mini">
            <span className="chip-icon">
              <AwardIcon />
            </span>
            <span>
              <small>The next chapter</small>From hackathon to startup — NVC
              2026 finalist
            </span>
            <ArrowUpRightIcon />
          </Link>
        )}
        {p.parentSlug && (
          <Link href={"/projects/" + p.parentSlug} className="related-mini">
            <span className="chip-icon">
              <ArrowLeftIcon />
            </span>
            <span>Explore the original hackathon product</span>
          </Link>
        )}
      </header>
      <div className="case-sheet shell">
        <div className="case-body surface">
          {sections.map((s) => (
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
            images={[p.gallery.cover, ...p.gallery.slides].map((src) => ({
              src,
              ...getImageSize(src),
            }))}
            title={p.title}
          />
          <Link href="/#projects" className="back-link">
            <ArrowLeftIcon width={16} height={16} />
            Back to work
          </Link>
        </div>
      </div>
    </article>
  );
}
