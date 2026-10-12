import { localContent } from "@/content";
import { copy, sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { skillBubbles } from "@/lib/skills";
import { SkillsCloud } from "./SkillsCloud";

export function Skills({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { eyebrow, title } = sectionInfo("skills");
  return (
    <Section id="skills" eyebrow={eyebrow} title={title}>
      <SkillsCloud
        categories={content.skills.map((g) => g.category)}
        skills={skillBubbles(content)}
        note={copy.skills.note}
      />
    </Section>
  );
}
