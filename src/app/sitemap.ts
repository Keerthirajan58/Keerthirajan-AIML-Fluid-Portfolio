import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { caseStudySlugs } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...caseStudySlugs.map((slug) => ({
      url: `${base}/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
