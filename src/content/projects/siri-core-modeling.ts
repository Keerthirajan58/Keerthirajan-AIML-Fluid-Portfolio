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
      alt: [
        "Keerthirajan smiling in glasses and a gray sweater, arms crossed, beside a white Apple sign reading Dexter 333 above a flower bed.",
        'Apple intern welcome kit on a desk: laptop captioned "From this, May \'25", keyboard, trackpads, mouse, nameplate, boxed cables, EarPods, notebook and bag.',
        "Same desk captioned \"To this, Aug '25\", with a laptop showing an intern profile and a monitor celebrating Apple's 2025 interns.",
        "Tall dark glass office building under a blue sky, with an Apple sign reading Dexter 333 and colorful sculptures out front.",
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
