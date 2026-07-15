import { Section } from "@/components/ui/Section";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { FeaturedProjectCard, GridProjectCard } from "./ProjectCard";

export function Projects() {
  const featured = getFeaturedProjects();
  const grid = getGridProjects();

  return (
    <Section id="projects" eyebrow="Projects" title="Selected work">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <FeaturedProjectCard key={p.slug} project={p} />
        ))}
      </div>

      <h3 className="mb-6 mt-14 text-xs font-semibold uppercase tracking-[0.22em] text-crimson">
        More projects
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((p) => (
          <GridProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </Section>
  );
}
