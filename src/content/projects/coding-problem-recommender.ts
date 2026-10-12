import type { Project } from "../types";

export const codingProblemRecommender: Project = {
  slug: "coding-problem-recommender",
  title: "Coding Problem Recommender",
  badge: "Semantic Search",
  description:
    "Semantic search system mapping job descriptions to LeetCode problems using embeddings and clustering.",
  tags: ["Sentence Transformers", "FastAPI", "Streamlit", "Azure ML"],
  filters: ["aiml", "genai", "web"],
  links: {
    github: "https://github.com/Keerthirajan58/Interview-prep-tool-AI-ML-",
  },
  caseStudy: {
    focus: "Semantic Search / Interview Prep",
    timeline: "Jan 2025 - Apr 2025",
    tech: [
      "Python",
      "Sentence Transformers",
      "Scikit-Learn",
      "NumPy",
      "FastAPI",
      "Streamlit",
      "Azure ML",
      "Grok API",
    ],
    gallery: {
      cover: "/images/projects/coding-problem-recommender/cover.jpg",
      slides: [
        "/images/projects/coding-problem-recommender/slide-1.jpg",
        "/images/projects/coding-problem-recommender/slide-2.jpg",
        "/images/projects/coding-problem-recommender/slide-3.jpg",
      ],
    },
    sections: [
      {
        heading: "Overview",
        body: "The Intelligent Coding Problem Recommendation System maps job descriptions to relevant LeetCode problems so candidates can focus interview prep around role-specific requirements instead of generic topic lists.",
      },
      {
        heading: "Problem",
        body: "Software engineering job descriptions vary by stack, seniority, and domain. A strong prep workflow should understand those requirements semantically and recommend practice problems with topic diversity.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Processed and embedded 1,571 LeetCode problems with Sentence Transformers for semantic retrieval.",
          "Implemented cosine similarity ranking and K-Means clustering to improve relevance and avoid repetitive recommendations.",
          "Built a FastAPI backend and Streamlit interface with LLM-generated explanations for why each problem matches the input role.",
          "Used Azure ML for deployment experimentation and model workflow management.",
        ],
      },
      {
        heading: "Impact",
        body: "Delivered an interactive recommendation workflow with relevance scoring, cluster-aware diversity, and clear explanations that connect job requirements to coding practice.",
      },
    ],
  },
};
