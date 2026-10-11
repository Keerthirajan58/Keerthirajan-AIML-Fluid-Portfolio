import Image from "next/image";
import Link from "next/link";
import type { ProjectEntry, LeadershipProjectEntry } from "@/content/data";
import { ArrowUpRightIcon, AwardIcon, GitHubIcon } from "@/components/ui/icons";
import { ProjectNotes } from "@/components/ProjectNotes";

export function ProjectCard({
  project: p,
  index,
  leadership,
}: {
  project: ProjectEntry;
  index: number;
  leadership?: LeadershipProjectEntry;
}) {
  const route = p.gallery ? `/projects/${p.slug}` : undefined;
  const preview = (
    <>
      {p.gallery ? (
        <Image
          src={p.gallery.cover}
          alt={p.title + " preview"}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        // No screenshot exists yet: show the real stack instead of a fake visual.
        <div
          className={`project-placeholder placeholder-${index % 3}`}
          aria-hidden="true"
        >
          <ul>
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <span className="placeholder-note">Screenshot coming soon</span>
        </div>
      )}
      {route && (
        <span className="project-open">
          Case study <ArrowUpRightIcon />
        </span>
      )}
      {p.achievement && (
        <span className="project-achievement">
          <AwardIcon />
          {p.achievement.label}
        </span>
      )}
    </>
  );
  return (
    <article className="project-card" data-project={p.slug}>
      {route ? (
        <Link href={route} className="project-image" tabIndex={-1}>
          {preview}
        </Link>
      ) : (
        <div className="project-image">{preview}</div>
      )}
      <div className="project-content">
        <span className="project-category">{p.badge}</span>
        <h3>
          {route ? (
            <Link href={route}>{p.title}</Link>
          ) : p.links.github ? (
            <a href={p.links.github} target="_blank" rel="noopener noreferrer">
              {p.title}
            </a>
          ) : (
            p.title
          )}
        </h3>
        <p>{p.description}</p>
        <ul className="tag-list">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="project-actions">
        {p.links.github ? (
          <a
            href={p.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-source"
          >
            <GitHubIcon />
            View on GitHub
            <ArrowUpRightIcon />
          </a>
        ) : route ? (
          <Link className="project-source" href={route}>
            Read case study
            <ArrowUpRightIcon />
          </Link>
        ) : null}
        {p.slug === "barterbrain" && (
          <Link
            href="/projects/barterbrain-nvc"
            className="project-next-chapter"
            aria-label="NVC finalist: BarterBrAIn — From hackathon to startup"
          >
            NVC finalist
            <ArrowUpRightIcon />
          </Link>
        )}
        {(leadership || p.legacyDetailsNote) && (
          <ProjectNotes title={p.title}>
            {leadership && (
              <>
                <p className="notes-meta">
                  {leadership.role} · {leadership.dates}
                </p>
                <ul className="result-list">
                  {leadership.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </>
            )}
            {p.legacyDetailsNote && (
              <>
                <p>{p.legacyDetailsNote.fullDescription}</p>
                <p className="notes-meta">{p.legacyDetailsNote.techStack}</p>
                <p>{p.legacyDetailsNote.confidentialityNote}</p>
              </>
            )}
          </ProjectNotes>
        )}
      </div>
    </article>
  );
}
