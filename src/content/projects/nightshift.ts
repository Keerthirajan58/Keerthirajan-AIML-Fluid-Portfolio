import type { Project } from "../types";

// Facts from the public repo (README, docs and CI) and the event's own pages,
// checked 2026-11-02; the placement is from the owner. Timings and dollar
// figures in the repo and the deck are sample data and are not quoted.
export const nightshift: Project = {
  slug: "nightshift",
  title: "Night Shift",
  badge: "AI ops agent · Hackathon",
  description:
    "On-call agent that detects, diagnoses and helps fix incidents with local LLMs, with a human approving every fix in Slack.",
  tags: ["Python", "FastAPI", "Local LLMs", "Slack"],
  filters: ["aiml", "genai", "hackathon"],
  links: {
    github: "https://github.com/Keerthirajan58/nightshift",
    video: "https://youtu.be/DaT-o4J2H8Y",
  },
  achievement: {
    label: "2nd place · Dell x NVIDIA AI Hackathon",
    detail: "San Francisco",
  },
  caseStudy: {
    focus: "AI incident response · Local LLMs",
    timeline: "Oct 25, 2026 · one-day hackathon",
    tech: [
      "Python",
      "FastAPI",
      "Pydantic",
      "SQLite FTS5",
      "Drain3",
      "Docker Compose",
      "Ollama / vLLM",
      "NVIDIA OpenShell",
      "OpenClaw",
      "Slack",
      "GitHub Actions",
      "Dell Pro Max with GB10",
    ],
    gallery: {
      cover: "/images/projects/nightshift/cover.jpg",
      slides: [
        "/images/projects/nightshift/slide-1.jpg",
        "/images/projects/nightshift/slide-2.jpg",
        "/images/projects/nightshift/slide-3.jpg",
        "/images/projects/nightshift/slide-4.jpg",
        "/images/projects/nightshift/slide-5.jpg",
      ],
      alt: [
        "On stage at the Dell x NVIDIA AI Hackathon in San Francisco, in front of the closing slide",
        "Demo title slide: Night Shift, the on-call SRE that lives in a box, beside the Mission Control dashboard on sample data",
        "How it works: a local, sandboxed agent on a Dell Pro Max with GB10, with fixes approved in Slack",
        "Mission Control flagging a bad deploy before the alert threshold trips, on sample data",
        "A selfie at the build table during the hackathon, laptops open",
        "Team photo on stage at the hackathon",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "Night Shift is an on-call engineering agent I built in one day at the Dell x NVIDIA AI Hackathon in San Francisco, where our team took 2nd place. It watches a simulated e-commerce stack, catches failures early, works out the likely cause from logs, metrics and recent deploys, and posts a diagnosis to Slack, where a human approves the exact fix. I built it from my MacBook Pro, while model inference and raw logs stayed on a Dell Pro Max with GB10, with no cloud LLM calls.",
      },
      {
        heading: "Problem",
        body: "At night, on-call engineers lose time tracing an alert back to the deploy, config change or dependency behind it, then finding the right runbook and fix. Sending production logs to a cloud model also raises privacy concerns.",
      },
      {
        heading: "How it works",
        bullets: [
          "Rule-based detection on streamed logs: error templates clustered with Drain3, novelty since the last change, and sustained error-rate and latency thresholds.",
          "Ranks recent changes by how well stack traces match their diffs, by timing, by service and by novelty, and sizes the impact by customer segment.",
          "Four model specialists (logs, metrics, changes and history) run in parallel on a local OpenAI-compatible endpoint. Every answer is checked against a schema, with deterministic fallbacks.",
          "Defends against prompt injection: evidence is escaped and wrapped, the model can only choose from a catalogue of actions, and code, not the model, builds the command.",
          "A fix runs only after a human approves the exact command in Slack, and it must show sustained recovery. Reversible changes are undone if it doesn't.",
          "Resolved incidents are written back as postmortems into a SQLite full-text knowledge base for future investigations.",
          "Mission Control, a live dashboard, shows the charts, the specialists working in parallel and the incident timeline as they happen.",
        ],
      },
      {
        heading: "Results",
        body: "Night Shift took 2nd place after a live demo on the GB10. CI runs 384 tests with 100% statement and branch coverage enforced. Four of the five failure scenarios were verified for the demo; the memory-leak scenario was left out of scope.",
      },
    ],
  },
};
