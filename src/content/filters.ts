/**
 * Work filter chips, in this order after "All work". A chip appears only
 * when at least one project card uses it. To add a filter, add it here and
 * use its id in a project's `filters`.
 */
export const projectFilters = [
  { id: "aiml", label: "AIML" },
  { id: "genai", label: "GenAI" },
  { id: "hackathon", label: "Hackathons" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "cv", label: "Computer Vision" },
  { id: "startup", label: "Startups" },
] as const;

export type FilterId = (typeof projectFilters)[number]["id"];

export const allWorkLabel = "All work";
