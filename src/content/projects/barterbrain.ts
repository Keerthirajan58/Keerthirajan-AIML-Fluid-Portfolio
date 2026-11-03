import type { Project } from "../types";

export const barterbrain: Project = {
  slug: "barterbrain",
  title: "BarterBrAIn",
  badge: "Winning Hackathon",
  description:
    "Technica-winning AI campus barter app with valuation, negotiation, sustainability, and fairness intelligence.",
  tags: ["Flutter", "Firebase", "Gemini", "Cloud Functions"],
  filters: ["aiml", "genai", "hackathon", "mobile"],
  links: {
    github: "https://github.com/Keerthirajan58/BarterBr-AI-n",
    devpost: "https://devpost.com/software/barterbrain",
  },
  achievement: {
    label: "Technica winner",
    detail: "Best Hack for Social Good · Sustainability",
  },
  caseStudy: {
    focus: "AI Campus Barter / Hackathon Winner",
    timeline: "Oct 2025",
    tech: [
      "Flutter",
      "Firebase",
      "Firestore",
      "Gemini 2.5 Pro",
      "Node.js",
      "Cloud Functions",
      "AI Agents",
    ],
    gallery: {
      cover: "/images/projects/barterbrain/cover.jpg",
      slides: [
        "/images/projects/barterbrain/slide-0.jpg",
        "/images/projects/barterbrain/slide-1.jpg",
        "/images/projects/barterbrain/slide-2.jpg",
        "/images/projects/barterbrain/slide-3.jpg",
        "/images/projects/barterbrain/slide-4.jpg",
        "/images/projects/barterbrain/slide-5.jpg",
        "/images/projects/barterbrain/slide-6.jpg",
      ],
      alt: [
        "Five people smile on a stage before a black curtain; three with hacker badges hold small prize boxes, flanked by two Technica organizers.",
        'BarterBrAIn splash screen with an orange circuit-brain logo, the tagline "Barter better with BarterBrAIn," and a loading bar.',
        "Edit Product form for a Samsung Galaxy S20FE listing, with two phone photos, brand, age, a $34.75 price and Fair condition.",
        "Price Setup screen showing an AI-suggested price of $34.75 at 85% confidence, a written explanation, and buttons to accept it or set your own.",
        "In-app chat where two traders negotiate a cash adjustment, topped by a green Trade Completed banner and a prompt to arrange a meetup.",
        "Trade Details screen with each trader's total, a $24.19 price difference, a sustainability card noting 30 kg of CO2 saved, and a timeline.",
        "Hackathon participants wearing Technica lanyards gather at a laptop-covered table, holding two smartphones up side by side to compare their screens.",
        "Two participants work side by side at laptops in a crowded hackathon room, one laptop bearing a Major League Hacking sticker.",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "BarterBrAIn is an AI-powered campus barter platform that helps students swap items instead of buying new ones. The app supports valuation, negotiation, sustainability tracking, and transparent fairness scoring for safer student-to-student exchanges.",
      },
      {
        heading: "Problem",
        body: "Students often own unused items that could be valuable to someone else, but direct swaps are hard to price, negotiate, and trust. We designed the app around fair value, verified campus users, and sustainability impact.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Led the AI/ML features, including multimodal item valuation, negotiation reasoning, confidence scoring, and fallback deterministic valuation.",
          "Built AI fairness logic for swap-equity scoring, cash-adjustment suggestions, condition estimation, and explainable valuation factors.",
          "Integrated Gemini 2.5 Pro / Flash through secure Node.js Cloud Functions with caching, Firebase Authentication, and Firestore storage.",
          "Added sustainability calculations to estimate CO2 savings after successful trades.",
        ],
      },
      {
        heading: "Impact",
        body: "Won Best Hack for Social Good (Sustainability) at Technica 2025 among 80+ teams and 450+ participants.",
      },
    ],
  },
};
