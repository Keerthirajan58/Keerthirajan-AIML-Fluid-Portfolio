import Link from "next/link";
import { localContent } from "@/content";
import { sectionInfo } from "@/content/site";
import type { Contribution, PortfolioContent, Project } from "@/content/types";
import { Section } from "@/components/ui/Section";
import {
  ArrowUpRightIcon,
  AwardIcon,
  GitHubIcon,
  MergeIcon,
  PackageIcon,
  ReviewIcon,
} from "@/components/ui/icons";
import { getProjectBySlug, projectRoute } from "@/lib/projects";

/** A project I maintain: what it is, plus its page, code and package. */
function Maintained({ project: p }: { project: Project }) {
  const route = projectRoute(p);
  return (
    <article className="oss-maintained surface tinted">
      <div className="oss-maintained-text">
        <p className="eyebrow">Maintainer</p>
        <h3>{route ? <Link href={route}>{p.title}</Link> : p.title}</h3>
        <p>{p.description}</p>
        <ul className="tag-list">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="oss-maintained-actions">
        {route && (
          <Link href={route} className="case-action">
            Read case study
            <ArrowUpRightIcon width={14} height={14} />
          </Link>
        )}
        {p.links?.github && (
          <a
            href={p.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="case-action"
            data-kind="github"
          >
            <GitHubIcon />
            Source
            <ArrowUpRightIcon width={14} height={14} />
          </a>
        )}
        {p.links?.pypi && (
          <a
            href={p.links.pypi}
            target="_blank"
            rel="noopener noreferrer"
            className="case-action"
          >
            <PackageIcon />
            PyPI
            <ArrowUpRightIcon width={14} height={14} />
          </a>
        )}
      </div>
    </article>
  );
}

/** One pull request to someone else's project. */
function ContributionCard({ c }: { c: Contribution }) {
  const merged = c.status === "merged";
  return (
    <a
      className="oss-card surface"
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="oss-card-top">
        <span className="oss-project">
          <GitHubIcon aria-hidden="true" />
          <span>
            <strong>{c.project}</strong>
            <small>{c.repo}</small>
          </span>
        </span>
        <span className="oss-status" data-status={c.status}>
          {merged ? <MergeIcon /> : <ReviewIcon />}
          {merged ? `Merged · ${c.date}` : `In review · ${c.date}`}
        </span>
      </span>
      {c.award && (
        <span className="oss-award">
          <AwardIcon aria-hidden="true" />
          {c.award}
        </span>
      )}
      <span className="oss-title">{c.title}</span>
      <span className="oss-summary">{c.summary}</span>
      <span className="oss-card-foot">
        <span className="oss-tech">
          {c.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
        <span className="oss-cta" aria-hidden="true">
          Pull request <ArrowUpRightIcon />
        </span>
      </span>
    </a>
  );
}

/**
 * Open-source work: projects I maintain (from the project list), then pull
 * requests to other projects, merged first. Hidden when there is none.
 */
export function OpenSource({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { maintained, contributions } = content.openSource;
  const projects = maintained.flatMap((slug) => {
    const p = getProjectBySlug(slug, content.projects);
    return p ? [p] : [];
  });
  if (!projects.length && !contributions.length) return null;
  const { eyebrow, title, lede } = sectionInfo("open-source");
  const merged = contributions.filter((c) => c.status === "merged").length;
  const repos = new Set(contributions.map((c) => c.repo)).size;
  return (
    <Section id="open-source" eyebrow={eyebrow} title={title} lede={lede}>
      {projects.map((p) => (
        <Maintained project={p} key={p.slug} />
      ))}
      {contributions.length > 0 && (
        <div className="oss-contributions">
          <div className="oss-contributions-head">
            <h3 className="sub-title">Contributions</h3>
            <p>
              {`${merged} merged · ${contributions.length - merged} in review · ${repos} ${repos === 1 ? "repository" : "repositories"}`}
            </p>
          </div>
          <ul className="oss-grid">
            {contributions.map((c) => (
              <li key={c.url} className="reveal">
                <ContributionCard c={c} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
