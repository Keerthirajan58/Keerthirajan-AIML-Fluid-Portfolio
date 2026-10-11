import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { SkillsMarquee } from "@/components/SkillsMarquee";
export function Skills({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { skills } = content;
  return (
    <Section id="skills" eyebrow="Skills" title="Tools I work with">
      <SkillsMarquee
        items={[
          "PyTorch",
          "Python",
          "Gemini",
          "React",
          "Firebase",
          "Flutter",
          "TypeScript",
          "RAG",
        ]}
      />
      <ul className="skill-rows">
        {skills.map((group) => (
          <li key={group.category} className="skill-row reveal">
            <h3>{group.category}</h3>
            <ul className="chip-list">
              {group.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  );
}
