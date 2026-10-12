/**
 * The shape of everything the portfolio shows. Each content file in this
 * folder exports data of these types; components render whatever is there,
 * so adding an entry never needs a component change.
 *
 * Images are paths under /public (for example "/images/brands/tcs.svg").
 */

import type { ICONS, SOCIAL_NETWORKS, TINTS, TONES } from "./options";
import type { FilterId } from "./filters";

export type IconName = (typeof ICONS)[number];
export type Tone = (typeof TONES)[number];
export type Tint = (typeof TINTS)[number];
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
export type { FilterId };

/** A small icon + text chip. */
export interface IconChip {
  icon: IconName;
  text: string;
  tone?: Tone;
}

export interface HeroFact {
  icon: IconName;
  text: string;
  /** Icon colour: the school's navy or the location's crimson. */
  accent?: "school" | "place";
}

export interface Profile {
  name: string;
  /** About portrait. */
  photo: string;
  location: string;
  /** Browser tab and share title. */
  pageTitle: string;
  /** Meta description. */
  tagline: string;
  /** The label above the name on the social share image. */
  heroEyebrow: string;
  /** Roles on the share image and in the page keywords. */
  roles: string[];
  hero: {
    /** The pill above the name. */
    availability: string;
    /** The line under the name. */
    intro: string;
    facts: HeroFact[];
  };
  /** About section title. */
  aboutHeadline: string;
  /** About paragraphs, in order. */
  bio: string[];
  aboutHighlights: IconChip[];
  /** Small line under the location pill in About. */
  relocation: string;
}

/** A profile on a known network; its name and icon come with the network. */
export interface SocialLink {
  network: SocialNetwork;
  href: string;
}

export interface ContactInfo {
  /** The first address is shown and used by the contact form fallback. */
  emails: string[];
  resumeUrl: string;
  /** Shown in this order wherever social links appear. */
  socials: SocialLink[];
}

/** A company badge on the experience timeline. */
export type CompanyLogo = { icon: IconName } | { src: string };

export interface ExperienceEntry {
  role: string;
  company: string;
  /** "May 2025 - Aug 2025"; the timeline shows the final year. */
  dates: string;
  location: string;
  bullets: string[];
  /** Defaults to a briefcase. */
  logo?: CompanyLogo;
}

/** A school's badge: a lettered monogram or an emblem image. */
export type SchoolLogo =
  { monogram: string; tone?: Tone } | { src: string; alt: string };

export interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
  /** Eyebrow above the degree, for example "Graduate". */
  level: string;
  logo: SchoolLogo;
  /** The card's two soft corner colours. */
  tint: [Tint, Tint];
  /** A highlighted award row. */
  award?: { title: string; detail: string };
  /** Rows with a small icon. */
  activities?: IconChip[];
  /** Plain rows. */
  notes?: string[];
  /** Rendered as "Relevant Coursework: a, b, c." */
  coursework?: string[];
}

/** One block in a project's notes dialog. */
export type NoteBlock =
  { meta: string } | { text: string } | { bullets: string[] };

export interface CaseStudySection {
  heading: string;
  body?: string;
  bullets?: string[];
  metrics?: { value: string; label: string }[];
  media?: { src: string; alt: string };
}

export interface CaseStudy {
  /** "Focus" in the page header. */
  focus: string;
  /** "Timeline" in the page header. */
  timeline: string;
  /** Tools listed in the header; defaults to the card tags. */
  tech?: string[];
  /** The cover leads the card and the gallery; slides follow in order. */
  gallery: { cover: string; slides: string[] };
  sections: CaseStudySection[];
}

/** How a follow-up project is introduced from the project it continues. */
export interface Chapter {
  /** Slug of the project this one continues. */
  of: string;
  /** Pill on the original project's card, for example "NVC finalist". */
  badge: string;
  /** Accessible name of that pill link. */
  label: string;
  /** Teaser on the original project's case study. */
  teaser: string;
  /** Link text back to the original project. */
  back: string;
}

export interface Project {
  /** URL-safe id: a-z and 0-9 words joined by hyphens, e.g. "orbit-planner". */
  slug: string;
  title: string;
  /** Short category above the title. */
  badge: string;
  description: string;
  tags: string[];
  /** Work filters this project appears under. */
  filters: FilterId[];
  links?: { github?: string; devpost?: string; blog?: string };
  /** Award ribbon on the card and case study. */
  achievement?: { label: string; detail: string };
  /** A "Project notes" dialog on the card. */
  notes?: NoteBlock[];
  /** A full page at /projects/<slug>. */
  caseStudy?: CaseStudy;
  /**
   * A follow-up to another project: it gets a case study but no card of its
   * own, and the original project links to it.
   */
  chapter?: Chapter;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  /** Credential or verification page. */
  url: string;
  /** Issuer logo; without one the card shows the issuer's initials. */
  logo?: string;
}

export interface Publication {
  title: string;
  venue: string;
  /** "May 2023". */
  date: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  image: string;
}

/** Everything the site renders, from local files or the CMS. */
export interface PortfolioContent {
  profile: Profile;
  contact: ContactInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: Project[];
  skills: SkillGroup[];
  certifications: Certification[];
  publications: Publication[];
  testimonials: Testimonial[];
}
