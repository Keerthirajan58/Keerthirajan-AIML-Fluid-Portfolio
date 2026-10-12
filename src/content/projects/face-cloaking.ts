import type { Project } from "../types";

export const faceCloaking: Project = {
  slug: "face-cloaking",
  title: "Face Cloaking",
  badge: "Privacy / CV",
  description:
    "DCT-based adversarial cloaking pipeline that disrupts FaceNet recognition while preserving visual fidelity.",
  tags: ["PyTorch", "DCT", "FaceNet", "SSIM"],
  filters: ["aiml", "cv"],
  links: {
    github: "https://github.com/Keerthirajan58/Computer-Vision-Final-Project",
    blog: "https://medium.com/@anaswara.raghuthaman/can-frequency-domain-cloaking-prevent-face-recognition-what-we-learned-from-building-one-35ed2492f83e",
  },
  caseStudy: {
    focus: "Computer Vision / Privacy",
    timeline: "Dec 2025",
    tech: [
      "Python",
      "PyTorch",
      "Differentiable DCT/IDCT",
      "FaceNet",
      "InceptionResnetV1",
      "VGGFace2",
      "SSIM optimization",
    ],
    gallery: {
      cover: "/images/projects/face-cloaking/cover.jpg",
      slides: ["/images/projects/face-cloaking/slide-1.jpg"],
    },
    sections: [
      {
        heading: "Overview",
        body: "This project explores frequency-domain adversarial cloaking as a privacy-preserving defense against automated face recognition. Instead of directly editing pixels, the pipeline perturbs DCT coefficients to keep the visual change subtle while disrupting recognition.",
      },
      {
        heading: "Problem",
        body: "Face recognition systems can identify people from images at scale, creating privacy risks. A useful cloak must reduce recognition success while remaining visually imperceptible to humans.",
      },
      {
        heading: "How I built it",
        bullets: [
          "Implemented a differentiable DCT/IDCT attack pipeline in PyTorch to optimize perturbations in the frequency domain.",
          "Targeted the InceptionResnetV1 FaceNet model pretrained on VGGFace2 to disrupt identity embeddings.",
          "Optimized for visual fidelity with SSIM so the generated cloak preserves image quality.",
          "Built evaluation scripts and experimental comparisons to analyze recognition failure and perceptual quality.",
        ],
      },
      {
        heading: "Impact",
        body: "Produced a working research implementation for studying how frequency-domain perturbations can reduce recognition reliability while keeping images natural to human viewers.",
      },
    ],
  },
};
