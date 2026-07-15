import { skills } from "@/content/data";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Tools & technologies">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group) => (
          <div
            key={group.category}
            data-reveal
            className="rounded-2xl border border-ink/10 bg-surface p-5"
          >
            <h3 className="mb-4 font-display text-base font-semibold text-ink">
              {group.category}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill}>
                  <Tag>{skill}</Tag>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
