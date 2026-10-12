import type { Project } from "../types";

export const historicalEventNarrator: Project = {
  slug: "historical-event-narrator",
  title: "Historical Event Narrator",
  badge: "Fine-Tuned LLM",
  description:
    "LoRA fine-tuned Mistral-7B system for creative alternate-history generation and LLM-as-judge evaluation.",
  tags: ["Mistral-7B", "LoRA / PEFT", "Streamlit", "Gemini"],
  filters: ["aiml", "genai", "web"],
  links: {
    github: "https://github.com/Keerthirajan58/Historical-Event-Narrator",
  },
  caseStudy: {
    focus: "Fine-Tuned LLM / GenAI",
    timeline: "Oct 2025 - Dec 2025",
    tech: [
      "Python",
      "PyTorch",
      "Hugging Face Transformers",
      "PEFT",
      "LoRA",
      "Mistral-7B",
      "Gemini API",
      "Streamlit",
      "Apple Silicon MPS",
    ],
    gallery: {
      cover: "/images/projects/historical-event-narrator/cover.jpg",
      slides: [
        "/images/projects/historical-event-narrator/slide-1.jpg",
        "/images/projects/historical-event-narrator/slide-2.jpg",
        "/images/projects/historical-event-narrator/slide-3.jpg",
        "/images/projects/historical-event-narrator/slide-4.jpg",
        "/images/projects/historical-event-narrator/slide-5.jpg",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "Historical Event Narrator fine-tunes a Mistral-7B based model to generate creative alternate-history narratives by combining factual historical events with plausible what-if twists.",
      },
      {
        heading: "Problem",
        body: "Base open-source models were factual but dry, producing essay-like summaries with weak creative divergence. The goal was to teach a smaller local model to generate vivid, cinematic narratives while preserving historical relevance.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Fine-tuned Mistral-7B-v0.1 with LoRA and PEFT, using parameter-efficient updates instead of full retraining.",
          "Trained locally on Apple Silicon MPS with mixed precision to work within hardware constraints and avoid paid cloud GPUs.",
          "Generated a synthetic dataset by transforming 1,200+ Wikipedia articles into narrative-plus-twist pairs with Gemini 2.5 Flash.",
          "Implemented guided inference, stopping criteria, and a Streamlit evaluation layer using Gemini Pro as an LLM judge for creativity, relevance, and twist quality.",
        ],
      },
      {
        heading: "Impact",
        body: "A/B evaluation moved outputs from factual summaries to vivid alternate narratives, improving creativity from 3/10 to 8/10, twist quality from 0/10 to 9/10, and ROUGE-L structural coherence by 100%+ for the task.",
      },
    ],
  },
};
