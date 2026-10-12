import { localContent } from "@/content";
import { sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { chaptersOf, workProjects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectExplorer } from "./ProjectExplorer";

export function Projects({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { eyebrow, title, lede } = sectionInfo("projects");
  return (
    <Section id="projects" eyebrow={eyebrow} title={title} lede={lede}>
      <ProjectExplorer
        items={workProjects(content.projects).map((p, i) => ({
          slug: p.slug,
          filters: p.filters,
          card: (
            <ProjectCard
              project={p}
              index={i}
              chapters={chaptersOf(p, content.projects)}
            />
          ),
        }))}
      />
    </Section>
  );
}
