import { it, expect, vi } from "vitest";
import {
  collectionNames,
  parseCollections,
  fetchCollection,
  mapCollections,
  WebflowContentRepository,
} from "@/content/webflow";
import { localContent } from "@/content/repository";
import { loadContent } from "@/content/load";
function fixture() {
  const c = localContent;
  const item = (id: string, fieldData: Record<string, unknown>) => ({
    id,
    fieldData,
  });
  const project = (p: (typeof c.projects)[number]) =>
    item(p.slug, {
      name: p.title,
      slug: p.slug,
      kind: p.kind,
      badge: p.badge,
      description: p.description,
      tags: p.tags.join("\n"),
      filters: p.filters.join("\n"),
      featured: p.featured,
      "display-order": p.displayOrder,
      cover: p.gallery?.cover,
      slides: p.gallery?.slides.map((url) => ({ url })),
      parent: p.parentSlug,
      achievement: p.achievement?.label,
      "achievement-detail": p.achievement?.detail,
      ...p.links,
    });
  return {
    settings: [
      item("settings", {
        name: c.profile.name,
        photo: { url: c.profile.photo },
        "page-title": c.profile.pageTitle,
        "hero-eyebrow": c.profile.heroEyebrow,
        tagline: c.profile.tagline,
        bio: c.profile.bio.join("\n\n"),
        "about-headline": c.profile.aboutHeadline,
        location: c.profile.location,
        "resume-summary": c.profile.resumeSummary,
        "open-to-relocation": true,
        emails: c.contact.emails.join("\n"),
        resume: c.contact.resumeUrl,
        ...c.contact.social,
      }),
    ],
    experience: c.experience.map((j, i) =>
      item(String(i), { ...j, name: j.company, bullets: j.bullets.join("\n") }),
    ),
    education: c.education.map((j, i) =>
      item(String(i), { ...j, name: j.degree, bullets: j.bullets.join("\n") }),
    ),
    leadership: c.leadership.map((j, i) =>
      item(String(i), { ...j, name: j.title, bullets: j.bullets.join("\n") }),
    ),
    skills: c.skills.map((j, i) =>
      item(String(i), { name: j.category, skills: j.skills.join("\n") }),
    ),
    testimonials: c.testimonials.map((j, i) =>
      item(String(i), { ...j, photo: { url: j.image } }),
    ),
    projects: c.projects.filter((p) => p.kind !== "certification").map(project),
    credentials: c.projects
      .filter((p) => p.kind === "certification")
      .map(project),
    sections: [
      item("section", {
        name: "Validated CMS section",
        project: "barterbrain-nvc",
        body: "A real editorial CMS field.",
        bullets: "One result\nAnother result",
        "metric-value": "215",
        "metric-label": "Teams",
        media: { url: "/images/projects/barterbrain-nvc/cover.jpg" },
        "media-alt": "Competition",
      }),
    ],
  };
}
it("rejects missing/malformed configuration and accepts exact collection IDs", () => {
  expect(parseCollections()).toBeNull();
  expect(parseCollections("oops")).toBeNull();
  expect(parseCollections("{}")).toBeNull();
  const config = Object.fromEntries(
    collectionNames.map((k) => [k, "a".repeat(24)]),
  );
  expect(parseCollections(JSON.stringify(config))).toEqual(config);
});
it("maps all nine editorial collections with ordered media and references", () => {
  const result = mapCollections(fixture());
  expect(result.projects).toHaveLength(localContent.projects.length);
  expect(
    result.projects.find((p) => p.slug === "barterbrain-nvc")?.sections?.[0],
  ).toMatchObject({
    heading: "Validated CMS section",
    metrics: [{ value: "215", label: "Teams" }],
  });
  expect(result.education[0].degree).toBe(localContent.education[0].degree);
  expect(result.contact).not.toHaveProperty("phone");
});
it("fails the whole snapshot on partial CMS or unresolved references", () => {
  expect(() => mapCollections({ ...fixture(), education: [] })).toThrow(
    "incomplete",
  );
  const f = fixture();
  f.sections[0].fieldData.project = "missing";
  expect(() => mapCollections(f)).toThrow("Unresolved");
  const p = fixture();
  p.projects[0].fieldData.parent = "missing";
  expect(() => mapCollections(p)).toThrow("parent");
});
it("fetches published items with pagination, filters drafts and sorts display order", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            { id: "two", fieldData: { "display-order": 2 } },
            { id: "draft", isDraft: true, fieldData: {} },
          ],
          pagination: { total: 101 },
        }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            { id: "one", fieldData: { "display-order": 1 } },
            { id: "archived", isArchived: true, fieldData: {} },
          ],
          pagination: { total: 101 },
        }),
      ),
    );
  expect(
    (await fetchCollection("collection", "token", fetcher)).map((p) => p.id),
  ).toEqual(["one", "two"]);
  expect(fetcher.mock.calls[1][0]).toContain("offset=100");
});
it("rejects outages, schema errors and truncated pagination", async () => {
  await expect(
    fetchCollection(
      "id",
      "token",
      vi.fn().mockResolvedValue(new Response("", { status: 401 })),
    ),
  ).rejects.toThrow("401");
  await expect(
    fetchCollection(
      "id",
      "token",
      vi.fn().mockResolvedValue(new Response("{}")),
    ),
  ).rejects.toThrow();
  await expect(
    fetchCollection(
      "id",
      "token",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ items: [], pagination: { total: 400 } }),
          ),
        ),
    ),
  ).rejects.toThrow("Incomplete");
});
it("reads a full server repository and uses local content when unconfigured", async () => {
  const f = fixture(),
    ids = Object.fromEntries(
      collectionNames.map((key, i) => [key, String(i).padStart(24, "0")]),
    ) as Record<(typeof collectionNames)[number], string>;
  const fetcher = vi.fn(async (input: RequestInfo | URL) => {
    const index = Number(String(input).split("/collections/")[1].split("/")[0]);
    const key = collectionNames[index];
    return new Response(
      JSON.stringify({ items: f[key], pagination: { total: f[key].length } }),
    );
  });
  const result = await new WebflowContentRepository(
    "fake-token",
    ids,
    fetcher,
  ).read();
  expect(result.profile.name).toBe(localContent.profile.name);
  vi.stubEnv("WEBFLOW_API_TOKEN", "");
  expect(await loadContent()).toBe(localContent);
});
