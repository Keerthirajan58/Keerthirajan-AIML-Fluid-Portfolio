import type { Project } from "../types";

// The repository is private: it holds personal data (profile, location and
// plans), so it is described without a link. Numbers are from the project's
// own CI logs and commits, checked 2026-11-02.
export const jobEventSearch: Project = {
  slug: "job-event-search",
  title: "Job-Event Search",
  badge: "LLM ranking · Personal tool",
  description:
    "Daily pipeline that collects Bay Area tech events and uses an LLM to rank them by how likely they are to help me get hired.",
  tags: ["Python", "LLM judge", "GitHub Actions", "SQLite"],
  filters: ["aiml", "genai", "web"],
  privateRepo: true,
  // Drawn for this site with invented events; only the run counts are real.
  coverDisplay: {
    illustrative: true,
    alt: "Illustration: a phone showing today's ranked event picks with scores and reasons, beside a run summary of 1,203 listings, 881 events and 89 picks",
  },
  caseStudy: {
    focus: "LLM ranking · Data pipeline",
    timeline: "Aug – Oct 2026",
    tech: [
      "Python (standard library only)",
      "SQLite",
      "Gemini API",
      "Groq API",
      "JavaScript dashboard",
      "GitHub Actions",
      "Telegram Bot API",
      "Greenhouse and Ashby job boards",
    ],
    sections: [
      {
        heading: "Overview",
        body: "A personal tool that runs every morning. It collects public listings from four event platforms, removes duplicates and noise, and ranks what's left by how likely each event is to lead to a referral or an interview. The result is a phone-first dashboard with alerts, running on GitHub Actions at no cost, with a Python core that uses only the standard library.",
      },
      {
        heading: "Problem",
        body: "Finding events was easy; choosing them wasn't. Roughly 95% of a day's listings are noise, popularity doesn't track value, and keyword matching can't tell a hiring mixer from a transit fair, or spot an event I can't attend because of who it's for.",
      },
      {
        heading: "How I built it",
        bullets: [
          "An LLM judge (Gemini's free tier, with Groq as a backup) scores each listing's relevance, hiring value and networking against my profile, and drops any person or company name it can't find in the listing.",
          "A rule-based scorer with hard category ceilings is the fallback, so the pipeline still ranks events when no model is available.",
          "A free-tier client paces itself under rate limits, finds which models the key can use, retires models that keep failing and never crashes the run. Judgments are cached by content and prompt version.",
          "Every score is explained point by point, and a company counts as hiring only when its own public job board returned a real posting.",
          "Cross-source deduplication, polite fetching (throttled, no logins, a hard stop on access errors) and reliability guards: a minimum-events check, a stale-data banner and alerts on failed builds.",
          "85 Python unit tests plus jsdom and real-Chrome dashboard suites. I added the browser suite after a bug passed 100 jsdom checks while the page was unusable.",
        ],
      },
      {
        heading: "Results",
        body: "On a recent run, 1,203 raw listings became 881 unique events and 89 recommendations. Moving from keyword rules to the LLM judge corrected a golden set of events the keyword scorer had ranked the wrong way round.",
      },
    ],
  },
};
