export const projectFilters = [
  { id: "all", label: "All work" },
  { id: "aiml", label: "AIML" },
  { id: "genai", label: "GenAI" },
  { id: "hackathon", label: "Hackathons" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "cv", label: "Computer Vision" },
] as const;
export type ProjectFilter = (typeof projectFilters)[number]["id"];
export function matchesProjectFilter(
  filters: readonly string[],
  selected: ProjectFilter,
) {
  return selected === "all" || filters.includes(selected);
}
export function availableProjectFilters(
  items: { filters: readonly string[] }[],
) {
  return projectFilters
    .map((filter) => ({
      ...filter,
      count: items.filter((item) =>
        matchesProjectFilter(item.filters, filter.id),
      ).length,
    }))
    .filter((filter) => filter.id === "all" || filter.count > 0);
}
