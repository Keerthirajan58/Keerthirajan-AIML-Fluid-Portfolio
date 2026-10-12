import type { Profile } from "./types";

const location = "San Francisco, CA";

export const profile: Profile = {
  name: "Keerthirajan Senthilkumar",
  photo: "/images/profile.jpg",
  location,
  pageTitle: "Keerthirajan · AI, end to end",
  tagline:
    "Keerthirajan Senthilkumar builds AI end to end: fine-tuning and evaluating models, and the agents, retrieval and full-stack products around them.",
  heroEyebrow: "AIML & Software Engineering Graduate",
  roles: [
    "AIML Engineer",
    "Software Engineer",
    "AIML Evaluation Builder",
    "Full-Stack Developer",
  ],
  hero: {
    availability: "Open to AIML & software engineering roles",
    intro: "AIML + Software Engineering",
    facts: [
      { icon: "apple", text: "Apple AIML Intern" },
      { icon: "graduation", text: "MS CS · GWU 2026", accent: "school" },
      { icon: "pin", text: location, accent: "place" },
    ],
  },
  aboutHeadline: "AIML / Software Engineer",
  bio: [
    "I am a recent Master's in Computer Science graduate from The George Washington University, specializing in AIML and software engineering. My work sits at the intersection of machine learning systems, evaluation design, and practical full-stack development, with recent industry experience as an AIML Machine Learning Engineer intern on Apple's Siri Core Modeling team.",
    "I build data-driven products with a focus on reliable model behavior, clean engineering, and measurable user value. My recent work includes LLM evaluation workflows, transformer-based modeling, mobile applications, applied ML projects, and responsive web experiences.",
  ],
  aboutHighlights: [
    { icon: "award", tone: "gold", text: "SEAS Dean's Award" },
    { icon: "apple", tone: "ink", text: "Apple AIML Internship" },
    { icon: "graduation", tone: "navy", text: "AIML + Full Stack Projects" },
  ],
  relocation: "Open to relocation",
};
