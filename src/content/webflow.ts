import { z } from "zod";
import {
  localContent,
  validateContent,
  type ContentRepository,
  type PortfolioContent,
} from "./repository";
import type { ProjectEntry, CaseStudySection } from "./data";
export const collectionNames = [
  "settings",
  "experience",
  "education",
  "leadership",
  "projects",
  "sections",
  "skills",
  "credentials",
  "testimonials",
] as const;
export type Collections = Record<(typeof collectionNames)[number], string>;
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
type Item = z.infer<typeof itemSchema>;
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
        ) as Record<(typeof collectionNames)[number], z.ZodString>,
      )
      .parse(parsed);
  } catch {
    return null;
  }
}
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
export function mapCollections(
  records: Record<(typeof collectionNames)[number], Item[]>,
): PortfolioContent {
  if (collectionNames.some((key) => !records[key]?.length))
    throw new Error("CMS snapshot is incomplete");
  const settings = records.settings[0].fieldData;
  const projectById = new Map(
    records.projects.map((p) => [p.id, str(p.fieldData, "slug")]),
  );
  const sections = new Map<string, CaseStudySection[]>();
  for (const item of records.sections) {
    const f = item.fieldData,
      parent = projectById.get(str(f, "project"));
    if (!parent) throw new Error("Unresolved case-study section");
    const s: CaseStudySection = {
      heading: str(f, "name"),
      ...(str(f, "body") ? { body: str(f, "body") } : {}),
      ...(lines(f, "bullets").length ? { bullets: lines(f, "bullets") } : {}),
    };
    const src = media(f.media);
    if (src) s.media = { src, alt: str(f, "media-alt") };
    if (str(f, "metric-value"))
      s.metrics = [
        { value: str(f, "metric-value"), label: str(f, "metric-label") },
      ];
    sections.set(parent, [...(sections.get(parent) ?? []), s]);
  }
  const mapProject = (item: Item, credential = false): ProjectEntry => {
    const f = item.fieldData,
      slug = str(f, "slug"),
      old = localContent.projects.find((p) => p.slug === slug);
    const cover = media(f.cover),
      slides = Array.isArray(f.slides) ? f.slides.map(media) : [];
    const parent = str(f, "parent");
    if (parent && !projectById.has(parent))
      throw new Error("Unresolved project parent");
    return {
      slug,
      title: str(f, "name"),
      kind: credential
        ? "certification"
        : (str(f, "kind", "case-study") as ProjectEntry["kind"]),
      featured: f.featured === true,
      badge: str(f, "badge"),
      description: str(f, "description"),
      tags: lines(f, "tags"),
      filters: lines(f, "filters"),
      primaryImage: cover,
      displayOrder:
        typeof f["display-order"] === "number" ? f["display-order"] : 99,
      ...(cover
        ? { gallery: { cover, slides, imageStatus: "real" as const } }
        : {}),
      ...(parent ? { parentSlug: projectById.get(parent) } : {}),
      ...(str(f, "achievement")
        ? {
            achievement: {
              label: str(f, "achievement"),
              detail: str(f, "achievement-detail"),
            },
          }
        : {}),
      links: Object.fromEntries(
        ["github", "devpost", "blog", "credential"]
          .filter((k) => str(f, k))
          .map((k) => [k, str(f, k)]),
      ),
      sections: sections.get(slug) ?? old?.sections,
      ...(old?.caseStudy
        ? {
            caseStudy: {
              ...old.caseStudy,
              category: str(f, "category", old.caseStudy.category),
              dates: str(f, "dates", old.caseStudy.dates),
            },
          }
        : {}),
    };
  };
  return validateContent({
    profile: {
      ...localContent.profile,
      name: str(settings, "name"),
      photo: media(settings.photo),
      pageTitle: str(settings, "page-title"),
      heroEyebrow: str(settings, "hero-eyebrow"),
      tagline: str(settings, "tagline"),
      bio: str(settings, "bio")
        .split(/\n\s*\n/)
        .filter(Boolean),
      aboutHeadline: str(settings, "about-headline"),
      location: str(settings, "location"),
      resumeSummary: str(settings, "resume-summary"),
      openToRelocation: settings["open-to-relocation"] === true,
    },
    contact: {
      emails: lines(settings, "emails"),
      location: str(settings, "location"),
      resumeUrl: media(settings.resume),
      social: {
        linkedin: str(settings, "linkedin"),
        github: str(settings, "github"),
        leetcode: str(settings, "leetcode"),
      },
    },
    experience: records.experience.map(({ fieldData: f }) => ({
      company: str(f, "name"),
      role: str(f, "role"),
      dates: str(f, "dates"),
      location: str(f, "location"),
      bullets: lines(f, "bullets"),
    })),
    education: records.education.map(({ fieldData: f }) => ({
      degree: str(f, "name"),
      institution: str(f, "institution"),
      dates: str(f, "dates"),
      bullets: lines(f, "bullets"),
    })),
    leadership: records.leadership.map(({ fieldData: f }) => ({
      title: str(f, "name"),
      role: str(f, "role"),
      dates: str(f, "dates"),
      bullets: lines(f, "bullets"),
    })),
    skills: records.skills.map(({ fieldData: f }) => ({
      category: str(f, "name"),
      skills: lines(f, "skills"),
    })),
    projects: [
      ...records.projects.map((p) => mapProject(p)),
      ...records.credentials.map((p) => mapProject(p, true)),
    ],
    testimonials: records.testimonials.map(({ fieldData: f }) => ({
      name: str(f, "name"),
      title: str(f, "title"),
      quote: str(f, "quote"),
      image: media(f.photo),
    })),
  });
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
      Object.fromEntries(entries) as Record<
        (typeof collectionNames)[number],
        Item[]
      >,
    );
  }
}
