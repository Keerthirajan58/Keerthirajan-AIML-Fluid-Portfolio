/**
 * The optional Webflow CMS source: field mapping, local fallbacks for visual
 * choices, ordering, pagination and failure handling.
 */
import { describe, expect, it, vi } from "vitest";
import { localContent as local } from "@/content";
import type { PortfolioContent, Project } from "@/content/types";
import {
  collectionNames,
  fetchCollection,
  mapCollections,
  parseCollections,
  WebflowContentRepository,
  type CollectionName,
  type Item,
} from "@/lib/content/webflow";

const item = (id: string, fieldData: Record<string, unknown>): Item => ({
  id,
  fieldData,
});

const projectFields = (p: Project): Record<string, unknown> => ({
  name: p.title,
  slug: p.slug,
  badge: p.badge,
  description: p.description,
  tags: p.tags.join("\n"),
  filters: p.filters.join("\n"),
  ...p.links,
  achievement: p.achievement?.label,
  "achievement-detail": p.achievement?.detail,
  cover: p.caseStudy && { url: p.caseStudy.gallery.cover },
  slides: p.caseStudy?.gallery.slides.map((url) => ({ url })),
  focus: p.caseStudy?.focus,
  timeline: p.caseStudy?.timeline,
  tech: p.caseStudy?.tech?.join("\n"),
  "chapter-of": p.chapter?.of,
  "chapter-badge": p.chapter?.badge,
  "chapter-label": p.chapter?.label,
  "chapter-teaser": p.chapter?.teaser,
  "chapter-back": p.chapter?.back,
});

/** The local content, written out the way the CMS would hold it. */
function snapshot(c: PortfolioContent = local): Record<CollectionName, Item[]> {
  const social = Object.fromEntries(
    c.contact.socials.map((s) => [s.network, s.href]),
  );
  return {
    settings: [
      item("settings", {
        name: c.profile.name,
        photo: { url: c.profile.photo },
        location: c.profile.location,
        "page-title": c.profile.pageTitle,
        tagline: c.profile.tagline,
        "hero-eyebrow": c.profile.heroEyebrow,
        roles: c.profile.roles.join("\n"),
        "about-headline": c.profile.aboutHeadline,
        bio: c.profile.bio.join("\n\n"),
        emails: c.contact.emails.join("\n"),
        resume: c.contact.resumeUrl,
        ...social,
      }),
    ],
    experience: c.experience.map((j, i) =>
      item(`job-${i}`, {
        name: j.company,
        role: j.role,
        dates: j.dates,
        location: j.location,
        bullets: j.bullets.join("\n"),
      }),
    ),
    education: c.education.map((e, i) =>
      item(`school-${i}`, {
        name: e.degree,
        institution: e.institution,
        dates: e.dates,
        level: e.level,
        award: e.award?.title,
        "award-detail": e.award?.detail,
        notes: e.notes?.join("\n"),
        coursework: e.coursework?.join("\n"),
        "tint-from": e.tint[0],
        "tint-to": e.tint[1],
      }),
    ),
    // Chapters reference their original by CMS item id: here, the slug.
    projects: c.projects.map((p) => item(p.slug, projectFields(p))),
    sections: [],
    skills: c.skills.map((g, i) =>
      item(`skills-${i}`, { name: g.category, skills: g.skills.join("\n") }),
    ),
    certifications: c.certifications.map((cert, i) =>
      item(`cert-${i}`, {
        name: cert.title,
        issuer: cert.issuer,
        url: cert.url,
        logo: cert.logo && { url: cert.logo },
      }),
    ),
    publications: c.publications.map((p, i) =>
      item(`paper-${i}`, { name: p.title, venue: p.venue, date: p.date }),
    ),
    testimonials: c.testimonials.map((t, i) =>
      item(`quote-${i}`, {
        name: t.name,
        title: t.title,
        quote: t.quote,
        photo: { url: t.image },
      }),
    ),
  };
}

describe("Webflow configuration", () => {
  it("needs a 24-character id for every collection", () => {
    expect(parseCollections()).toBeNull();
    expect(parseCollections("oops")).toBeNull();
    expect(parseCollections("{}")).toBeNull();
    const ids = Object.fromEntries(
      collectionNames.map((k) => [k, "a".repeat(24)]),
    );
    expect(parseCollections(JSON.stringify(ids))).toEqual(ids);
    expect(
      parseCollections(JSON.stringify({ ...ids, skills: "short" })),
    ).toBeNull();
  });
});

describe("Webflow mapping", () => {
  it("round-trips the local content exactly", () => {
    expect(mapCollections(snapshot())).toEqual(local);
  });

  it("takes case-study sections from the CMS when present", () => {
    const records = snapshot();
    records.sections = [
      item("s1", {
        project: "pitchpulse",
        name: "From the CMS",
        body: "Edited in Webflow.",
        bullets: "One\n\nTwo",
        "metric-value": "36h",
        "metric-label": "Build time",
        media: { url: "/images/projects/pitchpulse/cover.jpg" },
        "media-alt": "PitchPulse",
      }),
      item("s2", { project: "pitchpulse", name: "Second", body: "More." }),
    ];
    const sections = mapCollections(records).projects.find(
      (p) => p.slug === "pitchpulse",
    )!.caseStudy!.sections;
    expect(sections).toEqual([
      {
        heading: "From the CMS",
        body: "Edited in Webflow.",
        bullets: ["One", "Two"],
        metrics: [{ value: "36h", label: "Build time" }],
        media: {
          src: "/images/projects/pitchpulse/cover.jpg",
          alt: "PitchPulse",
        },
      },
      { heading: "Second", body: "More." },
    ]);
  });

  it("maps CMS-only entries with sensible defaults", () => {
    const records = snapshot();
    records.experience.push(
      item("new-job", {
        name: "Northwind Labs",
        role: "ML Engineer",
        dates: "Jan 2027 - Dec 2027",
        location: "Remote",
        bullets: "Shipped models.",
        logo: { url: "/images/brands/tcs.svg" },
      }),
      item("no-logo", {
        name: "Fabrikam",
        role: "Engineer",
        dates: "2028",
        location: "Remote",
        bullets: "Built things.",
      }),
    );
    records.education.push(
      item("emblem", {
        name: "Certificate in Robotics",
        institution: "Example Institute",
        dates: "2027",
        level: "Certificate",
        logo: "/images/brands/svce.jpg",
        "tint-from": "teal",
      }),
      item("lettered", {
        name: "Diploma in Design",
        institution: "Example School of Art",
        dates: "2028",
        level: "Diploma",
        monogram: "ESA",
      }),
      item("plain", {
        name: "Summer Course",
        institution: "Massachusetts Institute of Technology",
        dates: "2029",
        level: "Course",
      }),
    );
    records.projects.push(
      item("grid-only", {
        name: "Side Project",
        slug: "side-project",
        badge: "Weekend",
        description: "A small tool.",
        tags: "Rust",
        filters: "web",
        "notes-meta": "Solo · 2027",
        notes: "Wrote it.\nShipped it.",
      }),
    );
    records.certifications.push(
      item("cert", {
        name: "New Cert",
        issuer: "Example",
        url: "https://example.com/c",
      }),
    );
    const result = mapCollections(records);
    expect(result.experience.at(-2)?.logo).toEqual({
      src: "/images/brands/tcs.svg",
    });
    expect(result.experience.at(-1)).not.toHaveProperty("logo");
    const [emblem, lettered, plain] = result.education.slice(-3);
    expect(emblem.logo).toEqual({
      src: "/images/brands/svce.jpg",
      alt: "Example Institute",
    });
    // An unknown tint falls back to a default pair.
    expect(emblem.tint).toEqual(["sky", "saffron"]);
    expect(lettered.logo).toEqual({ monogram: "ESA" });
    expect(plain.logo).toEqual({ monogram: "MI" });
    expect(result.projects.at(-1)).toEqual({
      slug: "side-project",
      title: "Side Project",
      badge: "Weekend",
      description: "A small tool.",
      tags: ["Rust"],
      filters: ["web"],
      notes: [
        { meta: "Solo · 2027" },
        { bullets: ["Wrote it.", "Shipped it."] },
      ],
    });
    expect(result.certifications.at(-1)).not.toHaveProperty("logo");
  });

  it("only lists the social networks the CMS fills in", () => {
    const records = snapshot();
    delete records.settings[0].fieldData.leetcode;
    records.settings[0].fieldData.roles = "";
    const result = mapCollections(records);
    expect(result.contact.socials.map((s) => s.network)).toEqual([
      "linkedin",
      "github",
    ]);
    // Without CMS roles the local ones stay.
    expect(result.profile.roles).toEqual(local.profile.roles);
  });

  it("fills a case study's missing details from the matching local one", () => {
    const records = snapshot();
    const siri = records.projects.find((p) => p.id === "siri-core-modeling")!;
    Object.assign(siri.fieldData, { focus: "", timeline: "", tech: "" });
    const pitch = records.projects.find((p) => p.id === "pitchpulse")!;
    pitch.fieldData.tech = "";
    // A brand-new case study needs a built page, so validation stops it:
    // without a timeline it fails the schema, with one it fails the routes.
    const fresh = (timeline: string) =>
      item("fresh", {
        ...projectFields(local.projects[0]),
        slug: "fresh-study",
        focus: "",
        timeline,
      });
    records.projects.push(fresh(""));
    expect(() => mapCollections(records)).toThrow("Too small");
    records.projects.splice(-1, 1, fresh("2027"));
    expect(() => mapCollections(records)).toThrow(
      "Unknown case study route: fresh-study",
    );
    records.projects.pop();
    const mapped = mapCollections(records).projects;
    for (const slug of ["siri-core-modeling", "pitchpulse"])
      expect(mapped.find((p) => p.slug === slug)?.caseStudy).toEqual(
        local.projects.find((p) => p.slug === slug)?.caseStudy,
      );
  });

  it("maps sparse CMS entries: bullets-only sections, no slides, education notes", () => {
    const records = snapshot();
    records.sections = [
      item("s", {
        project: "face-cloaking",
        name: "Just bullets",
        bullets: "A\nB",
      }),
    ];
    const face = records.projects.find((p) => p.id === "face-cloaking")!;
    delete face.fieldData.slides;
    records.education[0].fieldData.notes = "Thesis track.\nTeaching assistant.";
    const result = mapCollections(records);
    const study = result.projects.find(
      (p) => p.slug === "face-cloaking",
    )!.caseStudy!;
    expect(study.sections).toEqual([
      { heading: "Just bullets", bullets: ["A", "B"] },
    ]);
    expect(study.gallery.slides).toEqual([]);
    expect(result.education[0].notes).toEqual([
      "Thesis track.",
      "Teaching assistant.",
    ]);
  });

  it("rejects an incomplete snapshot or unresolved references", () => {
    expect(() => mapCollections({ ...snapshot(), education: [] })).toThrow(
      "incomplete",
    );
    const orphanSection = snapshot();
    orphanSection.sections = [item("s", { project: "missing", name: "Lost" })];
    expect(() => mapCollections(orphanSection)).toThrow(
      "Unresolved case-study section",
    );
    const orphanChapter = snapshot();
    orphanChapter.projects.find((p) => p.id === "barterbrain-nvc")!.fieldData[
      "chapter-of"
    ] = "missing";
    expect(() => mapCollections(orphanChapter)).toThrow(
      "Unresolved project parent",
    );
  });
});

describe("Webflow API", () => {
  const page = (items: unknown[], total: number) =>
    new Response(JSON.stringify({ items, pagination: { total } }));

  it("pages through published items, skips drafts and sorts by display order", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        page(
          [
            { id: "two", fieldData: { "display-order": 2 } },
            { id: "draft", isDraft: true, fieldData: {} },
          ],
          101,
        ),
      )
      .mockResolvedValueOnce(
        page(
          [
            { id: "one", fieldData: { "display-order": 1 } },
            { id: "archived", isArchived: true, fieldData: {} },
            { id: "zero", fieldData: {} },
          ],
          101,
        ),
      );
    const items = await fetchCollection("collection", "token", fetcher);
    expect(items.map((p) => p.id)).toEqual(["zero", "one", "two"]);
    expect(fetcher.mock.calls[1][0]).toContain("offset=100");
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      headers: { Authorization: "Bearer token" },
      cache: "no-store",
    });
  });

  it("rejects outages, bad payloads, truncated pages and runaway collections", async () => {
    await expect(
      fetchCollection(
        "id",
        "token",
        vi.fn().mockResolvedValue(new Response("", { status: 401 })),
      ),
    ).rejects.toThrow("Webflow request failed (401)");
    await expect(
      fetchCollection(
        "id",
        "token",
        vi.fn().mockResolvedValue(new Response("{}")),
      ),
    ).rejects.toThrow();
    await expect(
      fetchCollection("id", "token", vi.fn().mockResolvedValue(page([], 400))),
    ).rejects.toThrow("Incomplete Webflow pagination");
    const endless = vi.fn(async () =>
      page(
        Array.from({ length: 100 }, (_, i) => ({
          id: String(i),
          fieldData: {},
        })),
        1_000_000,
      ),
    );
    await expect(fetchCollection("id", "token", endless)).rejects.toThrow(
      "exceeds safety limit",
    );
  });

  it("reads every collection through the repository", async () => {
    const records = snapshot();
    const ids = Object.fromEntries(
      collectionNames.map((key, i) => [key, String(i).padStart(24, "0")]),
    ) as Record<CollectionName, string>;
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const index = Number(
        String(input).split("/collections/")[1].split("/")[0],
      );
      const items = records[collectionNames[index]];
      return page(items, items.length);
    });
    const result = await new WebflowContentRepository(
      "token",
      ids,
      fetcher,
    ).read();
    expect(result).toEqual(local);
    expect(fetcher).toHaveBeenCalledTimes(collectionNames.length);
  });
});
