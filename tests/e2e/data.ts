/** What the browser suite expects, derived from the content (never hard-coded). */
import { localContent } from "../../src/content";
import { caseStudyRoutes } from "../../src/lib/content/repository";
import { workProjects } from "../../src/lib/projects";

export { availableFilters, matchesFilter } from "../../src/lib/filters";
export { projectCover } from "../../src/lib/server/images";
export { caseStudyRoutes };

export const content = localContent;
export const work = workProjects(localContent.projects);

/** A case study's images in gallery order (cover first). */
export function galleryOf(slug: string) {
  const study = localContent.projects.find((p) => p.slug === slug)?.caseStudy;
  if (!study) throw new Error(`No case study: ${slug}`);
  return [study.gallery.cover, ...study.gallery.slides];
}
