import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { caseStudyRoutes } from "@/lib/content/repository";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...caseStudyRoutes.map((slug) => ({
      url: `${base}/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
