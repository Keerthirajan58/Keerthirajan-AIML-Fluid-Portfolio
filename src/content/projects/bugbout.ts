import type { Project } from "../types";

// Facts from the public repo (README, docs, src/, CI and release runs), PyPI
// and the owner's write-up (Medium, cross-posted to DEV), checked 2026-11-02.
// Results are quoted as the write-up states them, with their sample sizes.
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
    blog: "https://medium.com/@keerthirajans/27-of-66-fixed-bugs-werent-fixed-so-i-built-a-way-to-check-80a797116443",
    devto:
      "https://dev.to/keerthirajan_senthilkumar/27-of-66-fixed-bugs-werent-fixed-so-i-built-a-way-to-check-86g",
  },
  // The cover is a wide terminal screenshot, shown whole on the card.
  coverDisplay: { fit: "contain" },
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
    ],
    gallery: {
      cover: "/images/projects/bugbout/cover.png",
      slides: [
        "/images/projects/bugbout/slide-1.png",
        "/images/projects/bugbout/slide-2.png",
      ],
      alt: [
        "bugbout tasks: three past sqlparse bugs, each with the failing tests that prove the fix",
        "bugbout report: a table scoring two coding agents on three real sqlparse bugs with the maintainers' own tests, then the judge's picks and how well it worked as a merge gate",
        "bugbout doctor: checks for git, uv, the sandbox, the repository, GitHub access and each agent",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "bugbout is an open-source Python CLI that I built and maintain. It replays bugs a team has already fixed, lets coding agents race to fix them in sandboxed checkouts, and scores every patch with the tests the maintainers wrote alongside the real fix, which no agent ever sees. It is MIT-licensed and published on PyPI (version 0.1.0, alpha).",
      },
      {
        heading: "Problem",
        body: "Public leaderboards measure coding agents on someone else's code, and agents report success whether or not their patch is right. In my first proper run, agents handed back 66 patches as done, and 27 of them were wrong. A team that wants to know which agent, or which model, fixes bugs in its own codebase has no easy way to find out.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Mines tasks from the project's own git history: small fixes that reference an issue and add a test. The issue text is stripped of solution sections before an agent sees it.",
          "Builds ground truth the SWE-bench way (fail-to-pass and pass-to-pass tests) and runs the fixed code twice, so flaky tests are left out.",
          "Gives each agent a checkout with no git history inside an OS sandbox (seatbelt on macOS, bubblewrap on Linux) with the network off, and measures the patch from disk, not from what the agent says it changed.",
          "Runs agents in parallel per usage-quota lane with atomic, resumable journaling: a stopped run picks up where it left off, and an agent added later runs on its own.",
          "Cross-examines every patch with every agent's own tests, then a rule-based judge picks one patch per bug or abstains. No agent can vouch for its own patch.",
          "Drives popular command-line coding agents headlessly, and any other agent through a few lines of config or a plugin entry point.",
        ],
      },
      {
        heading: "What I found",
        body: "I tuned the cross-examination rules on 22 bugs from a few projects, froze them, then ran bugbout once on 30 bugs from sqlparse and tomlkit that I hadn't looked at. The best single agent fixed 20, picking by cross-examination fixed 21, and at least one agent was right on 22: it helps, but only a little. The useful lesson was where wrong fixes hide: they usually fix the reported symptom and break the case next to it.",
      },
      {
        heading: "Shipping it",
        body: "CI runs 208 test cases on Ubuntu and macOS with Python 3.12 and 3.13, alongside strict type checking and linting, and the real sandbox tests must run rather than skip. Tagged releases publish to PyPI through trusted publishing, so no token is stored.",
      },
    ],
  },
};
