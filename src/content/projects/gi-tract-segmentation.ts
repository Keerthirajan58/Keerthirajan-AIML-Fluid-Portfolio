import type { Project } from "../types";

export const giTractSegmentation: Project = {
  slug: "gi-tract-segmentation",
  title: "GI Tract Segmentation",
  badge: "Medical Imaging",
  description:
    "Deep learning project for segmenting gastro-intestinal tract organs and tumor regions from MRI scans.",
  tags: ["Deep Learning", "Computer Vision", "Medical AI"],
  filters: ["aiml", "cv"],
  // The old public repository returns 404, so the card has no GitHub link.
  notes: [
    {
      meta: "Team Lead · Nov 2022 - Mar 2023",
    },
    {
      bullets: [
        "Led a team of 3 developers to build ML model for segmenting Gastro-Intestinal Tract organs from tumors through MRI scans.",
        "Applied Deep Context Metric Learning for advanced image clustering and processing—improved survival rates by 8% through targeted treatment focused on tumors rather than surrounding organs.",
        "Optimized backend scalability to handle 38,000 masked 16-bit image datasets, reducing processing time from 5 hours to 2 hours for smoother operation.",
      ],
    },
  ],
};
