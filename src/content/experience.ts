import type { ExperienceEntry } from "./types";

/** Newest first; the timeline runs top to bottom in this order. */

export const appleInternship: ExperienceEntry = {
  role: "AIML Machine Learning Engineer Intern",
  company: "Apple",
  dates: "May 2025 - Aug 2025",
  location: "Seattle, WA",
  logo: { icon: "apple" },
  bullets: [
    "Worked on Siri Core Modeling initiatives involving transformer-based modeling, model fine-tuning, evaluation workflows, and performance benchmarking.",
    "Built and evaluated AIML pipelines using PyTorch, Hugging Face Transformers, LoRA/PEFT, Sentence Transformers, and vector embeddings.",
    "Designed deterministic LLM programming and LLM-as-judge evaluation workflows to support reproducible research and model quality analysis.",
  ],
};

export const experience: ExperienceEntry[] = [
  appleInternship,
  {
    role: "Machine Learning Intern",
    company: "TCS",
    dates: "Nov 2021 - Dec 2021",
    location: "Chennai, India",
    logo: { src: "/images/brands/tcs.svg" },
    bullets: [
      "Engineered a web app for real-time Twitter sentiment analysis, scraping product data to provide actionable insights for critical decision-making. Reduced inference runtime by 40% by incorporating data techniques such as subjectivity and polarity.",
      "Leveraged Tweepy API for real-time Twitter data integration. Improved model prediction accuracy by 18% using TextBlob over traditional Machine Learning models.",
    ],
  },
  {
    role: "Web Development Intern",
    company: "The Sparks Foundation",
    dates: "May 2021 - Jun 2021",
    location: "Singapore - Remote",
    logo: { src: "/images/brands/sparks.png" },
    bullets: [
      "Devised a fully responsive charity donation website integrating payment gateway with seamless transaction workflows and automated email receipts. Recognized for achieving 98% unit test code coverage for the core logic.",
      // "Bootstraps" is verbatim from the original résumé.
      "Utilized modern JavaScript frameworks and Bootstraps to enhance user experience and mobile compatibility.",
      "Mentored a team of 5+ developers, facilitating pair programming sessions to improve code quality and foster collaboration.",
    ],
  },
];
