import type { Project } from "../types";

export const moodbites: Project = {
  slug: "moodbites",
  title: "MoodBites",
  badge: "Mobile + Firebase",
  description:
    "Kotlin Android app that recommends and tracks meals based on mood signals and user history.",
  tags: ["Kotlin", "Firebase", "Android"],
  filters: ["mobile", "aiml"],
  // Drawn for this site: it illustrates the project, it isn't a screenshot.
  coverDisplay: {
    illustrative: true,
    alt: "Illustration: a phone app asking how you feel and suggesting meals for a tired day, such as lentil soup and a berry yogurt bowl, beside a weekly mood log and an order confirmation",
  },
  links: {
    github: "https://github.com/Keerthirajan58/Mood-Bites---Kotlin-App",
  },
  notes: [
    {
      meta: "Team Lead · Sep 2024 - Nov 2024",
    },
    {
      bullets: [
        'Led a team of 5 to develop "MoodBites," a Kotlin-based Android application that recommends and tracks user meals based on their moods, enhancing mental well-being through data-driven insights.',
        "Designed and implemented a scalable database with Firebase for efficient storage and real-time management of user meals, mood logs, and order information, including automated email receipts for order confirmations.",
        "Optimized app performance, reducing load times and enhancing responsiveness to ensure a seamless user experience across devices.",
      ],
    },
  ],
};
