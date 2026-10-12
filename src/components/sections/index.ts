import type { ComponentType } from "react";
import type { SectionId } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Hero } from "./hero/Hero";
import { About } from "./about/About";
import { Experience } from "./experience/Experience";
import { Projects } from "./projects/Projects";
import { Skills } from "./skills/Skills";
import { Credentials } from "./credentials/Credentials";
import { Testimonials } from "./testimonials/Testimonials";
import { Contact } from "./contact/Contact";

/** The component behind each home section (order lives in `content/site.ts`). */
export const sectionComponents: Record<
  SectionId,
  ComponentType<{ content?: PortfolioContent }>
> = {
  hero: Hero,
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  credentials: Credentials,
  testimonials: Testimonials,
  contact: Contact,
};
