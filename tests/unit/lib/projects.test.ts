import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import {
  shareImage,
  caseStudies,
  chaptersOf,
  getProjectBySlug,
  linkOrder,
  parentOf,
  projectLinks,
  projectRoute,
  workProjects,
} from "@/lib/projects";
import { newCaseStudy, newProject } from "../../support/content";

const { projects } = localContent;
const bySlug = (slug: string) => getProjectBySlug(slug, projects)!;

describe("project selectors", () => {
  it("lists work cards in content order, without chapters", () => {
    expect(workProjects(projects).map((p) => p.slug)).toEqual([
      "siri-core-modeling",
      "bugbout",
      "nightshift",
      "job-event-search",
      "barterbrain",
      "pitchpulse",
      "historical-event-narrator",
      "coding-problem-recommender",
      "face-cloaking",
      "moodbites",
      "gi-tract-segmentation",
      "water-quality-analysis",
      "twitter-sentiment-analysis",
      "charity-donation-website",
    ]);
  });

  it("finds case studies and their routes", () => {
    expect(caseStudies(projects)).toHaveLength(10);
    expect(projectRoute(bySlug("pitchpulse"))).toBe("/projects/pitchpulse");
    expect(projectRoute(bySlug("moodbites"))).toBeUndefined();
    expect(getProjectBySlug("unknown", projects)).toBeUndefined();
  });

  it("links a chapter and its original both ways", () => {
    const original = bySlug("barterbrain"),
      chapter = bySlug("barterbrain-nvc");
    expect(chaptersOf(original, projects)).toEqual([chapter]);
    expect(chaptersOf(bySlug("pitchpulse"), projects)).toEqual([]);
    expect(parentOf(chapter, projects)).toBe(original);
    expect(parentOf(original, projects)).toBeUndefined();
  });

  it("orders link buttons code, package, demo, Devpost, then write-ups", () => {
    expect(linkOrder).toEqual([
      "github",
      "pypi",
      "video",
      "devpost",
      "blog",
      "devto",
    ]);
    const p = newProject({
      links: {
        blog: "https://example.com/post",
        github: "https://github.com/x/y",
      },
    });
    expect(projectLinks(p)).toEqual([
      { kind: "github", href: "https://github.com/x/y" },
      { kind: "blog", href: "https://example.com/post" },
    ]);
    expect(projectLinks(newProject())).toEqual([]);
  });

  it("shares a project's own image with its description, never an illustration", () => {
    const study = newCaseStudy();
    // The first screenshot, described when the gallery says what it shows.
    expect(shareImage(newProject({ caseStudy: study }))).toEqual({
      url: study.gallery!.cover,
      alt: "Orbit Planner",
    });
    expect(
      shareImage(
        newProject({
          caseStudy: newCaseStudy({
            gallery: { ...study.gallery!, alt: ["Planner", "Slide"] },
          }),
        }),
      ),
    ).toEqual({ url: study.gallery!.cover, alt: "Planner" });
    // A card image made from the project wins; an illustrative one never does.
    const card = "/images/projects/orbit-planner/card.jpg";
    expect(
      shareImage(newProject({ caseStudy: study, coverDisplay: { src: card } })),
    ).toEqual({ url: card, alt: "Orbit Planner" });
    expect(
      shareImage(
        newProject({
          coverDisplay: { src: card, alt: "A drawing", illustrative: true },
        }),
      ),
    ).toBeNull();
  });

  it("treats a new case study like any other", () => {
    const fresh = newProject({ caseStudy: newCaseStudy() });
    const all = [...projects, fresh];
    expect(caseStudies(all).at(-1)).toBe(fresh);
    expect(workProjects(all).at(-1)).toBe(fresh);
  });
});
