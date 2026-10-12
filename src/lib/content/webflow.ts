import { z } from "zod";
import { localContent } from "@/content";
import { SOCIAL_NETWORKS, TINTS } from "@/content/options";
import type {
  CaseStudySection,
  EducationEntry,
  ExperienceEntry,
  FilterId,
  NoteBlock,
  PortfolioContent,
  Project,
  SocialLink,
  Tint,
} from "@/content/types";
import { caseStudyRoutes, type ContentRepository } from "./repository";
import { validateContent } from "./schema";

/**
 * Optional Webflow CMS source. Each collection maps onto one content list;
 * visual choices a CMS can't express well (icons, tints, chip colours) come
 * from the matching local entry. The whole snapshot is validated, and any
 * problem falls back to the local content (see `readWithFallback`).
 */
export const collectionNames = [
  "settings",
  "experience",
  "education",
  "projects",
  "sections",
  "skills",
  "certifications",
  "publications",
  "testimonials",
] as const;
export type CollectionName = (typeof collectionNames)[number];
export type Collections = Record<CollectionName, string>;

/** Collections that may not be empty. */
const required: CollectionName[] = [
  "settings",
  "experience",
  "education",
  "projects",
  "skills",
];

const itemSchema = z.object({
  id: z.string(),
  isDraft: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  fieldData: z.record(z.string(), z.unknown()),
});
const responseSchema = z.object({
  items: z.array(itemSchema),
  pagination: z.object({ total: z.number().int().nonnegative() }),
});
export type Item = z.infer<typeof itemSchema>;
type Fields = Item["fieldData"];

function str(f: Fields, key: string, fallback = ""): string {
  return typeof f[key] === "string" ? (f[key] as string) : fallback;
}
function lines(f: Fields, key: string): string[] {
  return str(f, key)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
/** An image or file field: a plain URL or `{ url }`. */
function media(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "url" in value &&
    typeof value.url === "string"
  )
    return value.url;
  return "";
}

export function parseCollections(raw?: string): Collections | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return z
      .object(
        Object.fromEntries(
          collectionNames.map((name) => [
            name,
            z.string().regex(/^[a-f0-9]{24}$/),
          ]),
        ) as Record<CollectionName, z.ZodString>,
      )
      .parse(parsed);
  } catch {
    return null;
  }
}

/** All published items of a collection, in `display-order`. */
export async function fetchCollection(
  id: string,
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<Item[]> {
  const all: Item[] = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const response = await fetcher(
      "https://api.webflow.com/v2/collections/" +
        id +
        "/items/live?limit=100&offset=" +
        offset,
      {
        headers: { Authorization: "Bearer " + token },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      },
    );
    if (!response.ok)
      throw new Error("Webflow request failed (" + response.status + ")");
    const body = responseSchema.parse(await response.json());
    all.push(...body.items.filter((item) => !item.isDraft && !item.isArchived));
    if (offset + 100 >= body.pagination.total)
      return all.sort(
        (a, b) =>
          Number(a.fieldData["display-order"] ?? 0) -
          Number(b.fieldData["display-order"] ?? 0),
      );
    if (!body.items.length) throw new Error("Incomplete Webflow pagination");
  }
  throw new Error("Webflow collection exceeds safety limit");
}

function mapSections(records: Record<CollectionName, Item[]>) {
  const slugById = new Map(
    records.projects.map((p) => [p.id, str(p.fieldData, "slug")]),
  );
  const sections = new Map<string, CaseStudySection[]>();
  for (const { fieldData: f } of records.sections) {
    const slug = slugById.get(str(f, "project"));
    if (!slug) throw new Error("Unresolved case-study section");
    const section: CaseStudySection = { heading: str(f, "name") };
    if (str(f, "body")) section.body = str(f, "body");
    if (lines(f, "bullets").length) section.bullets = lines(f, "bullets");
    if (str(f, "metric-value"))
      section.metrics = [
        { value: str(f, "metric-value"), label: str(f, "metric-label") },
      ];
    const src = media(f.media);
    if (src) section.media = { src, alt: str(f, "media-alt") };
    sections.set(slug, [...(sections.get(slug) ?? []), section]);
  }
  return { slugById, sections };
}

function mapProject(
  { fieldData: f }: Item,
  slugById: Map<string, string>,
  sections: Map<string, CaseStudySection[]>,
): Project {
  const slug = str(f, "slug");
  const local = localContent.projects.find((p) => p.slug === slug);
  const project: Project = {
    slug,
    title: str(f, "name"),
    badge: str(f, "badge"),
    description: str(f, "description"),
    tags: lines(f, "tags"),
    filters: lines(f, "filters") as FilterId[],
  };
  const links = Object.fromEntries(
    (["github", "devpost", "blog"] as const)
      .filter((key) => str(f, key))
      .map((key) => [key, str(f, key)]),
  );
  if (Object.keys(links).length) project.links = links;
  if (str(f, "achievement"))
    project.achievement = {
      label: str(f, "achievement"),
      detail: str(f, "achievement-detail"),
    };
  const notes: NoteBlock[] = [];
  if (str(f, "notes-meta")) notes.push({ meta: str(f, "notes-meta") });
  if (lines(f, "notes").length) notes.push({ bullets: lines(f, "notes") });
  if (notes.length) project.notes = notes;
  else if (local?.notes) project.notes = local.notes;
  const cover = media(f.cover);
  if (cover) {
    const tech = lines(f, "tech");
    project.caseStudy = {
      focus: str(f, "focus") || local?.caseStudy?.focus || project.badge,
      timeline: str(f, "timeline") || local?.caseStudy?.timeline || "",
      ...(tech.length
        ? { tech }
        : local?.caseStudy?.tech
          ? { tech: local.caseStudy.tech }
          : {}),
      gallery: {
        cover,
        slides: Array.isArray(f.slides) ? f.slides.map(media) : [],
      },
      sections: sections.get(slug) ??
        local?.caseStudy?.sections ?? [
          { heading: "Overview", body: project.description },
        ],
    };
  }
  const parent = str(f, "chapter-of");
  if (parent) {
    if (!slugById.has(parent)) throw new Error("Unresolved project parent");
    project.chapter = {
      of: slugById.get(parent)!,
      badge: str(f, "chapter-badge"),
      label: str(f, "chapter-label"),
      teaser: str(f, "chapter-teaser"),
      back: str(f, "chapter-back"),
    };
  }
  return project;
}

function mapExperience({ fieldData: f }: Item): ExperienceEntry {
  const company = str(f, "name"),
    logo = media(f.logo);
  const local = localContent.experience.find((e) => e.company === company);
  return {
    role: str(f, "role"),
    company,
    dates: str(f, "dates"),
    location: str(f, "location"),
    bullets: lines(f, "bullets"),
    ...(logo
      ? { logo: { src: logo } }
      : local?.logo
        ? { logo: local.logo }
        : {}),
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function mapEducation({ fieldData: f }: Item): EducationEntry {
  const degree = str(f, "name"),
    institution = str(f, "institution"),
    emblem = media(f.logo),
    monogram = str(f, "monogram");
  const local = localContent.education.find((e) => e.degree === degree);
  const tints = [str(f, "tint-from"), str(f, "tint-to")];
  const entry: EducationEntry = {
    degree,
    institution,
    dates: str(f, "dates"),
    level: str(f, "level"),
    logo: emblem
      ? { src: emblem, alt: str(f, "logo-alt", institution) }
      : monogram
        ? { monogram }
        : (local?.logo ?? { monogram: initials(institution) }),
    tint: tints.every((t) => (TINTS as readonly string[]).includes(t))
      ? (tints as [Tint, Tint])
      : (local?.tint ?? ["sky", "saffron"]),
  };
  if (str(f, "award"))
    entry.award = { title: str(f, "award"), detail: str(f, "award-detail") };
  if (local?.activities) entry.activities = local.activities;
  if (lines(f, "notes").length) entry.notes = lines(f, "notes");
  if (lines(f, "coursework").length) entry.coursework = lines(f, "coursework");
  return entry;
}

export function mapCollections(
  records: Record<CollectionName, Item[]>,
): PortfolioContent {
  if (required.some((key) => !records[key]?.length))
    throw new Error("CMS snapshot is incomplete");
  const settings = records.settings[0].fieldData;
  const { slugById, sections } = mapSections(records);
  const socials: SocialLink[] = SOCIAL_NETWORKS.filter((network) =>
    str(settings, network),
  ).map((network) => ({ network, href: str(settings, network) }));
  const roles = lines(settings, "roles");
  return validateContent(
    {
      profile: {
        ...localContent.profile,
        name: str(settings, "name"),
        photo: media(settings.photo),
        location: str(settings, "location"),
        pageTitle: str(settings, "page-title"),
        tagline: str(settings, "tagline"),
        heroEyebrow: str(settings, "hero-eyebrow"),
        ...(roles.length ? { roles } : {}),
        aboutHeadline: str(settings, "about-headline"),
        bio: str(settings, "bio")
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      },
      contact: {
        emails: lines(settings, "emails"),
        resumeUrl: media(settings.resume),
        socials,
      },
      experience: records.experience.map(mapExperience),
      education: records.education.map(mapEducation),
      projects: records.projects.map((item) =>
        mapProject(item, slugById, sections),
      ),
      skills: records.skills.map(({ fieldData: f }) => ({
        category: str(f, "name"),
        skills: lines(f, "skills"),
      })),
      certifications: records.certifications.map(({ fieldData: f }) => ({
        title: str(f, "name"),
        issuer: str(f, "issuer"),
        url: str(f, "url"),
        ...(media(f.logo) ? { logo: media(f.logo) } : {}),
      })),
      publications: records.publications.map(({ fieldData: f }) => ({
        title: str(f, "name"),
        venue: str(f, "venue"),
        date: str(f, "date"),
      })),
      testimonials: records.testimonials.map(({ fieldData: f }) => ({
        quote: str(f, "quote"),
        name: str(f, "name"),
        title: str(f, "title"),
        image: media(f.photo),
      })),
    },
    caseStudyRoutes,
  );
}

export class WebflowContentRepository implements ContentRepository {
  constructor(
    private token: string,
    private collections: Collections,
    private fetcher: typeof fetch = fetch,
  ) {}
  async read() {
    const entries = await Promise.all(
      collectionNames.map(
        async (key) =>
          [
            key,
            await fetchCollection(
              this.collections[key],
              this.token,
              this.fetcher,
            ),
          ] as const,
      ),
    );
    return mapCollections(
      Object.fromEntries(entries) as Record<CollectionName, Item[]>,
    );
  }
}
