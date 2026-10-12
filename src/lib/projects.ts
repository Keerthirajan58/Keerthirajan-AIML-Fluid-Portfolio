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

/** Case-study link buttons, always in this order. */
export const linkOrder = ["github", "devpost", "blog"] as const;

export function projectLinks(project: Project) {
  return linkOrder.flatMap((kind) =>
    project.links?.[kind] ? [{ kind, href: project.links[kind]! }] : [],
  );
}
