import { z } from "zod";
import * as data from "./data";
import { allProjects } from "@/lib/projects";
import { isSafeLink } from "@/lib/navigation";

export interface PortfolioContent {
  profile: data.Profile;
  contact: data.ContactInfo;
  education: data.EducationEntry[];
  experience: data.ExperienceEntry[];
  leadership: data.LeadershipProjectEntry[];
  skills: data.SkillGroup[];
  projects: data.ProjectEntry[];
  testimonials: data.Testimonial[];
}
export interface ContentRepository {
  read(): Promise<PortfolioContent>;
}
export const localContent: PortfolioContent = {
  profile: data.profile,
  contact: data.contact,
  education: data.education,
  experience: data.experience,
  leadership: data.personalProjectsLeadership,
  skills: data.skills,
  projects: allProjects,
  testimonials: data.testimonials,
};
export class LocalContentRepository implements ContentRepository {
  async read() {
    return localContent;
  }
}
const text = z.string().trim().min(1),
  list = z.array(text).min(1),
  link = text.refine(isSafeLink, "Unsafe URL");
const image = text.refine((value) => {
  if (value.startsWith("/images/")) return !value.includes("..");
  try {
    return (
      [
        "cdn.prod.website-files.com",
        "assets-global.website-files.com",
        "uploads-ssl.webflow.com",
      ].includes(new URL(value).hostname) && value.startsWith("https://")
    );
  } catch {
    return false;
  }
}, "Unsupported media URL");
const highlight = z.object({ icon: text, text });
const section = z.object({
  heading: text,
  body: text.optional(),
  bullets: list.optional(),
  metrics: z.array(z.object({ value: text, label: text })).optional(),
  media: z.object({ src: image, alt: text }).optional(),
});
const project = z.object({
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text,
  kind: z.enum(["case-study", "grid", "certification", "publication"]),
  featured: z.boolean(),
  badge: text,
  description: text,
  tags: z.array(text),
  filters: z.array(text),
  primaryImage: z.string(),
  displayOrder: z.number().optional(),
  parentSlug: text.optional(),
  achievement: z.object({ label: text, detail: text }).optional(),
  gallery: z
    .object({
      cover: image,
      slides: z.array(image),
      imageStatus: z.literal("real"),
    })
    .optional(),
  links: z.object({
    github: link.optional(),
    devpost: link.optional(),
    blog: link.optional(),
    credential: link.optional(),
    detailsPage: z.string().optional(),
  }),
  sections: z.array(section).optional(),
  caseStudy: z
    .object({
      category: text,
      dates: text,
      tech: list,
      githubUrl: link.optional(),
      devpostUrl: link.optional(),
      blogUrl: link.optional(),
      overview: text,
      problem: text,
      engineeringBullets: list,
      impact: text,
    })
    .optional(),
});
export const contentSchema = z.object({
  profile: z.object({
    name: text,
    photo: image,
    pageTitle: text,
    heroEyebrow: text,
    tagline: text,
    roles: list,
    heroHighlights: z.array(highlight),
    location: text,
    bio: list,
    aboutHeadline: text,
    aboutHighlights: z.array(highlight),
    resumeSummary: text,
    openToRelocation: z.boolean(),
  }),
  contact: z.object({
    emails: z.array(z.email()).min(1),
    location: text,
    social: z.object({ linkedin: link, github: link, leetcode: link }),
    resumeUrl: link,
  }),
  education: z
    .array(
      z.object({ degree: text, dates: text, institution: text, bullets: list }),
    )
    .min(1),
  experience: z
    .array(
      z.object({
        role: text,
        company: text,
        dates: text,
        location: text,
        bullets: list,
      }),
    )
    .min(1),
  leadership: z
    .array(z.object({ role: text, title: text, dates: text, bullets: list }))
    .min(1),
  skills: z.array(z.object({ category: text, skills: list })).min(1),
  projects: z.array(project).min(1),
  testimonials: z
    .array(z.object({ quote: text, name: text, title: text, image }))
    .min(1),
});
export function validateContent(input: unknown): PortfolioContent {
  const result = contentSchema.parse(input);
  const slugs = result.projects.map((p) => p.slug);
  if (new Set(slugs).size !== slugs.length)
    throw new Error("Duplicate project slug");
  for (const p of result.projects) {
    if (
      p.parentSlug &&
      !result.projects.some(
        (parent) =>
          parent.slug === p.parentSlug && parent.gallery && !parent.parentSlug,
      )
    )
      throw new Error("Invalid parent project");
  }
  // Static routes are a checked manifest: CMS cannot publish a dangling route.
  for (const p of localContent.projects.filter((p) => p.gallery)) {
    if (!result.projects.some((c) => c.slug === p.slug && c.gallery))
      throw new Error("Missing published case study");
  }
  if (
    result.projects.some(
      (p) =>
        p.gallery &&
        !localContent.projects.some((c) => c.gallery && c.slug === p.slug),
    )
  )
    throw new Error("Unknown case study route");
  return result;
}
export async function readWithFallback(
  repository: ContentRepository,
  onError: (error: unknown) => void = () => {},
): Promise<PortfolioContent> {
  try {
    return validateContent(await repository.read());
  } catch (error) {
    onError(error);
    return localContent;
  }
}
