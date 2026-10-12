import type { EducationEntry } from "./types";

/** Most recent first; later cards stack over earlier ones as you scroll. */
export const education: EducationEntry[] = [
  {
    degree: "Master's in Computer Science, AIML & SWE Specialization",
    institution: "The George Washington University, USA",
    dates: "Aug 2024 - May 2026",
    level: "Graduate",
    logo: { monogram: "GW", tone: "navy" },
    tint: ["navy", "gold"],
    award: {
      title: "SEAS Dean's Award / Dean's Merit Scholarship",
      detail: "50% tuition scholarship, totaling over $38,000.",
    },
    coursework: [
      "Design and Analysis of Algorithms",
      "Advanced Software Paradigms",
      "Computer System Architecture",
    ],
  },
  {
    degree: "Bachelor's in Computer Science & Engineering",
    institution: "Sri Venkateswara College of Engineering, India",
    dates: "Aug 2019 - May 2023",
    level: "Undergraduate",
    logo: { src: "/images/brands/svce.jpg", alt: "SVCE, Sriperumbudur emblem" },
    tint: ["sky", "saffron"],
    activities: [
      {
        icon: "briefcase",
        tone: "navy",
        text: "Completed 3 internships alongside my undergraduate studies.",
      },
      {
        icon: "people",
        tone: "crimson",
        text: "Volleyball captain and Youth Red Cross volunteer.",
      },
    ],
    coursework: [
      "Data Structures",
      "Natural Language Processing",
      "Artificial Intelligence",
      "Machine Learning and Algorithms",
      "Business Intelligence",
      "Advanced User-interface and Technology",
    ],
  },
];
