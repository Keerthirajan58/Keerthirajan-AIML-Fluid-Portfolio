import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { caseStudyRoutes } from "@/lib/content/repository";
import { loadContent } from "@/lib/content/load";
import { getProjectBySlug } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

/** One static page per local case study. */
export function generateStaticParams() {
  return caseStudyRoutes.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const content = await loadContent();
  const p = getProjectBySlug((await params).slug, content.projects);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      ...(p.caseStudy ? { images: [p.caseStudy.gallery.cover] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const content = await loadContent();
  const p = getProjectBySlug((await params).slug, content.projects);
  if (!p?.caseStudy) notFound();
  return (
    <CaseStudy
      project={p}
      caseStudy={p.caseStudy}
      projects={content.projects}
    />
  );
}
