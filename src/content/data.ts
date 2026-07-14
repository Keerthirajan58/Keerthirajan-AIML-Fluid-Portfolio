/**
 * content/data.ts
 *
 * Phase 0 content extraction for the portfolio rebuild.
 *
 * Every fact in this file was copied from the legacy Bootstrap site in this
 * repo (index.html, about.html, resume.html, portfolio.html, contact.html,
 * portfolio-details.html, and the project-*.html case-study pages) as it
 * existed on 2026-07-14. Nothing here was invented, embellished, or
 * "improved." Where the source itself was vague, incomplete, or internally
 * inconsistent, that vagueness/inconsistency was preserved and is called out
 * in a comment at the point of use.
 *
 * A first extraction pass flagged several ambiguities to
 * the site owner (GitHub handle inconsistency, missing publication details,
 * location/email variants, etc.); their answers on 2026-07-14 are reflected
 * directly in the data below, with the resolution noted in-line where it
 * isn't self-evident.
 *
 * The only normalization applied anywhere in this file is whitespace
 * collapsing (the legacy HTML hard-wraps long <li> text across source lines).
 * No words, numbers, dates, titles, or names were changed, reordered, or
 * corrected beyond the owner's explicit corrections above.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroHighlight {
  icon: string; // Bootstrap Icons class, e.g. "bi-mortarboard"
  text: string;
}

export interface Profile {
  name: string;
  /** Exact <title> text from index.html */
  pageTitle: string;
  /** hero-eyebrow line above the name on index.html */
  heroEyebrow: string;
  /** meta description on index.html; usable as a one-line summary */
  tagline: string;
  /** Rotating "typed.js" role list from the hero, in source order */
  roles: string[];
  heroHighlights: HeroHighlight[];
  /** Canonical location string, confirmed by site owner (source had two variants). */
  location: string;
  /** Two paragraphs from about.html's page-title bio, in source order */
  bio: string[];
  /** "Machine Learning Engineer / Software Engineer" heading on about.html */
  aboutHeadline: string;
  aboutHighlights: HeroHighlight[];
  /**
   * Canonical summary blurb, verbatim from resume.html's <em> summary line.
   * This is the fullest/most current single-paragraph bio on the site.
   */
  resumeSummary: string;
  openToRelocation: boolean;
}

export interface ContactInfo {
  /** [primary, secondary]. Primary confirmed current by site owner. */
  emails: string[];
  phone: string;
  whatsapp: string;
  /** Verbatim from contact.html (shorter form than profile.location) */
  location: string;
  social: {
    linkedin: string;
    github: string;
    leetcode: string;
  };
  resumeUrl: string;
}

export interface EducationEntry {
  degree: string;
  dates: string;
  institution: string;
  bullets: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  dates: string;
  location: string;
  bullets: string[];
}

/** The resume's "Personal Projects" section — all three entries are "Team Lead" roles */
export interface LeadershipProjectEntry {
  role: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export type ProjectKind =
  "case-study" | "grid" | "certification" | "publication";

export interface ProjectGallery {
  cover: string;
  slides: string[];
  /**
   * "real"           — actual screenshots exist on disk today
   * "fallback-only"  — folder exists but only fallback.svg is real; cover/slide
   *                     paths are wired up in the HTML with onerror fallback
   * "none"           — no project image folder exists at all; the portfolio
   *                     grid card uses an unrelated shared placeholder image
   *                     instead, and there is no onerror fallback wiring
   */
  imageStatus: "real" | "fallback-only" | "none";
}

export interface CaseStudyDetail {
  /** "Category" field on the project-*.html info panel (may read differently than the grid card's `badge`) */
  category: string;
  dates: string;
  tech: string[];
  githubUrl?: string;
  devpostUrl?: string;
  blogUrl?: string;
  overview: string;
  problem: string;
  engineeringBullets: string[];
  impact: string;
}

/** Extra detail captured only for Twitter Sentiment Analysis, from the legacy portfolio-details.html template page */
export interface LegacyDetailsNote {
  sourcePage: string;
  category: string;
  techStack: string;
  fullDescription: string;
  confidentialityNote: string;
}

export interface ProjectEntry {
  slug: string;
  title: string;
  kind: ProjectKind;
  /** true for the 3 portfolio.html cards styled with the "featured-portfolio" class */
  featured: boolean;
  /** portfolio-badge text on the portfolio.html grid card */
  badge: string;
  /** portfolio.html grid card description */
  description: string;
  /** portfolio.html portfolio-tags */
  tags: string[];
  /** isotope-filter classes from portfolio.html, with the "filter-" prefix stripped */
  filters: string[];
  /** Image path used on the portfolio.html grid card itself */
  primaryImage: string;
  /** Only present for the 5 projects with a real project-*.html case-study page (Siri Core Modeling is featured but has no case study — see its `kind` note below) */
  gallery?: ProjectGallery;
  links: {
    detailsPage?: string;
    github?: string;
    devpost?: string;
    blog?: string;
    credential?: string;
  };
  /** Present only for the 5 projects with a real project-*.html case-study page */
  caseStudy?: CaseStudyDetail;
  legacyDetailsNote?: LegacyDetailsNote;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  image: string;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profile: Profile = {
  name: "Keerthirajan Senthilkumar",
  pageTitle: "Keerthirajan Senthilkumar | AIML & Software Engineer",
  heroEyebrow: "AIML & Software Engineering Graduate",
  tagline:
    "Portfolio of Keerthirajan Senthilkumar, an AIML and software engineering graduate focused on machine learning, LLM evaluation, and full-stack projects.",
  roles: [
    "Machine Learning Engineer",
    "Software Engineer",
    "AIML Evaluation Builder",
    "Full-Stack Developer",
  ],
  heroHighlights: [
    { icon: "bi-mortarboard", text: "MS CS, GWU 2026" },
    { icon: "bi-cpu", text: "Apple AIML Intern" },
    { icon: "bi-geo-alt", text: "Arlington, VA" },
  ],
  location: "Arlington, VA",
  bio: [
    "I am a recent Master's in Computer Science graduate from The George Washington University, specializing in AIML and software engineering. My work sits at the intersection of machine learning systems, evaluation design, and practical full-stack development, with recent industry experience as an AIML Machine Learning Engineer intern on Apple's Siri Core Modeling team.",
    "I build data-driven products with a focus on reliable model behavior, clean engineering, and measurable user value. My recent work includes LLM evaluation workflows, transformer-based modeling, mobile applications, applied ML projects, and responsive web experiences.",
  ],
  aboutHeadline: "Machine Learning Engineer / Software Engineer",
  aboutHighlights: [
    { icon: "bi-award", text: "SEAS Dean's Award" },
    { icon: "bi-apple", text: "Apple AIML Internship" },
    { icon: "bi-code-square", text: "ML + Full Stack Projects" },
  ],
  resumeSummary:
    "Machine Learning Engineer and Software Engineer with an MS in Computer Science from The George Washington University, specializing in AIML and SWE. Recent Apple AIML internship experience across Siri Core Modeling, LLM evaluation, transformer-based workflows, vector embeddings, fine-tuning, and performance benchmarking.",
  openToRelocation: true,
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contact: ContactInfo = {
  // Primary confirmed current by site owner; secondary kept as a real
  // alternate contact (both appear on the legacy site).
  emails: ["keerthirajans@gwu.edu", "rajankeerthi0261@gmail.com"],
  phone: "+1 (571) 220-6152",
  whatsapp: "+91 9500525311",
  location: "Arlington, VA",
  social: {
    linkedin: "https://www.linkedin.com/in/keerthirajans58/",
    github: "https://github.com/Keerthirajan58/",
    leetcode: "https://leetcode.com/u/keerthirajan58/",
  },
  resumeUrl: "assets/Resume - Keerthirajan Senthilkumar.pdf",
};

// ---------------------------------------------------------------------------
// Education (resume.html)
// ---------------------------------------------------------------------------

export const education: EducationEntry[] = [
  {
    degree: "Master's in Computer Science, AIML & SWE Specialization",
    dates: "Aug 2024 - May 2026",
    institution: "The George Washington University, USA",
    bullets: [
      "Honored with the SEAS Dean's Award in recognition of outstanding accomplishments.",
      "Recipient of the Dean's Merit Scholarship Award, providing a 50% tuition discount totaling over $38,000.",
      "Relevant Coursework: Design and Analysis of Algorithms, Advanced Software Paradigms, Computer System Architecture.",
    ],
  },
  {
    degree: "Bachelor's in Computer Science & Engineering",
    dates: "2019 - 2023",
    institution: "Sri Venkateswara College of Engineering, India",
    bullets: [
      "Relevant Coursework: Data Structures, Natural Language Processing, Artificial Intelligence, Machine Learning and Algorithms, Business Intelligence, Advanced User-interface and Technology.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Professional Experience (resume.html)
// ---------------------------------------------------------------------------

export const experience: ExperienceEntry[] = [
  {
    role: "AIML Machine Learning Engineer Intern",
    company: "Apple",
    dates: "May 2025 - Aug 2025",
    location: "Seattle, WA",
    bullets: [
      "Worked on Siri Core Modeling initiatives involving transformer-based modeling, model fine-tuning, evaluation workflows, and performance benchmarking.",
      "Built and evaluated AIML pipelines using PyTorch, Hugging Face Transformers, LoRA/PEFT, Sentence Transformers, and vector embeddings.",
      "Designed deterministic LLM programming and LLM-as-judge evaluation workflows to support reproducible research and model quality analysis.",
    ],
  },
  {
    role: "Software Engineer Intern",
    company: "TCS",
    dates: "Nov 2021 - Dec 2021",
    location: "Chennai, India",
    bullets: [
      "Engineered a web app for real-time Twitter sentiment analysis, scraping product data to provide actionable insights for critical decision-making. Reduced inference runtime by 40% by incorporating data techniques such as subjectivity and polarity.",
      "Leveraged Tweepy API for real-time Twitter data integration. Improved model prediction accuracy by 18% using TextBlob over traditional Machine Learning models.",
    ],
  },
  {
    role: "Web Development Intern",
    company: "The Sparks Foundation",
    dates: "May 2021 - Jun 2021",
    location: "Singapore - Remote",
    bullets: [
      "Devised a fully responsive charity donation website integrating payment gateway with seamless transaction workflows and automated email receipts. Recognized for achieving 98% unit test code coverage for the core logic.",
      // Source literally reads "Bootstraps" (with a trailing "s") — preserved verbatim, not corrected to "Bootstrap".
      "Utilized modern JavaScript frameworks and Bootstraps to enhance user experience and mobile compatibility.",
      "Mentored a team of 5+ developers, facilitating pair programming sessions to improve code quality and foster collaboration.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Personal Projects leadership (resume.html "Personal Projects" section — all "Team Lead")
// ---------------------------------------------------------------------------

export const personalProjectsLeadership: LeadershipProjectEntry[] = [
  {
    role: "Team Lead",
    title: "Emotion Based Food Recommending App",
    dates: "Sep 2024 - Nov 2024",
    bullets: [
      'Led a team of 5 to develop "MoodBites," a Kotlin-based Android application that recommends and tracks user meals based on their moods, enhancing mental well-being through data-driven insights.',
      "Designed and implemented a scalable database with Firebase for efficient storage and real-time management of user meals, mood logs, and order information, including automated email receipts for order confirmations.",
      "Optimized app performance, reducing load times and enhancing responsiveness to ensure a seamless user experience across devices.",
    ],
  },
  {
    role: "Team Lead",
    title: "GI Tract Segmentation",
    dates: "Nov 2022 - Mar 2023",
    bullets: [
      "Led a team of 3 developers to build ML model for segmenting Gastro-Intestinal Tract organs from tumors through MRI scans.",
      "Applied Deep Context Metric Learning for advanced image clustering and processing—improved survival rates by 8% through targeted treatment focused on tumors rather than surrounding organs.",
      "Optimized backend scalability to handle 38,000 masked 16-bit image datasets, reducing processing time from 5 hours to 2 hours for smoother operation.",
    ],
  },
  {
    role: "Team Lead",
    title: "Efficient Water Quality Analysis",
    // Source h5 has a trailing space ("Apr 2022 - Oct 2022 "); trimmed here (whitespace-only).
    dates: "Apr 2022 - Oct 2022",
    bullets: [
      "Designed an end-to-end model to analyze water quality using multiple factors such as turbidity and hardness.",
      "Incorporated XGBoost to optimize memory usage and processing speed, resulting in 20% increased model's prediction accuracy.",
      "Reduced computational load by using hyperparameter tuning and adjusting maximum depth and minimum sample split.",
      "Deployed the model on IBM Cloud to optimize scalability by 1.5x better than local run.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Skills (about.html — 5 grouped categories, source order)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Projects (portfolio.html grid, in source order, enriched with case-study
// pages where they exist)
// ---------------------------------------------------------------------------

export const projects: ProjectEntry[] = [
  // --- Featured / case-study-style entries -------------------------------
  {
    slug: "siri-core-modeling",
    title: "Siri Core Modeling",
    // No project-*.html page exists for this one — it links straight to
    // resume.html and has no Overview/Problem/Engineering/Impact prose, so
    // it does not meet the bar for `kind: "case-study"` even though the
    // portfolio grid presents it as a featured, case-study-style tile.
    kind: "grid",
    featured: true,
    badge: "Featured Experience",
    description:
      "Apple AIML internship focused on modeling workflows, LLM evaluation, embeddings, fine-tuning, and performance benchmarking.",
    tags: ["PyTorch", "Transformers", "LLM Evaluation"],
    filters: ["aiml", "genai"],
    // Actual source in portfolio.html — shares this file with the unrelated
    // "Twitter Sentiment Analysis" grid card below, and has no onerror
    // fallback wiring (unlike the 5 project-*.html-backed cards).
    primaryImage: "assets/img/portfolio/app-1.jpg",
    gallery: {
      // No assets/img/projects/siri-core-modeling/ folder exists at all —
      // this is the intended path per the site's naming convention, not a
      // path that currently resolves to anything.
      cover: "assets/img/projects/siri-core-modeling/cover.jpg",
      slides: [
        "assets/img/projects/siri-core-modeling/slide-1.jpg",
        "assets/img/projects/siri-core-modeling/slide-2.jpg",
        "assets/img/projects/siri-core-modeling/slide-3.jpg",
        "assets/img/projects/siri-core-modeling/slide-4.jpg",
      ],
      imageStatus: "none",
    },
    links: {
      detailsPage: "resume.html",
    },
  },
  {
    slug: "pitchpulse",
    title: "PitchPulse",
    kind: "case-study",
    featured: true,
    badge: "Hackathon / Sports AI",
    description:
      "AI sports science assistant for player readiness, injury risk, rPPG vitals, movement analysis, and tactical XI recommendations.",
    tags: ["Flutter", "FastAPI", "Gemini", "rPPG"],
    filters: ["aiml", "genai", "hackathon", "mobile", "cv"],
    primaryImage: "assets/img/projects/pitchpulse/cover.jpg",
    gallery: {
      cover: "assets/img/projects/pitchpulse/cover.jpg",
      slides: [
        "assets/img/projects/pitchpulse/slide-1.jpg",
        "assets/img/projects/pitchpulse/slide-2.jpg",
        "assets/img/projects/pitchpulse/slide-3.jpg",
        "assets/img/projects/pitchpulse/slide-4.jpg",
      ],
      imageStatus: "fallback-only",
    },
    links: {
      detailsPage: "project-pitchpulse.html",
      github: "https://github.com/Keerthirajan58/PitchPulseAI/tree/main",
      devpost: "https://devpost.com/software/pitchpulse-32pbyx",
    },
    caseStudy: {
      category: "AI Sports Science / Hackathon",
      dates: "Feb 2026",
      tech: [
        "Flutter",
        "Swift",
        "FastAPI",
        "Python",
        "Firebase",
        "Supabase",
        "Presage SDK",
        "Gemini 2.5 Flash",
        "Actian VectorDB",
        "Cloudflare Tunnels",
      ],
      githubUrl: "https://github.com/Keerthirajan58/PitchPulseAI/tree/main",
      devpostUrl: "https://devpost.com/software/pitchpulse-32pbyx",
      overview:
        "PitchPulse is an AI-driven high-performance management system for football managers. It combines match workload, player check-ins, rPPG vitals, movement screening, and GenAI recommendations into a single readiness and tactical planning workflow.",
      problem:
        "Professional teams lose major value when player availability drops because of preventable workload spikes and soft-tissue injuries. Managers often have physical match data, but not a unified view of emotional readiness, biometric signals, movement quality, and tactical risk.",
      engineeringBullets: [
        "Built a Flutter mobile app with Provider state management and a Swift bridge for the Presage SDK to extract heart rate, HRV, stress, and emotional state from a selfie check-in.",
        "Engineered a Python/FastAPI backend that calculates Acute:Chronic Workload Ratio and updates risk bands from match statistics, vitals, and movement analysis.",
        "Used Gemini Vision and Gemini 2.5 Flash to produce structured JSON action plans, suggested XI decisions, and mechanical movement corrections from player context.",
        "Used Firebase authentication, Supabase storage, Actian VectorDB retrieval, and Cloudflare Tunnels to support the mobile-to-backend workflow.",
      ],
      impact:
        "Shipped a full-stack, multimodal sports science platform in 36 hours with readiness dashboards, injury-risk explanations, recovery recommendations, and game-day squad planning.",
    },
  },
  {
    slug: "barterbrain",
    title: "BarterBrAIn",
    kind: "case-study",
    featured: true,
    badge: "Winning Hackathon",
    description:
      "Technica-winning AI campus barter app with valuation, negotiation, sustainability, and fairness intelligence.",
    tags: ["Flutter", "Firebase", "Gemini", "Cloud Functions"],
    filters: ["aiml", "genai", "hackathon", "mobile"],
    primaryImage: "assets/img/projects/barterbrain/cover.jpg",
    gallery: {
      cover: "assets/img/projects/barterbrain/cover.jpg",
      slides: [
        "assets/img/projects/barterbrain/slide-1.jpg",
        "assets/img/projects/barterbrain/slide-2.jpg",
        "assets/img/projects/barterbrain/slide-3.jpg",
        "assets/img/projects/barterbrain/slide-4.jpg",
      ],
      // Only project folder with real screenshots today.
      imageStatus: "real",
    },
    links: {
      detailsPage: "project-barterbrain.html",
      github: "https://github.com/Keerthirajan58/BarterBr-AI-n",
      devpost: "https://devpost.com/software/barterbrain",
    },
    caseStudy: {
      category: "AI Campus Barter / Hackathon Winner",
      dates: "Oct 2025",
      tech: [
        "Flutter",
        "Firebase",
        "Firestore",
        "Gemini 2.5 Pro",
        "Node.js",
        "Cloud Functions",
        "AI Agents",
      ],
      githubUrl: "https://github.com/Keerthirajan58/BarterBr-AI-n",
      devpostUrl: "https://devpost.com/software/barterbrain",
      overview:
        "BarterBrAIn is an AI-powered campus barter platform that helps students swap items instead of buying new ones. The app supports valuation, negotiation, sustainability tracking, and transparent fairness scoring for safer student-to-student exchanges.",
      problem:
        "Students often own unused items that could be valuable to someone else, but direct swaps are hard to price, negotiate, and trust. We designed the app around fair value, verified campus users, and sustainability impact.",
      engineeringBullets: [
        "Led the AI/ML features, including multimodal item valuation, negotiation reasoning, confidence scoring, and fallback deterministic valuation.",
        "Built AI fairness logic for swap-equity scoring, cash-adjustment suggestions, condition estimation, and explainable valuation factors.",
        "Integrated Gemini 2.5 Pro / Flash through secure Node.js Cloud Functions with caching, Firebase Authentication, and Firestore storage.",
        "Added sustainability calculations to estimate CO2 savings after successful trades.",
      ],
      impact:
        "Won Best Hack for Social Good (Sustainability) at Technica 2025 among 80+ teams and 450+ participants, and later reached the top 5 in a startup competition with 200+ teams.",
    },
  },
  {
    slug: "historical-event-narrator",
    title: "Historical Event Narrator",
    kind: "case-study",
    featured: false,
    badge: "Fine-Tuned LLM",
    description:
      "LoRA fine-tuned Mistral-7B system for creative alternate-history generation and LLM-as-judge evaluation.",
    tags: ["Mistral-7B", "LoRA / PEFT", "Streamlit", "Gemini"],
    filters: ["aiml", "genai", "web"],
    primaryImage: "assets/img/projects/historical-event-narrator/cover.jpg",
    gallery: {
      cover: "assets/img/projects/historical-event-narrator/cover.jpg",
      slides: [
        "assets/img/projects/historical-event-narrator/slide-1.jpg",
        "assets/img/projects/historical-event-narrator/slide-2.jpg",
        "assets/img/projects/historical-event-narrator/slide-3.jpg",
        "assets/img/projects/historical-event-narrator/slide-4.jpg",
      ],
      imageStatus: "fallback-only",
    },
    links: {
      detailsPage: "project-historical-event-narrator.html",
      github: "https://github.com/Keerthirajan58/Historical-Event-Narrator",
    },
    caseStudy: {
      category: "Fine-Tuned LLM / GenAI",
      dates: "Oct 2025 - Dec 2025",
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
      githubUrl: "https://github.com/Keerthirajan58/Historical-Event-Narrator",
      overview:
        "Historical Event Narrator fine-tunes a Mistral-7B based model to generate creative alternate-history narratives by combining factual historical events with plausible what-if twists.",
      problem:
        "Base open-source models were factual but dry, producing essay-like summaries with weak creative divergence. The goal was to teach a smaller local model to generate vivid, cinematic narratives while preserving historical relevance.",
      engineeringBullets: [
        "Fine-tuned Mistral-7B-v0.1 with LoRA and PEFT, using parameter-efficient updates instead of full retraining.",
        "Trained locally on Apple Silicon MPS with mixed precision to work within hardware constraints and avoid paid cloud GPUs.",
        "Generated a synthetic dataset by transforming 1,200+ Wikipedia articles into narrative-plus-twist pairs with Gemini 2.5 Flash.",
        "Implemented guided inference, stopping criteria, and a Streamlit evaluation layer using Gemini Pro as an LLM judge for creativity, relevance, and twist quality.",
      ],
      impact:
        "A/B evaluation moved outputs from factual summaries to vivid alternate narratives, improving creativity from 3/10 to 8/10, twist quality from 0/10 to 9/10, and ROUGE-L structural coherence by 100%+ for the task.",
    },
  },
  {
    slug: "face-cloaking",
    // portfolio.html grid card title is "Face Cloaking"; the case-study
    // page's own <h1> is the longer "Frequency-Domain Adversarial Cloaking".
    // Both preserved verbatim — see `caseStudy` for the page's own title use.
    title: "Face Cloaking",
    kind: "case-study",
    featured: false,
    badge: "Privacy / CV",
    description:
      "DCT-based adversarial cloaking pipeline that disrupts FaceNet recognition while preserving visual fidelity.",
    tags: ["PyTorch", "DCT", "FaceNet", "SSIM"],
    filters: ["aiml", "cv"],
    primaryImage: "assets/img/projects/face-cloaking/cover.jpg",
    gallery: {
      cover: "assets/img/projects/face-cloaking/cover.jpg",
      slides: [
        "assets/img/projects/face-cloaking/slide-1.jpg",
        "assets/img/projects/face-cloaking/slide-2.jpg",
        "assets/img/projects/face-cloaking/slide-3.jpg",
        "assets/img/projects/face-cloaking/slide-4.jpg",
      ],
      imageStatus: "fallback-only",
    },
    links: {
      detailsPage: "project-face-cloaking.html",
      github: "https://github.com/Keerthirajan58/Computer-Vision-Final-Project",
      blog: "https://medium.com/@anaswara.raghuthaman/can-frequency-domain-cloaking-prevent-face-recognition-what-we-learned-from-building-one-35ed2492f83e",
    },
    caseStudy: {
      category: "Computer Vision / Privacy",
      dates: "Dec 2025",
      tech: [
        "Python",
        "PyTorch",
        "Differentiable DCT/IDCT",
        "FaceNet",
        "InceptionResnetV1",
        "VGGFace2",
        "SSIM optimization",
      ],
      githubUrl:
        "https://github.com/Keerthirajan58/Computer-Vision-Final-Project",
      blogUrl:
        "https://medium.com/@anaswara.raghuthaman/can-frequency-domain-cloaking-prevent-face-recognition-what-we-learned-from-building-one-35ed2492f83e",
      overview:
        "This project explores frequency-domain adversarial cloaking as a privacy-preserving defense against automated face recognition. Instead of directly editing pixels, the pipeline perturbs DCT coefficients to keep the visual change subtle while disrupting recognition.",
      problem:
        "Face recognition systems can identify people from images at scale, creating privacy risks. A useful cloak must reduce recognition success while remaining visually imperceptible to humans.",
      engineeringBullets: [
        "Implemented a differentiable DCT/IDCT attack pipeline in PyTorch to optimize perturbations in the frequency domain.",
        "Targeted the InceptionResnetV1 FaceNet model pretrained on VGGFace2 to disrupt identity embeddings.",
        "Optimized for visual fidelity with SSIM so the generated cloak preserves image quality.",
        "Built evaluation scripts and experimental comparisons to analyze recognition failure and perceptual quality.",
      ],
      impact:
        "Produced a working research implementation for studying how frequency-domain perturbations can reduce recognition reliability while keeping images natural to human viewers.",
    },
  },
  {
    slug: "coding-problem-recommender",
    title: "Coding Problem Recommender",
    kind: "case-study",
    featured: false,
    badge: "Semantic Search",
    description:
      "Semantic search system mapping job descriptions to LeetCode problems using embeddings and clustering.",
    tags: ["Sentence Transformers", "FastAPI", "Streamlit", "Azure ML"],
    filters: ["aiml", "genai", "web"],
    primaryImage: "assets/img/projects/coding-problem-recommender/cover.jpg",
    gallery: {
      cover: "assets/img/projects/coding-problem-recommender/cover.jpg",
      slides: [
        "assets/img/projects/coding-problem-recommender/slide-1.jpg",
        "assets/img/projects/coding-problem-recommender/slide-2.jpg",
        "assets/img/projects/coding-problem-recommender/slide-3.jpg",
        "assets/img/projects/coding-problem-recommender/slide-4.jpg",
      ],
      imageStatus: "fallback-only",
    },
    links: {
      detailsPage: "project-coding-problem-recommender.html",
      github: "https://github.com/Keerthirajan58/Interview-prep-tool-AI-ML-",
    },
    caseStudy: {
      category: "Semantic Search / Interview Prep",
      dates: "Jan 2025 - Apr 2025",
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
      githubUrl: "https://github.com/Keerthirajan58/Interview-prep-tool-AI-ML-",
      overview:
        "The Intelligent Coding Problem Recommendation System maps job descriptions to relevant LeetCode problems so candidates can focus interview prep around role-specific requirements instead of generic topic lists.",
      problem:
        "Software engineering job descriptions vary by stack, seniority, and domain. A strong prep workflow should understand those requirements semantically and recommend practice problems with topic diversity.",
      engineeringBullets: [
        "Processed and embedded 1,571 LeetCode problems with Sentence Transformers for semantic retrieval.",
        "Implemented cosine similarity ranking and K-Means clustering to improve relevance and avoid repetitive recommendations.",
        "Built a FastAPI backend and Streamlit interface with LLM-generated explanations for why each problem matches the input role.",
        "Used Azure ML for deployment experimentation and model workflow management.",
      ],
      impact:
        "Delivered an interactive recommendation workflow with relevance scoring, cluster-aware diversity, and clear explanations that connect job requirements to coding practice.",
    },
  },

  // --- Lighter / grid-only projects ---------------------------------------
  {
    slug: "moodbites",
    title: "MoodBites",
    kind: "grid",
    featured: false,
    badge: "Mobile + Firebase",
    description:
      "Kotlin Android app that recommends and tracks meals based on mood signals and user history.",
    tags: ["Kotlin", "Firebase", "Android"],
    filters: ["mobile", "aiml"],
    primaryImage: "assets/img/portfolio/app-5.jpg",
    links: {
      github: "https://github.com/Keerthirajan58/Mood-Bites---Kotlin-App",
    },
  },
  {
    slug: "gi-tract-segmentation",
    title: "GI Tract Segmentation",
    kind: "grid",
    featured: false,
    badge: "Medical Imaging",
    description:
      "Deep learning project for segmenting gastro-intestinal tract organs and tumor regions from MRI scans.",
    tags: ["Deep Learning", "Computer Vision", "Medical AI"],
    filters: ["aiml", "cv"],
    primaryImage: "assets/img/portfolio/app-3.jpg",
    links: {
      github: "https://github.com/Keerthirajan58/GI-Tract-Segmentation",
    },
  },
  {
    slug: "water-quality-analysis",
    title: "Efficient Water Quality Analysis",
    kind: "grid",
    featured: false,
    badge: "Applied ML",
    description:
      "End-to-end model for water quality prediction using turbidity, hardness, and related environmental factors.",
    tags: ["XGBoost", "IBM Cloud", "ML Pipelines"],
    filters: ["aiml"],
    primaryImage: "assets/img/portfolio/app-4.jpg",
    links: {
      github:
        "https://github.com/Keerthirajan58/IBM-Efficient-Water-Quality-Analysis-and-Prediction",
    },
  },
  {
    slug: "twitter-sentiment-analysis",
    title: "Twitter Sentiment Analysis",
    kind: "grid",
    featured: false,
    badge: "Internship Project",
    description:
      "Real-time sentiment analysis web app for extracting product insights from Twitter data.",
    tags: ["Tweepy", "TextBlob", "Python", "Flask"],
    filters: ["aiml", "web"],
    // Same file as siri-core-modeling's primaryImage — reused/shared in the source.
    primaryImage: "assets/img/portfolio/app-1.jpg",
    links: {
      // portfolio.html links this card to the legacy generic template page,
      // not to a project-*.html case study.
      detailsPage: "portfolio-details.html",
    },
    legacyDetailsNote: {
      sourcePage: "portfolio-details.html",
      category: "TCS - Intern Project",
      techStack: "Python, Tweepy, Textblob, Flask",
      fullDescription:
        "The purpose of this project is to perform real-time sentiment analysis on Twitter data. Users can input either a Twitter username or a hashtag, and the application fetches relevant tweets using the Twitter API. By analyzing these tweets with TextBlob, it categorizes them as Positive, Negative, or Neutral and calculates the percentage for each sentiment. The insights can help businesses make data-driven decisions by understanding public sentiment.",
      confidentialityNote:
        "Due to confidentiality agreements with TCS, I cannot share specific details about the projects I worked on during my internship. However, I can provide the tech stacks that I used and the project description below.",
    },
  },
  {
    slug: "charity-donation-website",
    title: "Charity Donation Website",
    kind: "grid",
    featured: false,
    badge: "Web Development",
    description:
      "Responsive donation website with payment gateway integration and automated email receipts.",
    tags: ["JavaScript", "Bootstrap", "Payments"],
    filters: ["web"],
    primaryImage: "assets/img/portfolio/app-2.jpg",
    links: {
      github:
        "https://github.com/Keerthirajan58/DONATE-US-The-sparks-foundation-",
    },
  },

  // --- Publications ----------------------------------------------------------
  // portfolio.html only had one vague "National Conference Paper" entry;
  // site owner supplied the real titles/venues/dates for both papers below.
  {
    slug: "gi-tract-segmentation-paper",
    title:
      "A Comprehensive Review on Optimized Approach for Gastro-Intestinal Tract Segmentation to Improve Cancer Treatment",
    kind: "publication",
    featured: false,
    badge: "Publication",
    description:
      "Presented at the National Conference on Innovative Computing Research, SVCE, India (May 2023).",
    tags: [],
    filters: [],
    primaryImage: "assets/img/portfolio/product-1.jpg",
    links: {},
  },
  {
    slug: "sentiment-analysis-survey-paper",
    title: "Sentiment Analysis of Twitter Comments – A Survey",
    kind: "publication",
    featured: false,
    badge: "Publication",
    description:
      "Presented at the National Conference on Youth Advanced Computational Convergence, RGNIYD, India (Mar 2023).",
    tags: [],
    filters: [],
    primaryImage: "assets/img/portfolio/product-1.jpg",
    links: {},
  },

  // --- Certifications (9, source order) ------------------------------------
  {
    slug: "certification-machine-learning-stanford",
    title: "Machine Learning",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "Stanford University course certification.",
    tags: [],
    filters: ["certification", "aiml"],
    primaryImage: "assets/img/portfolio/branding-1.jpg",
    links: {
      credential:
        "https://www.coursera.org/account/accomplishments/verify/LBWAGV269YVH",
    },
  },
  {
    slug: "certification-ibm-project",
    title: "IBM Certified Project",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "ICT Academy project certification.",
    tags: [],
    filters: ["certification"],
    primaryImage: "assets/img/portfolio/branding-5.jpg",
    links: {
      credential:
        "https://courses.ictacademy.skillsnetwork.site/certificates/3a37a247baa4474f8733a86a24e2cb12",
    },
  },
  {
    slug: "certification-web-development-ucdavis",
    title: "Web Development",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "UC Davis web development course certification.",
    tags: [],
    filters: ["certification", "web"],
    primaryImage: "assets/img/portfolio/branding-8.jpg",
    links: {
      credential: "http://coursera.org/verify/T7H86R7HML9R",
    },
  },
  {
    slug: "certification-programming-foundations-duke",
    title: "Programming Foundations",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "Duke University course certification.",
    tags: [],
    filters: ["certification"],
    primaryImage: "assets/img/portfolio/branding-2.jpg",
    links: {
      credential: "https://coursera.org/verify/98YLYAJQUXZY",
    },
  },
  {
    slug: "certification-relational-db-sql",
    title: "Relational DB and SQL",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "Coursera database course certification.",
    tags: [],
    filters: ["certification"],
    primaryImage: "assets/img/portfolio/branding-3.jpg",
    links: {
      credential: "http://coursera.org/verify/MB2V55ZDEUFW",
    },
  },
  {
    slug: "certification-api-designer",
    title: "API Designer",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "API Academy course certification.",
    tags: [],
    filters: ["certification"],
    primaryImage: "assets/img/portfolio/branding-4.jpg",
    links: {
      // Points at the general LinkedIn certifications list rather than a
      // specific credential URL — confirmed intentional by site owner (the
      // LinkedIn page links through to the certificate photo).
      credential:
        "https://www.linkedin.com/in/keerthirajans58/details/certifications/",
    },
  },
  {
    slug: "certification-ai-event-guvi",
    title: "AI Event Project",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "GUVI AI event project certification.",
    tags: [],
    filters: ["certification", "aiml"],
    primaryImage: "assets/img/portfolio/branding-6.jpg",
    links: {
      credential:
        "https://www.guvi.in/verify-certificate?id=1O17U19P26900xipwo",
    },
  },
  {
    slug: "certification-programming-in-java-nptel",
    title: "Programming in Java",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "IIT Kharagpur NPTEL course certification.",
    tags: [],
    filters: ["certification"],
    primaryImage: "assets/img/portfolio/branding-7.jpg",
    links: {
      // Points at the generic NPTEL homepage rather than a specific
      // certificate verification URL — confirmed intentional by site owner.
      credential: "https://nptel.ac.in/noc",
    },
  },
  {
    slug: "certification-php-mysql-udemy",
    title: "PHP and MySQL",
    kind: "certification",
    featured: false,
    badge: "Certification",
    description: "Udemy course certification.",
    tags: [],
    filters: ["certification", "web"],
    primaryImage: "assets/img/portfolio/branding-9.jpg",
    links: {
      // Same generic LinkedIn certifications list URL as "API Designer" above.
      credential:
        "https://www.linkedin.com/in/keerthirajans58/details/certifications/",
    },
  },
];

// ---------------------------------------------------------------------------
// Testimonials (about.html, 2 total, source order)
// ---------------------------------------------------------------------------

export const testimonials: Testimonial[] = [
  {
    quote:
      "Keerthirajan consistently demonstrated a deep understanding of software principles, coupled with a remarkable ability to apply these concepts in practical, real-world situations. I am confident that he will bring the same level of commitment, enthusiasm, and excellence to any role he undertakes. I highly recommend him to anyone seeking a capable and driven professional with a strong foundation in Software Engineering.",
    name: "Dr. Jayabhaduri Radhakrishnan",
    title: "Professor",
    // Source pairs this testimonial with the "-2" image file, not "-1" —
    // preserved exactly as authored, not reordered to match name/number.
    image: "assets/img/testimonials/testimonials-2.jpg",
  },
  {
    quote:
      "Keerthirajan is one of the top 10 students in our department of Computer Science and Engineering. His strong academic background, along with his capacity to succeed in research and problem-solving, distinguishes him as an extraordinary prospect. I am confident that his ravenous appetite for knowledge, along with his ambition to make a significant contribution, will propel him to unprecedented success in his future endeavors.",
    name: "Dr. P. Janarthanan",
    title: "Mentor & Professor",
    image: "assets/img/testimonials/testimonials-1.jpg",
  },
];
