import type { PortfolioContent } from "./types";
import { profile } from "./profile";
import { contact } from "./contact";
import { experience } from "./experience";
import { education } from "./education";
import { projects } from "./projects";
import { skills } from "./skills";
import { certifications } from "./certifications";
import { publications } from "./publications";
import { testimonials } from "./testimonials";

/**
 * All local content. Every fact comes from the original site plus the
 * owner's corrections; nothing is invented. The site renders this unless a
 * configured CMS supplies a complete, valid replacement.
 */
export const localContent: PortfolioContent = {
  profile,
  contact,
  experience,
  education,
  projects,
  skills,
  certifications,
  publications,
  testimonials,
};

export type * from "./types";
