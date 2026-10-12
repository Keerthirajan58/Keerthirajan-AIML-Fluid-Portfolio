import { z } from "zod";
import type { PortfolioContent } from "@/content/types";
import { projectFilters, type FilterId } from "@/content/filters";
import { ICONS, SOCIAL_NETWORKS, TINTS, TONES } from "@/content/options";
import { isSafeLink } from "@/lib/navigation";
import { cmsImageHosts } from "./hosts";

export { cmsImageHosts };

const text = z.string().trim().min(1);
const list = z.array(text).min(1);
const link = text.refine(isSafeLink, "Unsafe URL");
/** A file under /public/images, or an https image on the CMS CDN. */
const image = text.refine((value) => {
  if (value.startsWith("/images/")) return !value.includes("..");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && cmsImageHosts.includes(url.hostname);
  } catch {
    return false;
  }
}, "Unsupported image");

const icon = z.enum(ICONS);
const tone = z.enum(TONES);
const tint = z.enum(TINTS);
const chip = z.object({ icon, text, tone: tone.optional() });
const filterId = z.enum(
  projectFilters.map((f) => f.id) as [FilterId, ...FilterId[]],
);

const section = z.object({
  heading: text,
  body: text.optional(),
  bullets: list.optional(),
  metrics: z.array(z.object({ value: text, label: text })).optional(),
  media: z.object({ src: image, alt: text }).optional(),
});

const project = z.object({
  slug: text.regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slugs use a-z, 0-9 and single hyphens",
  ),
  title: text,
  badge: text,
  description: text,
  tags: z.array(text),
  filters: z.array(filterId),
  links: z
    .object({
      github: link.optional(),
      devpost: link.optional(),
      blog: link.optional(),
    })
    .optional(),
  achievement: z.object({ label: text, detail: text }).optional(),
  notes: z
    .array(
      z.union([
        z.object({ meta: text }),
        z.object({ text }),
        z.object({ bullets: list }),
      ]),
    )
    .min(1)
    .optional(),
  caseStudy: z
    .object({
      focus: text,
      timeline: text,
      tech: list.optional(),
      gallery: z.object({ cover: image, slides: z.array(image) }),
      sections: z.array(section).min(1),
    })
    .optional(),
  chapter: z
    .object({ of: text, badge: text, label: text, teaser: text, back: text })
    .optional(),
});

export const contentSchema = z.object({
  profile: z.object({
    name: text,
    photo: image,
    location: text,
    pageTitle: text,
    tagline: text,
    heroEyebrow: text,
    roles: list,
    hero: z.object({
      availability: text,
      intro: text,
      facts: z.array(
        z.object({
          icon,
          text,
          accent: z.enum(["school", "place"]).optional(),
        }),
      ),
    }),
    aboutHeadline: text,
    bio: list,
    aboutHighlights: z.array(chip),
    relocation: text,
  }),
  contact: z.object({
    emails: z.array(z.email()).min(1),
    resumeUrl: link,
    socials: z.array(
      z.object({
        network: z.enum(SOCIAL_NETWORKS),
        href: link,
      }),
    ),
  }),
  experience: z
    .array(
      z.object({
        role: text,
        company: text,
        dates: text,
        location: text,
        bullets: list,
        logo: z
          .union([z.object({ icon }), z.object({ src: image })])
          .optional(),
      }),
    )
    .min(1),
  education: z
    .array(
      z.object({
        degree: text,
        institution: text,
        dates: text,
        level: text,
        logo: z.union([
          z.object({ monogram: text, tone: tone.optional() }),
          z.object({ src: image, alt: text }),
        ]),
        tint: z.tuple([tint, tint]),
        award: z.object({ title: text, detail: text }).optional(),
        activities: z.array(chip).optional(),
        notes: list.optional(),
        coursework: list.optional(),
      }),
    )
    .min(1),
  projects: z.array(project).min(1),
  skills: z.array(z.object({ category: text, skills: list })).min(1),
  certifications: z.array(
    z.object({ title: text, issuer: text, url: link, logo: image.optional() }),
  ),
  publications: z.array(z.object({ title: text, venue: text, date: text })),
  testimonials: z.array(
    z.object({ quote: text, name: text, title: text, image }),
  ),
});

// Compile-time guard: the schema and the content types must describe the
// same shape, so neither can change without the other.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const schemaMatchesTypes: Same<
  z.infer<typeof contentSchema>,
  PortfolioContent
> = true;

/**
 * Parses content and checks what a schema cannot: unique slugs, chapters
 * that point at a real case study, and (when `routes` is given) that the
 * case studies match the statically generated pages exactly.
 */
export function validateContent(
  input: unknown,
  routes?: readonly string[],
): PortfolioContent {
  const content: PortfolioContent = contentSchema.parse(input);
  const slugs = content.projects.map((p) => p.slug);
  const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i);
  if (duplicate) throw new Error(`Duplicate project slug: ${duplicate}`);
  for (const p of content.projects) {
    if (!p.chapter) continue;
    const parent = content.projects.find((q) => q.slug === p.chapter!.of);
    if (!p.caseStudy || !parent?.caseStudy || parent.chapter)
      throw new Error(`Invalid chapter: ${p.slug}`);
  }
  if (routes) {
    const pages = content.projects.filter((p) => p.caseStudy);
    for (const slug of routes)
      if (!pages.some((p) => p.slug === slug))
        throw new Error(`Missing published case study: ${slug}`);
    for (const p of pages)
      if (!routes.includes(p.slug))
        throw new Error(`Unknown case study route: ${p.slug}`);
  }
  return content;
}
