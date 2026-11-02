import type { Project } from "../types";

// Facts from the public repo (README, docs, src/, CI and release runs) and
// PyPI, checked 2026-11-02. No benchmark results are published, so none are
// quoted here.
export const bugbout: Project = {
  slug: "bugbout",
  title: "bugbout",
  badge: "Open source · Python CLI",
  description:
    "Open-source CLI that replays a codebase's own fixed bugs to find out which coding agent actually fixes them.",
  tags: ["Python", "Coding agents", "Sandboxing", "PyPI"],
  filters: ["aiml", "genai", "opensource"],
  links: {
    github: "https://github.com/Keerthirajan58/bugbout",
    pypi: "https://pypi.org/project/bugbout/",
  },
  caseStudy: {
    focus: "Open source · Coding-agent evaluation",
    timeline: "Aug – Oct 2026",
    tech: [
      "Python",
      "Typer",
      "Rich",
      "Pydantic",
      "uv",
      "pytest",
      "mypy (strict)",
      "GitHub Actions",
      "macOS seatbelt",
      "Linux bubblewrap",
      "Codex CLI",
      "Claude Code",
      "Gemini CLI",
      "mini-swe-agent",
    ],
    sections: [
      {
        heading: "Overview",
        body: "bugbout is an open-source Python CLI that I built and maintain. It replays bugs a team has already fixed, lets coding agents race to fix them in sandboxed checkouts, and scores every patch with the tests the maintainers wrote alongside the real fix, which no agent ever sees. It is MIT-licensed and published on PyPI (version 0.1.0, alpha).",
      },
      {
        heading: "Problem",
        body: "Public leaderboards measure coding agents on someone else's code, and agents report success whether or not their patch is right. A team that wants to know which agent, or which model, fixes bugs in its own codebase has no easy way to find out.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Mines tasks from the project's own git history: small fixes that reference an issue and add a test. The issue text is stripped of solution sections before an agent sees it.",
          "Builds ground truth the SWE-bench way (fail-to-pass and pass-to-pass tests) and runs the fixed code twice, so flaky tests are left out.",
          "Gives each agent a checkout with no git history inside an OS sandbox (seatbelt on macOS, bubblewrap on Linux) with the network off, and measures the patch from disk, not from what the agent says it changed.",
          "Runs agents in parallel per usage-quota lane with atomic, resumable journaling: a stopped run picks up where it left off, and an agent added later runs on its own.",
          "Cross-examines every patch with every agent's own tests, then a rule-based judge picks one patch per bug or abstains. No agent can vouch for its own patch.",
          "Drives Codex, Claude Code, Gemini CLI and mini-swe-agent headlessly, and any other command-line agent through config or a plugin entry point.",
        ],
      },
      {
        heading: "Shipping it",
        body: "CI runs 208 test cases on Ubuntu and macOS with Python 3.12 and 3.13, alongside strict type checking and linting, and the real sandbox tests must run rather than skip. Tagged releases publish to PyPI through trusted publishing, so no token is stored.",
      },
    ],
  },
};
