import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile, experience } from "@/content/data";
import { getProjectBySlug, caseStudySlugs } from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeftIcon,
  GitHubIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

// Only the 6 image-backed projects have detail pages; anything else 404s.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} | ${profile.name}`,
    description: project.description,
  };
}

type BodySection = { heading: string; body?: string; bullets?: string[] };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || !project.gallery) notFound();

  const cs = project.caseStudy;
  // Siri Core Modeling has no case-study prose (Apple work) — compose its page
  // from the real, public Apple internship bullets in `experience`.
  const apple = experience.find((e) => e.company === "Apple");

  const meta = cs
    ? {
        category: cs.category,
        dates: cs.dates,
        tech: cs.tech,
        links: [
          { label: "GitHub", href: cs.githubUrl, Icon: GitHubIcon },
          { label: "Devpost", href: cs.devpostUrl, Icon: ArrowUpRightIcon },
          { label: "Write-up", href: cs.blogUrl, Icon: ArrowUpRightIcon },
        ].filter((l) => l.href),
      }
    : {
        category: project.badge,
        dates: apple?.dates ?? "",
        tech: project.tags,
        links: [] as { label: string; href?: string; Icon: typeof GitHubIcon }[],
      };

  const sections: BodySection[] = cs
    ? [
        { heading: "Overview", body: cs.overview },
        { heading: "Problem", body: cs.problem },
        { heading: "How I built it", bullets: cs.engineeringBullets },
        { heading: "Impact", body: cs.impact },
      ]
    : [
        { heading: "Overview", body: project.description },
        ...(apple ? [{ heading: "At Apple", bullets: apple.bullets }] : []),
      ];

  const galleryImages = [project.gallery.cover, ...project.gallery.slides];

  return (
    <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-crimson"
      >
        <ArrowLeftIcon width={16} height={16} />
        Back to projects
      </Link>

      <header className="mt-6">
        <Badge>{project.badge}</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          {project.description}
        </p>
      </header>

      <dl
        data-reveal
        className="mt-8 grid grid-cols-1 gap-6 border-y border-ink/10 py-6 sm:grid-cols-3"
      >
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-crimson">
            Category
          </dt>
          <dd className="mt-1 text-sm text-ink">{meta.category}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-crimson">
            Timeline
          </dt>
          <dd className="mt-1 text-sm text-ink">{meta.dates}</dd>
        </div>
        {meta.links.length > 0 && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-crimson">
              Links
            </dt>
            <dd className="mt-1 flex flex-wrap gap-3">
              {meta.links.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-crimson"
                >
                  <Icon width={16} height={16} />
                  {label}
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        {meta.tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-ink/10 bg-surface px-3 py-1 text-sm text-ink-muted"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading} data-reveal>
            <h2 className="font-display text-xl font-semibold text-ink">
              {s.heading}
            </h2>
            {s.body && (
              <p className="mt-3 text-base leading-7 text-ink-muted">
                {s.body}
              </p>
            )}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="relative pl-5 text-base leading-7 text-ink-muted before:absolute before:left-0 before:top-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-crimson"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="mb-5 font-display text-xl font-semibold text-ink">
          Gallery
        </h2>
        <ProjectGallery images={galleryImages} title={project.title} />
      </div>

      <div className="mt-12 border-t border-ink/10 pt-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-crimson"
        >
          <ArrowLeftIcon width={16} height={16} />
          Back to projects
        </Link>
      </div>
    </article>
  );
}
