import Image from "next/image";
import Link from "next/link";
import type { NoteBlock, Project } from "@/content/types";
import {
  ArrowUpRightIcon,
  AwardIcon,
  GitHubIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { projectRoute } from "@/lib/projects";
import { projectCover } from "@/lib/server/images";
import { ProjectNotes } from "./ProjectNotes";

function NoteBlocks({ blocks }: { blocks: NoteBlock[] }) {
  return blocks.map((block, i) =>
    "meta" in block ? (
      <p className="notes-meta" key={i}>
        {block.meta}
      </p>
    ) : "text" in block ? (
      <p key={i}>{block.text}</p>
    ) : (
      <ul className="result-list" key={i}>
        {block.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    ),
  );
}

/**
 * A work card: cover (or the real stack when no screenshot exists yet),
 * category, follow-up chapter links, title, description, tags, the source
 * link and optional project notes.
 */
export function ProjectCard({
  project: p,
  index,
  chapters = [],
}: {
  project: Project;
  /** Position in the grid; varies the placeholder's colours. */
  index: number;
  /** Follow-up projects that continue this one. */
  chapters?: Project[];
}) {
  const route = projectRoute(p);
  const cover = projectCover(p);
  const preview = (
    <>
      {cover ? (
        <Image
          src={cover}
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
  const github = p.links?.github;
  return (
    <article className="project-card surface" data-project={p.slug}>
      {route ? (
        <Link href={route} className="project-image" tabIndex={-1}>
          {preview}
        </Link>
      ) : (
        <div className="project-image">{preview}</div>
      )}
      <div className="project-content">
        <span className="project-category">{p.badge}</span>
        {chapters.map(
          (next) =>
            next.chapter && (
              <Link
                key={next.slug}
                href={`/projects/${next.slug}`}
                className="project-next-chapter"
                aria-label={next.chapter.label}
              >
                <SparkIcon />
                {next.chapter.badge}
                <ArrowUpRightIcon />
              </Link>
            ),
        )}
        <h3>
          {route ? (
            <Link href={route}>{p.title}</Link>
          ) : github ? (
            <a href={github} target="_blank" rel="noopener noreferrer">
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
        {github ? (
          <a
            href={github}
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
        {p.notes && (
          <ProjectNotes title={p.title}>
            <NoteBlocks blocks={p.notes} />
          </ProjectNotes>
        )}
      </div>
    </article>
  );
}
