import { appleInternship } from "../experience";
import type { Project } from "../types";

const description =
  "Apple AIML internship focused on modeling workflows, LLM evaluation, embeddings, fine-tuning, and performance benchmarking.";

export const siriCoreModeling: Project = {
  slug: "siri-core-modeling",
  title: "Siri Core Modeling",
  badge: "Featured Experience",
  description,
  tags: ["PyTorch", "Transformers", "LLM Evaluation"],
  filters: ["aiml", "genai"],
  caseStudy: {
    focus: "Featured Experience",
    timeline: "May – August 2025",
    gallery: {
      cover: "/images/projects/siri-core-modeling/cover.jpg",
      slides: [
        "/images/projects/siri-core-modeling/slide-1.jpg",
        "/images/projects/siri-core-modeling/slide-2.jpg",
        "/images/projects/siri-core-modeling/slide-3.jpg",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: description,
      },
      // The internship's own résumé bullets, kept in one place.
      { heading: "At Apple", bullets: appleInternship.bullets },
    ],
  },
};
