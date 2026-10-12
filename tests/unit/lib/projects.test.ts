import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import {
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
    expect(caseStudies(projects)).toHaveLength(7);
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

  it("orders link buttons GitHub, Devpost, then write-up", () => {
    expect(linkOrder).toEqual(["github", "devpost", "blog"]);
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

  it("treats a new case study like any other", () => {
    const fresh = newProject({ caseStudy: newCaseStudy() });
    const all = [...projects, fresh];
    expect(caseStudies(all).at(-1)).toBe(fresh);
    expect(workProjects(all).at(-1)).toBe(fresh);
  });
});
