import type { Project } from "../types";

// Facts from the public repo (README, docs, PRs #1-#6 and CI), checked
// 2026-11-02. Team project: a teammate built the Mission Control dashboard
// and another wrote the QA rehearsal plan. Timings in the repo's datasets are
// illustrative fixtures and are not quoted.
export const nightshift: Project = {
  slug: "nightshift",
  title: "Night Shift",
  badge: "AI ops agent · Team build",
  description:
    "On-call agent that detects, diagnoses and helps fix incidents with local LLMs, with a human approving every fix in Slack.",
  tags: ["Python", "FastAPI", "Local LLMs", "Slack"],
  filters: ["aiml", "genai"],
  links: { github: "https://github.com/Keerthirajan58/nightshift" },
  caseStudy: {
    focus: "AI incident response · Local LLMs",
    timeline: "Oct 2026 · one-day build",
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
    sections: [
      {
        heading: "Overview",
        body: "Night Shift is an on-call engineering agent that my team of three built in one day. It watches a simulated e-commerce stack, catches failures early, works out the likely cause from logs, metrics and recent deploys, and posts a diagnosis to Slack, where a human approves the exact fix. Model inference and raw logs stay on a Dell Pro Max with GB10, with no cloud LLM calls.",
      },
      {
        heading: "Problem",
        body: "At night, on-call engineers lose time tracing an alert back to the deploy, config change or dependency behind it, then finding the right runbook and fix. Sending production logs to a cloud model also raises privacy concerns.",
      },
      {
        heading: "How I built it",
        body: "I built the detection, investigation and remediation engine. A teammate built the Mission Control dashboard.",
        bullets: [
          "Rule-based detection on streamed logs: error templates clustered with Drain3, novelty since the last change, and sustained error-rate and latency thresholds.",
          "Ranks recent changes by how well stack traces match their diffs, by timing, by service and by novelty, and sizes the impact by customer segment.",
          "Four model specialists (logs, metrics, changes and history) run in parallel on a local OpenAI-compatible endpoint. Every answer is checked against a schema, with deterministic fallbacks.",
          "Defends against prompt injection: evidence is escaped and wrapped, the model can only choose from a catalogue of actions, and code, not the model, builds the command.",
          "A fix runs only after a human approves the exact command in Slack, and it must show sustained recovery. Reversible changes are undone if it doesn't.",
          "Resolved incidents are written back as postmortems into a SQLite full-text knowledge base for future investigations.",
        ],
      },
      {
        heading: "Results",
        body: "CI runs 384 tests with 100% statement and branch coverage enforced. Four of the five failure scenarios were verified for the demo; the memory-leak scenario was left out of scope.",
      },
    ],
  },
};
