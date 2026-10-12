import { describe, it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  localContent,
  validateContent,
  readWithFallback,
  LocalContentRepository,
} from "@/content/repository";
import {
  allProjects,
  caseStudySlugs,
  getFeaturedProjects,
  getGridProjects,
  getPublications,
  getCertifications,
  getProjectBySlug,
  getCaseStudySections,
} from "@/lib/projects";
import {
  navigation,
  isSafeLink,
  getAnchorTarget,
  wrapIndex,
} from "@/lib/navigation";
import { contactSchema, formEndpoint } from "@/lib/contact";
import { getSiteUrl } from "@/lib/site";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
describe("content contracts", () => {
  it("validates the complete local fallback", async () => {
    expect(validateContent(localContent).projects).toHaveLength(
      allProjects.length,
    );
    expect(await new LocalContentRepository().read()).toBe(localContent);
  });
  it("retains factual corrections and removes private telephone values", () => {
    expect(
      localContent.experience.find((e) => e.company.includes("Tata"))?.role ??
        localContent.experience[1].role,
    ).toBe("Machine Learning Intern");
    expect(localContent.contact).not.toHaveProperty("phone");
    expect(localContent.contact).not.toHaveProperty("whatsapp");
  });
  it("has ordered, unique, complete case-study routes", () => {
    expect(getFeaturedProjects().map((p) => p.slug)).toEqual([
      "siri-core-modeling",
      "barterbrain",
      "pitchpulse",
      "historical-event-narrator",
      "coding-problem-recommender",
      "face-cloaking",
    ]);
    expect(new Set(caseStudySlugs).size).toBe(7);
    expect(getProjectBySlug("unknown")).toBeUndefined();
  });
  it("separates startup media from hackathon media", () => {
    const hack = getProjectBySlug("barterbrain")!,
      nvc = getProjectBySlug("barterbrain-nvc")!;
    expect(hack.gallery?.slides.every((s) => !s.includes("nvc"))).toBe(true);
    expect(nvc.parentSlug).toBe(hack.slug);
    expect(nvc.gallery?.slides).toHaveLength(3);
    expect([nvc.gallery?.cover, ...nvc.gallery!.slides]).toEqual([
      "/images/projects/barterbrain-nvc/slide-2.jpg",
      "/images/projects/barterbrain-nvc/slide-1.jpg",
      "/images/projects/barterbrain-nvc/slide-3.jpg",
      "/images/projects/barterbrain-nvc/cover.jpg",
    ]);
    expect(getFeaturedProjects()).not.toContainEqual(nvc);
  });
  it("resolves every local image and resume asset", () => {
    const assets = [
      localContent.profile.photo,
      localContent.contact.resumeUrl,
      ...localContent.testimonials.map((t) => t.image),
      ...allProjects.flatMap((p) =>
        p.gallery ? [p.gallery.cover, ...p.gallery.slides] : [],
      ),
    ];
    for (const asset of assets)
      expect(existsSync(resolve("public", "." + asset)), asset).toBe(true);
  });
  it("has safe rendered external links and the expected content groups", () => {
    for (const p of allProjects)
      for (const [key, value] of Object.entries(p.links))
        if (key !== "detailsPage") expect(isSafeLink(value)).toBe(true);
    expect(getGridProjects()).toHaveLength(5);
    expect(getCertifications()).toHaveLength(9);
    expect(getPublications()).toHaveLength(2);
    expect(
      getProjectBySlug("gi-tract-segmentation")?.links.github,
    ).toBeUndefined();
    expect(getProjectBySlug("water-quality-analysis")?.links.github).toBe(
      "https://github.com/Keerthirajan58/IBM---EFFICIENT-WATER-QUALITY-ANALYSIS-AND-PREDICTION",
    );
  });
  it("builds sections for ordinary, Apple, and standalone startup stories", () => {
    expect(getCaseStudySections(getProjectBySlug("pitchpulse")!)).toHaveLength(
      4,
    );
    expect(
      getCaseStudySections(getProjectBySlug("siri-core-modeling")!)[1].heading,
    ).toBe("At Apple");
    expect(
      getCaseStudySections(getProjectBySlug("barterbrain-nvc")!)[3].metrics?.[0]
        .value,
    ).toBe("215");
    expect(
      getCaseStudySections(getProjectBySlug("siri-core-modeling")!, []),
    ).toHaveLength(1);
  });
  it("falls back atomically on outages or invalid content", async () => {
    const failed = vi.fn();
    expect(
      await readWithFallback(
        {
          read: async () => {
            throw Error("offline");
          },
        },
        failed,
      ),
    ).toBe(localContent);
    expect(failed).toHaveBeenCalledOnce();
    expect(
      await readWithFallback({
        read: async () => ({ ...localContent, projects: [] }),
      }),
    ).toBe(localContent);
    expect(await readWithFallback(new LocalContentRepository())).toEqual(
      validateContent(localContent),
    );
  });
  it("rejects unsafe, duplicate and orphan routes", () => {
    expect(() =>
      validateContent({
        ...localContent,
        projects: [...allProjects, allProjects[0]],
      }),
    ).toThrow("Duplicate");
    expect(() =>
      validateContent({
        ...localContent,
        projects: allProjects.map((p) =>
          p.parentSlug ? { ...p, parentSlug: "missing" } : p,
        ),
      }),
    ).toThrow("parent");
    expect(() =>
      validateContent({
        ...localContent,
        projects: allProjects.filter((p) => p.slug !== "pitchpulse"),
      }),
    ).toThrow("Missing");
    expect(() =>
      validateContent({
        ...localContent,
        projects: [...allProjects, { ...allProjects[0], slug: "new-route" }],
      }),
    ).toThrow("Unknown");
    expect(() =>
      validateContent({
        ...localContent,
        contact: { ...localContent.contact, resumeUrl: "javascript:alert(1)" },
      }),
    ).toThrow();
  });
});
describe("navigation", () => {
  it("accepts only same-page anchors and safe destinations", () => {
    expect(navigation).toHaveLength(5);
    expect(getAnchorTarget("/#about", "https://example.com/")).toBe("about");
    expect(
      getAnchorTarget("/#about", "https://example.com/projects/x"),
    ).toBeNull();
    expect(
      getAnchorTarget("https://evil.com/#about", "https://example.com"),
    ).toBeNull();
    expect(getAnchorTarget("#%zz", "https://example.com")).toBeNull();
    expect(
      getAnchorTarget("https://example.com/?x=1#about", "https://example.com"),
    ).toBeNull();
    expect(isSafeLink("//evil.com")).toBe(false);
    expect(isSafeLink("mailto:a@example.com")).toBe(true);
  });
  it("wraps gallery indexes safely", () => {
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(2, 0)).toBe(0);
  });
  it("produces the full sitemap and robots rules", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(getSiteUrl()).toBe("https://example.com");
    expect(sitemap()).toHaveLength(8);
    expect(robots().sitemap).toBe("https://example.com/sitemap.xml");
  });
});
describe("contact validation", () => {
  it("validates and trims input without allowing arbitrary endpoints", () => {
    expect(
      contactSchema.parse({
        name: " Jane ",
        email: "jane@example.com",
        message: "A genuine message.",
      }).name,
    ).toBe("Jane");
    expect(
      contactSchema.safeParse({ name: "x", email: "bad", message: "short" })
        .success,
    ).toBe(false);
    expect(formEndpoint()).toBeNull();
    expect(formEndpoint("../oops")).toBeNull();
    expect(formEndpoint("abcdefgh")).toBe("https://formspree.io/f/abcdefgh");
  });
});
