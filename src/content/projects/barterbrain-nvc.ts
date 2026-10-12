import type { Project } from "../types";

export const barterbrainNvc: Project = {
  slug: "barterbrain-nvc",
  title: "BarterBrAIn — From Hackathon to Startup",
  badge: "NVC 2026 · Social Innovation Finalist",
  description:
    "Taking a campus barter idea beyond the hackathon: student discovery, a tested beta, and three rounds of startup pitching.",
  tags: ["RAG", "Gemini", "Firebase", "Product discovery"],
  filters: ["aiml", "startup"],
  links: {
    blog: "https://newventurecompetition.gwu.edu/2026-new-venture-competition-finalists",
  },
  achievement: {
    label: "Top 5",
    detail: "Social Innovation · GW New Venture Competition",
  },
  chapter: {
    of: "barterbrain",
    badge: "NVC finalist",
    label: "NVC finalist: BarterBrAIn — From hackathon to startup",
    teaser: "From hackathon to startup — NVC 2026 finalist",
    back: "Explore the original hackathon product",
  },
  caseStudy: {
    focus: "NVC 2026 · Social Innovation Finalist",
    timeline: "2026 · April 22–23 finals",
    gallery: {
      // Competition scale → stage pitch → official finalist → founding team.
      cover: "/images/projects/barterbrain-nvc/slide-2.jpg",
      slides: [
        "/images/projects/barterbrain-nvc/slide-1.jpg",
        "/images/projects/barterbrain-nvc/slide-3.jpg",
        "/images/projects/barterbrain-nvc/cover.jpg",
      ],
    },
    sections: [
      {
        heading: "A question became a product",
        body: "Why can't students trade what they have instead of needing cash? Our three-person team took BarterBrAIn from a Technica-winning prototype to a beta app and the GW New Venture Competition. I led the AI/ML features alongside teammates Prithvi Saran Sathyasaran and Anaswara Raghuthaman.",
      },
      {
        heading: "From students, not assumptions",
        body: "We surveyed students about moving in and moving out, explored how trading could save time and money, and tested the beta with students at UMD, ASU, and the University of Chicago. The work shifted from a technical demonstration toward a product grounded in student needs.",
      },
      {
        heading: "The AI system",
        bullets: [
          "RAG and vector-based semantic search to help students find relevant items.",
          "Gemini 2.5 Pro / Flash for multimodal valuation and negotiation reasoning, with confidence scoring to help surface uncertain or suspicious offers.",
          "Fairness engine with swap-equity scoring, cash adjustments, and condition/value estimation from item metadata.",
          "Negotiation coaching, explainable valuation factors, and estimated CO₂ savings after successful trades.",
          "Secure server-side calls and caching in Firebase Cloud Functions; Firestore, .edu authentication, and Node.js AI microservices.",
          "Deterministic valuation fallback when model responses fail, so the core workflow remains usable.",
        ],
      },
      {
        heading: "Three rounds. A different kind of learning.",
        metrics: [
          {
            value: "215",
            label: "Teams in the official field",
          },
          {
            value: "3",
            label: "Elimination rounds advanced",
          },
          {
            value: "Top 5",
            label: "Social Innovation finalists",
          },
        ],
        body: "We reached the April 22–23, 2026 finals without winning. Pitching to judges and investors, and feedback from Bob Smith and Greg Wong, pushed us to identify business gaps and think like founders as well as engineers. The outcome was a clearer understanding of the product, its users, and what it would take to grow.",
      },
    ],
  },
};
