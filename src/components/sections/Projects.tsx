import { Section } from "@/components/ui/Section";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { localContent, type PortfolioContent } from "@/content/repository";

export function Projects({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const work = [
    ...getFeaturedProjects(content.projects),
    ...getGridProjects(content.projects),
  ];
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Selected work"
      lede="Machine learning, generative AI, and the full-stack software that ships them. Open a project for the full case study."
    >
      <ProjectExplorer
        items={work.map((p, i) => ({
          slug: p.slug,
          filters: p.filters,
          card: (
            <ProjectCard
              project={p}
              index={i}
              leadership={content.leadership.find(
                (l) =>
                  l.title === p.title ||
                  (p.slug === "moodbites" &&
                    l.title === "Emotion Based Food Recommending App"),
              )}
            />
          ),
        }))}
      />
    </Section>
  );
}
