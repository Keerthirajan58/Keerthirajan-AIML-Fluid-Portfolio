import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { allWorkLabel, projectFilters } from "@/content/filters";
import { availableFilters, matchesFilter } from "@/lib/filters";
import { workProjects } from "@/lib/projects";

describe("work filters", () => {
  it("counts real work per category and hides empty ones", () => {
    const counts = availableFilters(workProjects(localContent.projects));
    expect(Object.fromEntries(counts.map((f) => [f.id, f.count]))).toEqual({
      all: 14,
      aiml: 13,
      genai: 8,
      hackathon: 2,
      web: 5,
      mobile: 3,
      cv: 3,
      opensource: 1,
    });
    // "Startups" exists, but only the NVC chapter (not a card) uses it.
    expect(counts.some((f) => f.id === "startup")).toBe(false);
    expect(counts[0]).toEqual({ id: "all", label: allWorkLabel, count: 14 });
  });

  it("shows a category as soon as one item uses it", () => {
    expect(
      availableFilters([{ filters: ["startup"] }]).map((f) => f.id),
    ).toEqual(["all", "startup"]);
    expect(availableFilters([])).toEqual([
      { id: "all", label: "All work", count: 0 },
    ]);
  });

  it("matches everything for 'all' and exact ids otherwise", () => {
    expect(matchesFilter([], "all")).toBe(true);
    expect(matchesFilter(["web"], "web")).toBe(true);
    expect(matchesFilter(["web"], "aiml")).toBe(false);
  });

  it("keeps the chip order of the filter list", () => {
    const ids = availableFilters([
      { filters: projectFilters.map((f) => f.id) },
    ]).map((f) => f.id);
    expect(ids).toEqual(["all", ...projectFilters.map((f) => f.id)]);
  });
});
