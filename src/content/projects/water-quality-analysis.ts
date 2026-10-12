import type { Project } from "../types";

export const waterQualityAnalysis: Project = {
  slug: "water-quality-analysis",
  title: "Efficient Water Quality Analysis",
  badge: "Applied ML",
  description:
    "End-to-end model for water quality prediction using turbidity, hardness, and related environmental factors.",
  tags: ["XGBoost", "IBM Cloud", "ML Pipelines"],
  filters: ["aiml"],
  links: {
    github:
      "https://github.com/Keerthirajan58/IBM---EFFICIENT-WATER-QUALITY-ANALYSIS-AND-PREDICTION",
  },
  notes: [
    {
      meta: "Team Lead · Apr 2022 - Oct 2022",
    },
    {
      bullets: [
        "Designed an end-to-end model to analyze water quality using multiple factors such as turbidity and hardness.",
        "Incorporated XGBoost to optimize memory usage and processing speed, resulting in 20% increased model's prediction accuracy.",
        "Reduced computational load by using hyperparameter tuning and adjusting maximum depth and minimum sample split.",
        "Deployed the model on IBM Cloud to optimize scalability by 1.5x better than local run.",
      ],
    },
  ],
};
