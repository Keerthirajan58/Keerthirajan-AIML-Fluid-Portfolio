import type { Project } from "@/content/types";

/** Work cards, in content order (chapters are reached from their original). */
export function workProjects(projects: readonly Project[]) {
  return projects.filter((p) => !p.chapter);
}

/** Projects with their own case-study page. */
export function caseStudies(projects: readonly Project[]) {
  return projects.filter((p) => p.caseStudy);
}

export function getProjectBySlug(slug: string, projects: readonly Project[]) {
  return projects.find((p) => p.slug === slug);
}

/** The case-study page of a project, if it has one. */
export function projectRoute(project: Project) {
  return project.caseStudy ? `/projects/${project.slug}` : undefined;
}

/** Follow-up projects that continue this one. */
export function chaptersOf(project: Project, projects: readonly Project[]) {
  return projects.filter((p) => p.chapter?.of === project.slug);
}

/** The project a chapter continues. */
export function parentOf(project: Project, projects: readonly Project[]) {
  return project.chapter
    ? getProjectBySlug(project.chapter.of, projects)
    : undefined;
}

/** Project link buttons, always in this order. */
export const linkOrder = [
  "github",
  "pypi",
  "video",
  "devpost",
  "blog",
  "devto",
] as const;

export function projectLinks(project: Project) {
  return linkOrder.flatMap((kind) =>
    project.links?.[kind] ? [{ kind, href: project.links[kind]! }] : [],
  );
}

/**
 * The image a shared link shows: the card's own image when it shows the
 * project (an illustrative cover would lose its label), else the first
 * screenshot, each with its description. Null when there is neither.
 */
export function shareImage(p: Project) {
  const display = p.coverDisplay;
  if (display?.src && !display.illustrative)
    return { url: display.src, alt: display.alt ?? p.title };
  const gallery = p.caseStudy?.gallery;
  return gallery
    ? { url: gallery.cover, alt: gallery.alt?.[0] ?? p.title }
    : null;
}
