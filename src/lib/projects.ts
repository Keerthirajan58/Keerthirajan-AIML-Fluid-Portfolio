import {
  projects,
  experience,
  type ProjectEntry,
  type CaseStudySection,
} from "@/content/data";
import { nvcProject } from "@/content/nvc";
const order = [
  "siri-core-modeling",
  "barterbrain",
  "pitchpulse",
  "historical-event-narrator",
  "coding-problem-recommender",
  "face-cloaking",
];
export const allProjects: ProjectEntry[] = [
  ...projects.map((p) => ({
    ...p,
    displayOrder: order.includes(p.slug) ? order.indexOf(p.slug) : 99,
    ...(p.slug === "barterbrain"
      ? {
          achievement: {
            label: "Technica winner",
            detail: "Best Hack for Social Good · Sustainability",
          },
        }
      : {}),
  })),
  nvcProject,
];
export function getFeaturedProjects(source = allProjects) {
  return source
    .filter((p) => p.gallery && !p.parentSlug)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
}
export function getGridProjects(source = allProjects) {
  return source.filter((p) => p.kind === "grid" && !p.gallery);
}
export function getCertifications(source = allProjects) {
  return source.filter((p) => p.kind === "certification");
}
export function getPublications(source = allProjects) {
  return source.filter((p) => p.kind === "publication");
}
export const caseStudySlugs = allProjects
  .filter((p) => p.gallery)
  .map((p) => p.slug);
export function getProjectBySlug(slug: string, source = allProjects) {
  return source.find((p) => p.slug === slug);
}
export function getCaseStudySections(
  project: ProjectEntry,
  jobs = experience,
): CaseStudySection[] {
  if (project.sections) return project.sections;
  const cs = project.caseStudy;
  if (cs)
    return [
      { heading: "Overview", body: cs.overview },
      { heading: "Problem", body: cs.problem },
      { heading: "How I built it", bullets: cs.engineeringBullets },
      { heading: "Impact", body: cs.impact },
    ];
  const apple = jobs.find((e) => e.company === "Apple");
  return [
    { heading: "Overview", body: project.description },
    ...(project.slug === "siri-core-modeling" && apple
      ? [{ heading: "At Apple", bullets: apple.bullets }]
      : []),
  ];
}
