/**
 * The hero line, split into tokens for the "decoding" animation. Each token
 * carries illustrative next-token alternatives for the hover tooltip; they
 * are a playful design device, labelled as such, not real model output.
 */
export const heroSentence =
  "I build machine-learning systems, evaluate LLMs, and ship the full-stack software around them.";

export type HeroToken = { text: string; alts: [string, number][] };

export const heroTokens: HeroToken[] = [
  {
    text: "I",
    alts: [
      ["I", 0.62],
      ["We", 0.21],
      ["They", 0.04],
    ],
  },
  {
    text: "build",
    alts: [
      ["build", 0.71],
      ["design", 0.14],
      ["train", 0.08],
    ],
  },
  {
    text: "machine-learning",
    alts: [
      ["machine-learning", 0.58],
      ["AI", 0.24],
      ["data", 0.09],
    ],
  },
  {
    text: "systems,",
    alts: [
      ["systems", 0.66],
      ["models", 0.21],
      ["products", 0.07],
    ],
  },
  {
    text: "evaluate",
    alts: [
      ["evaluate", 0.49],
      ["fine-tune", 0.27],
      ["deploy", 0.12],
    ],
  },
  {
    text: "LLMs,",
    alts: [
      ["LLMs", 0.72],
      ["models", 0.17],
      ["agents", 0.06],
    ],
  },
  {
    text: "and",
    alts: [
      ["and", 0.91],
      ["then", 0.05],
      ["or", 0.02],
    ],
  },
  {
    text: "ship",
    alts: [
      ["ship", 0.55],
      ["build", 0.26],
      ["deploy", 0.12],
    ],
  },
  {
    text: "the",
    alts: [
      ["the", 0.88],
      ["all", 0.06],
      ["real", 0.03],
    ],
  },
  {
    text: "full-stack",
    alts: [
      ["full-stack", 0.47],
      ["production", 0.31],
      ["end-to-end", 0.14],
    ],
  },
  {
    text: "software",
    alts: [
      ["software", 0.64],
      ["products", 0.19],
      ["apps", 0.11],
    ],
  },
  {
    text: "around",
    alts: [
      ["around", 0.52],
      ["behind", 0.28],
      ["for", 0.12],
    ],
  },
  {
    text: "them.",
    alts: [
      ["them", 0.83],
      ["it", 0.09],
      ["those", 0.04],
    ],
  },
];
