import type { PortfolioContent } from "@/content/types";
import { splitByTerms } from "./highlight";
import { workProjects } from "./projects";

export type SkillBubble = {
  name: string;
  /** Every area the skill is listed under, in content order. */
  categories: string[];
  /** Roles and projects whose bullets or stack mention the skill. */
  evidence: string[];
};

/** One bubble per distinct skill, with evidence from real work. */
export function skillBubbles({
  skills,
  experience,
  projects,
}: Pick<PortfolioContent, "skills" | "experience" | "projects">) {
  const sources = [
    ...experience.map((job) => ({
      name: job.company,
      text: job.bullets.join(" "),
    })),
    ...workProjects(projects).map((p) => ({
      name: p.title,
      text: [...p.tags, ...(p.caseStudy?.tech ?? [])].join(" · "),
    })),
  ];
  const bubbles = new Map<string, SkillBubble>();
  for (const group of skills)
    for (const name of group.skills) {
      const existing = bubbles.get(name);
      if (existing) {
        existing.categories.push(group.category);
        continue;
      }
      bubbles.set(name, {
        name,
        categories: [group.category],
        evidence: sources
          .filter((s) => splitByTerms(s.text, [name]).some((part) => part.hit))
          .map((s) => s.name),
      });
    }
  return [...bubbles.values()];
}
