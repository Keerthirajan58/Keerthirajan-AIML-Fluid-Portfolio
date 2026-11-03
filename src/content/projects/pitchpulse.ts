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
      alt: [
        "Three team members in matching light blue hoodies standing outside the entrance of the Klaus Advanced Computing Building Research Wing.",
        "Two teammates talking over a laptop in a dim lounge with high-backed chairs and energy drink cans on the table.",
        "PitchPulse splash screen with a soccer ball logo and the tagline Club Readiness Intelligence on a dark background.",
        "Player profile for a goalkeeper showing a 24% readiness badge, a medium risk badge, a risk trend chart and an acute vs chronic load chart.",
        "Gemini-generated Coach Action Plan for a goalkeeper, listing reasons for low readiness, four recovery recommendations and a warning to monitor.",
        "Check-In screen with a grid of player cards, each showing position, a readiness percentage and a labeled risk level badge.",
        "Player check-in on the Vitals Analysis tab, with a button to start a 30-second Presage face scan for heart rate and HRV.",
        "Player check-in on the Biomechanics tab, with a Record Movement button for a 10-second squat and hinge movement screen.",
        "AI Suggested XI vs Arsenal screen showing a recommended starting lineup on a pitch diagram, with substitutes listed below.",
        "AI Selection Rationale panel for an attacker in the suggested XI, showing match readiness, injury risk and a Swap Player button.",
        "FC Barcelona coach dashboard with the next match against Arsenal, a squad average readiness ring and risk filter buttons.",
        "Biomechanics assessment card rating mechanical load as medium, with identified risks, cues for recording a new squat video and a retake button.",
        "Presage face scan screen with a CHECKUP button, an empty results panel and instructions to stay centered and still for 30 seconds.",
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
