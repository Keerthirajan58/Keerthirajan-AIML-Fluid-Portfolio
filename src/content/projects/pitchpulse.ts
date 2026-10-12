import type { Project } from "../types";

export const pitchpulse: Project = {
  slug: "pitchpulse",
  title: "PitchPulse",
  badge: "Hackathon / Sports AI",
  description:
    "AI sports science assistant for player readiness, injury risk, rPPG vitals, movement analysis, and tactical XI recommendations.",
  tags: ["Flutter", "FastAPI", "Gemini", "rPPG"],
  filters: ["aiml", "genai", "hackathon", "mobile", "cv"],
  links: {
    github: "https://github.com/Keerthirajan58/PitchPulseAI/tree/main",
    devpost: "https://devpost.com/software/pitchpulse-32pbyx",
  },
  caseStudy: {
    focus: "AI Sports Science / Hackathon",
    timeline: "Feb 2026",
    tech: [
      "Flutter",
      "Swift",
      "FastAPI",
      "Python",
      "Firebase",
      "Supabase",
      "Presage SDK",
      "Gemini 2.5 Flash",
      "Actian VectorDB",
      "Cloudflare Tunnels",
    ],
    gallery: {
      cover: "/images/projects/pitchpulse/cover.jpg",
      slides: [
        "/images/projects/pitchpulse/slide-0.jpg",
        "/images/projects/pitchpulse/slide-1.jpg",
        "/images/projects/pitchpulse/slide-2.jpg",
        "/images/projects/pitchpulse/slide-3.jpg",
        "/images/projects/pitchpulse/slide-4.jpg",
        "/images/projects/pitchpulse/slide-5.jpg",
        "/images/projects/pitchpulse/slide-6.jpg",
        "/images/projects/pitchpulse/slide-7.jpg",
        "/images/projects/pitchpulse/slide-8.jpg",
        "/images/projects/pitchpulse/slide-9.jpg",
        "/images/projects/pitchpulse/slide-10.jpg",
        "/images/projects/pitchpulse/slide-11.jpg",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "PitchPulse is an AI-driven high-performance management system for football managers. It combines match workload, player check-ins, rPPG vitals, movement screening, and GenAI recommendations into a single readiness and tactical planning workflow.",
      },
      {
        heading: "Problem",
        body: "Professional teams lose major value when player availability drops because of preventable workload spikes and soft-tissue injuries. Managers often have physical match data, but not a unified view of emotional readiness, biometric signals, movement quality, and tactical risk.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Built a Flutter mobile app with Provider state management and a Swift bridge for the Presage SDK to extract heart rate, HRV, stress, and emotional state from a selfie check-in.",
          "Engineered a Python/FastAPI backend that calculates Acute:Chronic Workload Ratio and updates risk bands from match statistics, vitals, and movement analysis.",
          "Used Gemini Vision and Gemini 2.5 Flash to produce structured JSON action plans, suggested XI decisions, and mechanical movement corrections from player context.",
          "Used Firebase authentication, Supabase storage, Actian VectorDB retrieval, and Cloudflare Tunnels to support the mobile-to-backend workflow.",
        ],
      },
      {
        heading: "Impact",
        body: "Shipped a full-stack, multimodal sports science platform in 36 hours with readiness dashboards, injury-risk explanations, recovery recommendations, and game-day squad planning.",
      },
    ],
  },
};
