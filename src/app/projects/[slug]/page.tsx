import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  caseStudySlugs,
  getCaseStudySections,
} from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  AwardIcon,
} from "@/components/ui/icons";
import { loadContent } from "@/content/load";
export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;
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
    <article className="case-study shell">
      <Link href="/#projects" className="text-link">
        <ArrowLeftIcon width={16} height={16} />
        Back to work
      </Link>
      <header>
        <p className="eyebrow mt-8">{p.badge}</p>
        <h1>{p.title}</h1>
        <p className="case-description">{p.description}</p>
      </header>
      {p.achievement && (
        <p className="achievement mt-6 w-fit">
          <AwardIcon />
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
        {links.length > 0 && (
          <div>
            <dt>Links</dt>
            <dd className="flex flex-wrap gap-4">
              {links.map(([label, href]) => (
                <a
                  className="text-link capitalize"
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label === "blog" ? "Read more" : label}
                  <ArrowUpRightIcon width={14} height={14} />
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <ul className="tag-list">
        {(p.caseStudy?.tech ?? p.tags).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {p.slug === "barterbrain" && (
        <Link href="/projects/barterbrain-nvc" className="related-mini">
          <AwardIcon />
          <span>
            <small>The next chapter</small>From hackathon to startup — NVC 2026
            finalist
          </span>
          <ArrowUpRightIcon />
        </Link>
      )}
      {p.parentSlug && (
        <Link href={"/projects/" + p.parentSlug} className="related-mini">
          <ArrowLeftIcon />
          <span>Explore the original hackathon product</span>
        </Link>
      )}
      <div className="case-body">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
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
                className="mt-6 h-auto w-full rounded-2xl"
              />
            )}
            {s.bullets && (
              <ul className="result-list">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <h2 className="subheading">A closer look</h2>
      <ProjectGallery
        images={[p.gallery.cover, ...p.gallery.slides]}
        title={p.title}
      />
      <Link href="/#projects" className="text-link mt-12">
        <ArrowLeftIcon width={16} height={16} />
        Back to work
      </Link>
    </article>
  );
}
