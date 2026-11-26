import type { Project } from "../types";

// Facts from the team's repository (README, docs, results and commits), its
// demo video and the event page, checked 2026-11-25; the placement, the
// owner's role and the reasons it placed are from the owner. The repository
// is private for now: it holds challenge material the organiser asked teams
// to keep within the team, so the benchmark questions are never quoted here.
// "Colon cancer with positive lymph nodes" is the team's own example.
export const cohortCompiler: Project = {
  slug: "cohort-compiler",
  title: "Cohort Compiler",
  badge: "AI × Biology · Hackathon",
  description:
    "Turns a researcher's cohort question into explicit rules over pathology reports, and shows when one question picks two different patient lists.",
  tags: ["Python", "Local LLMs", "Ollama", "Streamlit"],
  filters: ["aiml", "genai", "hackathon"],
  privateRepo: true,
  links: {
    video: "https://youtu.be/ppa07biqsoU",
  },
  achievement: {
    label: "3rd place · AI × Biology Hackathon",
    detail: "Berkeley",
  },
  caseStudy: {
    focus: "Cohort selection · Local LLMs",
    timeline: "Nov 14, 2026 · one-day hackathon",
    tech: [
      "Python",
      "Ollama",
      "gpt-oss:20b",
      "Streamlit",
      "pytest",
      "GitHub Actions",
    ],
    // The photos are the owner's: the venue's Wi-Fi password on the
    // whiteboard is blurred, and the desk photo is cropped to the team.
    gallery: {
      cover: "/images/projects/cohort-compiler/cover.jpg",
      slides: [
        "/images/projects/cohort-compiler/slide-1.jpg",
        "/images/projects/cohort-compiler/slide-2.png",
        "/images/projects/cohort-compiler/slide-3.png",
        "/images/projects/cohort-compiler/slide-4.png",
        "/images/projects/cohort-compiler/slide-5.png",
        "/images/projects/cohort-compiler/slide-6.png",
        "/images/projects/cohort-compiler/slide-7.png",
      ],
      alt: [
        "Our four-person team at the AI × Biology Hackathon in Berkeley",
        "Working through the app together at our desk during the hackathon",
        "Your question can be read two ways: an explicit positive-node count matches 423 reports, the recorded pN category 426, and 3 reports differ",
        "The question screen: example questions, the question box and a note that the reports stay on this computer",
        "See exactly what the model was sent: the instructions, the field list and the question, with no report, report ID or quote",
        'A PD-L1 question answered with "Not answerable from these reports", because the reports don\'t record it',
        "Kidney cancer with no positive lymph nodes: 115 reports match and 733 go to review because they give no node count",
        "Results card from the demo: mean F1 0.95 for the local model, 0.28 for the keyword baseline, and 113,017 facts saved with their exact words",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: 'Cohort Compiler finds the patients a researcher asked for in a set of pathology reports, and shows when the question can be read more than one way. Each reading becomes an explicit rule, plain code runs the rules over every report, and the screen shows which patients change between readings and the sentence in each report that decided it. I led our four-person team at the DNAForge & MTC Berkeley AI × Biology Hackathon, on Biobase\'s "Find the Right Patients" challenge, and we took 3rd place overall.',
      },
      {
        heading: "Problem",
        body: 'A keyword search or a single rule quietly commits to one reading of a question. Take "colon cancer with positive lymph nodes": counting positive nodes selects 423 of the 9,010 synthetic reports in the challenge pack, while the recorded pN category selects 426. The three extra reports say 0 nodes were positive but are staged pN1c. Both readings are defensible, and they pick different patients, so the researcher should make that choice with the evidence in front of them.',
      },
      {
        heading: "What set it apart",
        bullets: [
          "Two readings, side by side: when a question is ambiguous, it shows both counts, the reports that differ and the deciding sentence from each report, copied word for word.",
          "It refuses instead of guessing. When the reports don't record a concept, such as PD-L1, it says so with a reason, because an empty list would look like \"no patients\". A report that doesn't state a fact the rule needs goes to Needs review, so missing information never counts as a no.",
          "The reports never leave the machine. The local model (gpt-oss:20b through Ollama) is sent only the question and the field schema, never report text, IDs or quotes. The app shows the full prompt on screen, and requests go to 127.0.0.1 only.",
          "It was measured against the challenge's own baseline: a local model writing rules from the question alone scored a mean F1 of 0.95, against 0.28 for keyword search.",
        ],
      },
      {
        heading: "How it works",
        bullets: [
          "A compiler turns the question into one rule over 30 typed fields, two labelled rules when the wording is genuinely ambiguous, or no rule with a reason. Curated rules answer by default; the live mode has the local model write them.",
          "Every rule is validated before it runs: known fields and operators only, 1 to 20 conditions, and regular expressions that must compile within a length limit. Nothing the model writes runs as code.",
          "An engine extracts facts from each report's header and final diagnosis and keeps the exact character span each one came from. Every report lands in Match, Needs review or Excluded.",
          "I built the live mode: the local-model compiler with its safety checks (it refuses exact ages, because reports record 10-year bands, and retries an unusable reply), a fixed rule that adds the second lymph-node reading when the model returns one, and the scoring of the model against the benchmark.",
        ],
      },
      {
        heading: "Results",
        body: "Measured on the train split of the challenge pack (9,010 synthetic reports, 30 benchmark criteria), in one run. The curated rules score 1.00, but they were written against that split, so that is a fit, not a held-out result.",
        metrics: [
          {
            value: "0.95",
            label: "Mean F1, local model writing the rules (28 of 30 exact)",
          },
          {
            value: "0.28",
            label: "Mean F1, the pack's keyword-search baseline",
          },
          {
            value: "113,017",
            label:
              "Evidence quotes, every one matching the report word for word",
          },
        ],
      },
      {
        heading: "Limits",
        body: "The reports are synthetic, and nothing here has been clinically validated. The extractor is written for this pack's report layout, and rules combine conditions with AND only.",
      },
    ],
  },
};
