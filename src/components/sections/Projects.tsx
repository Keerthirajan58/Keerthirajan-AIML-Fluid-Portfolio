import { Section } from "@/components/ui/Section";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { getImageSize } from "@/lib/imageSize";
import { ProjectCard } from "./ProjectCard";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { localContent, type PortfolioContent } from "@/content/repository";

/** Placeholder frames vary in shape so the masonry keeps its rhythm. */
const placeholderShapes = [
  { width: 1, height: 1 },
  { width: 4, height: 3 },
  { width: 5, height: 4 },
];

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
              media={
                p.gallery
                  ? getImageSize(p.gallery.cover)
                  : placeholderShapes[i % placeholderShapes.length]
              }
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
