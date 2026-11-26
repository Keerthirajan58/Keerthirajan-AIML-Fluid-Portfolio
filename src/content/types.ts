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
  /** "May 2025 - Aug 2025" or "Aug 2026 - Present"; the timeline shows the final year (or "Now"). */
  dates: string;
  /** Omit when unknown; the card then shows no location. */
  location?: string;
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
  /**
   * Screenshots: the cover leads the card and the gallery, slides follow in
   * order. Without a gallery the page has no "A closer look" section and the
   * card uses a dropped-in cover file or its placeholder.
   */
  gallery?: {
    cover: string;
    slides: string[];
    /** Describes each image, cover first; defaults to "<title>, image N". */
    alt?: string[];
  };
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
  /** Buttons on the case study, shown in a fixed order (see `linkOrder`). */
  links?: {
    github?: string;
    pypi?: string;
    /** A demo video. */
    video?: string;
    devpost?: string;
    /** A write-up; labelled "Read on Medium" when it is on Medium. */
    blog?: string;
    /** The same write-up on DEV. */
    devto?: string;
  };
  /** How the card shows its cover. */
  coverDisplay?: {
    /** An image made for the card, used instead of the case study's first screenshot; needs `alt`. */
    src?: string;
    /** Shows the whole image, for wide screenshots, instead of filling the frame. */
    fit?: "contain";
    /** Describes the cover when "<title> preview" would mislead, e.g. an illustration. */
    alt?: string;
    /** The cover only illustrates the project (a drawn mock-up, not a screenshot); the card says so. */
    illustrative?: boolean;
  };
  /**
   * The code is private: no repository link, and the card and case study say
   * so and offer a walkthrough through the contact section instead.
   */
  privateRepo?: boolean;
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

/** A pull request to someone else's open-source project. */
export interface Contribution {
  /** The project, as people know it, e.g. "Nebari". */
  project: string;
  /** owner/name on GitHub. */
  repo: string;
  /** The pull request. */
  url: string;
  /** What the change does, in a few words. */
  title: string;
  /** One sentence on the problem it solves. */
  summary: string;
  /** Merged upstream, or still open and in review. */
  status: "merged" | "open";
  /** When it was merged (or opened, if still in review), e.g. "Oct 2026". */
  date: string;
  tech: string[];
  /** A prize the contribution won, shown as a gold pill, e.g. "$100 prize". */
  award?: string;
}

export interface OpenSourceWork {
  /** Slugs of projects I maintain as open source (they must exist in projects). */
  maintained: string[];
  /** Shown in this order: merged work first, then work in review. */
  contributions: Contribution[];
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
  openSource: OpenSourceWork;
  testimonials: Testimonial[];
}
