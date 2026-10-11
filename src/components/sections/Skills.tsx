import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { SkillsMarquee } from "@/components/SkillsMarquee";
import { DepthCard } from "@/components/ui/DepthCard";
import { CodeIcon } from "@/components/ui/icons";
export function Skills({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { skills } = content;
  return (
    <Section
      id="skills"
      eyebrow="04 / The toolkit"
      title="The right tools. Deeper possibilities."
    >
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
      <div className="skills-grid">
        {skills.map((group, i) => (
          <DepthCard key={group.category} className="skill-group">
            <div className="skill-top">
              <CodeIcon />
              <span>0{i + 1}</span>
            </div>
            <h3>{group.category}</h3>
            <ul>
              {group.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </DepthCard>
        ))}
      </div>
    </Section>
  );
}
