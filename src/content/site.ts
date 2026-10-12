/**
 * The home page, top to bottom, and the words around each section. Reorder
 * or rename sections here: the header links (`nav`), the training monitor's
 * epochs (`epoch`) and each section's heading all follow this list.
 */
export type SectionId =
  | "hero"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "credentials"
  | "testimonials"
  | "contact";

export interface SectionInfo {
  id: SectionId;
  /** Name in the training monitor. */
  epoch: string;
  /** Header link text; sections without one stay out of the header. */
  nav?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
}

export const homeSections: SectionInfo[] = [
  { id: "hero", epoch: "Intro" },
  // About's title is the profile's `aboutHeadline`.
  { id: "about", epoch: "About", nav: "About", eyebrow: "About" },
  {
    id: "experience",
    epoch: "Experience",
    nav: "Experience",
    eyebrow: "Experience",
    title: "Where I've worked",
    lede: "From web development to modeling and evaluation work on Siri.",
  },
  {
    id: "projects",
    epoch: "Work",
    nav: "Work",
    eyebrow: "Work",
    title: "Selected work",
    lede: "Machine learning, generative AI, and the full-stack software that ships them. Open a project for the full case study.",
  },
  {
    id: "skills",
    epoch: "Skills",
    nav: "Skills",
    eyebrow: "Skills",
    title: "Tools I work with",
  },
  {
    id: "credentials",
    epoch: "Credentials",
    eyebrow: "Credentials",
    title: "Research & certifications",
  },
  {
    id: "testimonials",
    epoch: "Recommendations",
    eyebrow: "Recommendations",
    title: "From people I've worked with",
  },
  { id: "contact", epoch: "Contact", nav: "Contact" },
];

export function sectionInfo(id: SectionId): SectionInfo {
  const info = homeSections.find((s) => s.id === id);
  if (!info) throw new Error(`Unknown section: ${id}`);
  return info;
}

/** Header links, in page order. */
export const navigation = homeSections.flatMap((s) =>
  s.nav ? [{ id: s.id, label: s.nav }] : [],
);

/** Other words that frame the content. */
export const copy = {
  education: {
    title: "Education",
    note: "One throughline: keep learning.",
  },
  skills: {
    note: "Bigger bubbles appear in more of my projects and roles. Hover one to see where.",
  },
  credentials: {
    publications: "Publications",
    certifications: "Certifications",
  },
  contact: {
    availability: "Open to opportunities",
    heading: "Have a role in mind?",
    headingAccent: "Let's talk.",
    lede: (location: string) =>
      `I'm looking for AIML and software engineering roles. Based in ${location}, open to relocation.`,
    cardNote: "AIML & software engineering opportunities",
  },
};
