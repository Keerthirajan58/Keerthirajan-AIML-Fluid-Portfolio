import type { SkillGroup } from "./types";

/**
 * Skill areas, each with its own colour in the Skills panel (in this order).
 * A skill can sit in more than one area. Bubble size comes from how many
 * projects and roles mention the skill, so nothing else needs updating.
 */
export const skills: SkillGroup[] = [
  {
    category: "AI / ML",
    skills: [
      "PyTorch",
      "TensorFlow",
      "Scikit-Learn",
      "Sentence Transformers",
      "Neural Networks",
      "Data Mining",
      "Model Evaluation",
    ],
  },
  {
    category: "GenAI & LLMs",
    skills: [
      "Hugging Face",
      "LoRA / PEFT",
      "Mistral-7B",
      "LangChain",
      "Prompt Engineering",
      "LLM-as-Judge",
      "Agentic AI",
      "Vector Embeddings",
      "Semantic Search",
    ],
  },
  {
    category: "Backend & Cloud",
    skills: [
      "FastAPI",
      "REST APIs",
      "Docker",
      "AWS EC2 / S3 / Lambda",
      "Azure ML",
      "Azure OpenAI",
      "Google Vertex AI",
      "Firebase",
      "BigQuery",
    ],
  },
  {
    category: "Frontend & Mobile",
    skills: [
      "JavaScript",
      "Streamlit",
      "Flutter",
      "Kotlin",
      "Android",
      "HTML5",
      "CSS3",
      "Bootstrap",
    ],
  },
  {
    category: "Data & Evaluation",
    skills: [
      "Synthetic Data",
      "Retrieval Ranking",
      "Offline Eval Pipelines",
      "ML Monitoring",
      "Model Versioning",
      "Observability",
      "CI/CD",
      "System Design",
    ],
  },
];
