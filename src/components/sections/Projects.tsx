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
  return (
    <Section
      id="projects"
      eyebrow="03 / Selected work"
      title="Ideas, made real."
    >
      <ProjectExplorer
        items={[
          ...getFeaturedProjects(content.projects),
          ...getGridProjects(content.projects),
        ].map((p, i) => ({
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
