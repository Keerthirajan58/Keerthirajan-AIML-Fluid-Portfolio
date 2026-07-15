/**
 * Shared selectors over `projects` in `src/content/data.ts`, so the home page
 * and the `/projects/[slug]` route filter from one place instead of repeating
 * `.filter(...)` logic.
 *
 * A project gets a dedicated detail page iff it has a real `gallery`. That is
 * the 6 image-bearing projects (the 5 with a `caseStudy` object plus Siri Core
 * Modeling, which has real images but no case-study prose). Everything else —
 * grid-only projects, certifications, publications — renders inline on the home
 * page only.
 */
import { projects, type ProjectEntry } from "@/content/data";

/** Projects with real screenshots — shown as image cards, each linking to /projects/<slug>. */
export function getFeaturedProjects(): ProjectEntry[] {
  return projects.filter((p) => p.gallery !== undefined);
}

/** Lighter projects (no gallery) — shown as text cards linking out to GitHub. */
export function getGridProjects(): ProjectEntry[] {
  return projects.filter((p) => p.kind === "grid" && p.gallery === undefined);
}

export function getCertifications(): ProjectEntry[] {
  return projects.filter((p) => p.kind === "certification");
}

export function getPublications(): ProjectEntry[] {
  return projects.filter((p) => p.kind === "publication");
}

/** Slugs that get a prerendered detail page (drives generateStaticParams). */
export const caseStudySlugs: string[] = getFeaturedProjects().map((p) => p.slug);

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return projects.find((p) => p.slug === slug);
}
