import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { SkillsCloud, type SkillBubble } from "@/components/SkillsCloud";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { splitByTerms } from "@/lib/highlight";

export function Skills({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  // Evidence comes from real stacks: project tags/tech and role bullets.
  const sources = [
    ...content.experience.map((job) => ({
      name: job.company,
      text: job.bullets.join(" "),
    })),
    ...[
      ...getFeaturedProjects(content.projects),
      ...getGridProjects(content.projects),
    ].map((p) => ({
      name: p.title,
      text: [...p.tags, ...(p.caseStudy?.tech ?? [])].join(" · "),
    })),
  ];
  const bubbles = new Map<string, SkillBubble>();
  for (const group of content.skills)
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
  return (
    <Section id="skills" eyebrow="Skills" title="Tools I work with">
      <SkillsCloud
        categories={content.skills.map((g) => g.category)}
        skills={[...bubbles.values()]}
      />
    </Section>
  );
}
