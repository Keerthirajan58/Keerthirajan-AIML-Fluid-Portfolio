import Image from "next/image";
import Link from "next/link";
import { type ProjectEntry } from "@/content/data";
import { Badge } from "@/components/ui/Badge";
import { GitHubIcon, ArrowUpRightIcon } from "@/components/ui/icons";

/** Image card for a project with real screenshots — links to its detail page. */
export function FeaturedProjectCard({ project }: { project: ProjectEntry }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface transition-[border-color,transform] hover:border-crimson/40 active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        <Image
          src={project.gallery!.cover}
          alt={`${project.title} preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <Badge>{project.badge}</Badge>
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-crimson">
          View case study
          <ArrowUpRightIcon
            width={16}
            height={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

/** Text card for a lighter project (no screenshots) — links out to GitHub. */
export function GridProjectCard({ project }: { project: ProjectEntry }) {
  const href = project.links.github;
  const body = (
    <>
      <div className="mb-3">
        <Badge>{project.badge}</Badge>
      </div>
      <h3 className="font-display text-base font-semibold text-ink">
        {project.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-ink/10 px-2.5 py-1 text-xs text-ink-muted"
          >
            {t}
          </span>
        ))}
      </div>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson">
          <GitHubIcon width={16} height={16} />
          View on GitHub
        </span>
      )}
    </>
  );

  const className =
    "group flex flex-col rounded-2xl border border-ink/10 bg-surface p-5 transition-[border-color,transform] hover:border-crimson/40 active:scale-[0.99]";

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
