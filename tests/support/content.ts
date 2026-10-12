/**
 * Builders for synthetic content. Tests change a deep copy, never the real
 * content modules, so suites stay independent.
 */
import { localContent } from "@/content";
import type {
  Certification,
  EducationEntry,
  ExperienceEntry,
  PortfolioContent,
  Project,
  Publication,
  Testimonial,
} from "@/content/types";

/** A deep copy of the local content, changed by `edit`. */
export function contentWith(
  edit: (content: PortfolioContent) => void = () => {},
): PortfolioContent {
  const content = structuredClone(localContent);
  edit(content);
  return content;
}

export const newProject = (overrides: Partial<Project> = {}): Project => ({
  slug: "orbit-planner",
  title: "Orbit Planner",
  badge: "Side project",
  description: "Plans satellite passes with a small scheduling model.",
  tags: ["PyTorch", "FastAPI"],
  filters: ["aiml", "web"],
  ...overrides,
});

export const newCaseStudy = (
  overrides: Partial<NonNullable<Project["caseStudy"]>> = {},
): NonNullable<Project["caseStudy"]> => ({
  focus: "Scheduling / ML",
  timeline: "Jan 2027",
  gallery: {
    cover: "/images/projects/pitchpulse/cover.jpg",
    slides: ["/images/projects/pitchpulse/slide-1.jpg"],
  },
  sections: [
    { heading: "Overview", body: "What the planner does." },
    { heading: "How I built it", bullets: ["A scheduler.", "An API."] },
  ],
  ...overrides,
});

export const newJob = (
  overrides: Partial<ExperienceEntry> = {},
): ExperienceEntry => ({
  role: "Machine Learning Engineer",
  company: "Northwind Labs",
  dates: "Jan 2027 - Dec 2027",
  location: "Remote",
  bullets: ["Shipped ranking models in PyTorch and served them with FastAPI."],
  ...overrides,
});

export const newDegree = (
  overrides: Partial<EducationEntry> = {},
): EducationEntry => ({
  degree: "Graduate Certificate in Robotics",
  institution: "Example Institute of Technology",
  dates: "Aug 2027 - May 2028",
  level: "Certificate",
  logo: { monogram: "EIT" },
  tint: ["rose", "sky"],
  ...overrides,
});

export const newCertification = (
  overrides: Partial<Certification> = {},
): Certification => ({
  title: "Deep Reinforcement Learning",
  issuer: "Example Academy",
  url: "https://example.com/verify/123",
  ...overrides,
});

export const newPublication = (
  overrides: Partial<Publication> = {},
): Publication => ({
  title: "Fast Planning with Learned Heuristics",
  venue: "Workshop on Learning and Planning, Online",
  date: "Jun 2027",
  ...overrides,
});

export const newTestimonial = (
  overrides: Partial<Testimonial> = {},
): Testimonial => ({
  quote: "A thoughtful engineer who ships.",
  name: "Dr. Example Mentor",
  title: "Advisor",
  image: "/images/testimonials/testimonials-1.jpg",
  ...overrides,
});
