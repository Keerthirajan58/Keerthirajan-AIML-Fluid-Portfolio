import { allWorkLabel, projectFilters, type FilterId } from "@/content/filters";

/** A work filter choice: one category, or everything. */
export type FilterChoice = FilterId | "all";

export function matchesFilter(
  filters: readonly string[],
  selected: FilterChoice,
) {
  return selected === "all" || filters.includes(selected);
}

/** "All work" plus each category that has at least one item, with counts. */
export function availableFilters(items: { filters: readonly string[] }[]) {
  return [{ id: "all" as const, label: allWorkLabel }, ...projectFilters]
    .map((filter) => ({
      ...filter,
      count: items.filter((item) => matchesFilter(item.filters, filter.id))
        .length,
    }))
    .filter((filter) => filter.id === "all" || filter.count > 0);
}
