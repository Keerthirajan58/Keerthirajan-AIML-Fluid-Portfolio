import Image from "next/image";
import Link from "next/link";
import type { ProjectEntry, LeadershipProjectEntry } from "@/content/data";
import type { ImageDimensions } from "@/lib/imageSize";
import {
  ArrowUpRightIcon,
  AwardIcon,
  GitHubIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { ProjectNotes } from "@/components/ProjectNotes";

export function ProjectCard({
  project: p,
  index,
  media,
  leadership,
}: {
  project: ProjectEntry;
  index: number;
  /** Intrinsic size of the cover, so the frame keeps the photo's own shape. */
  media: ImageDimensions;
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
          sizes="(max-width: 599px) 100vw, (max-width: 959px) 50vw, 33vw"
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
  const frame = { aspectRatio: `${media.width} / ${media.height}` };
  return (
    <article className="project-card glass" data-project={p.slug}>
      {route ? (
        <Link
          href={route}
          className="project-image"
          style={frame}
          tabIndex={-1}
        >
          {preview}
        </Link>
      ) : (
        <div className="project-image" style={frame}>
          {preview}
        </div>
      )}
      <div className="project-content">
        <span className="project-category">{p.badge}</span>
        <div className="project-title-row">
          <h3>
            {route ? (
              <Link href={route}>{p.title}</Link>
            ) : p.links.github ? (
              <a
                href={p.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h3>
          {p.slug === "barterbrain" && (
            <Link
              href="/projects/barterbrain-nvc"
              className="project-next-chapter"
              aria-label="NVC finalist: BarterBrAIn — From hackathon to startup"
            >
              <SparkIcon />
              NVC finalist
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
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
