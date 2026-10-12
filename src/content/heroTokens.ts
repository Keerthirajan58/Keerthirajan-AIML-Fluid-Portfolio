/**
 * The hero line, split into tokens for the "decoding" animation. Each token
 * carries illustrative next-token alternatives for the hover tooltip; they
 * are a playful design device, labelled as such, not real model output.
 */
export const heroSentence =
  "I build AI end to end, from fine-tuning and evaluating models to the agents, retrieval and full-stack products around them.";

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
    text: "AI",
    alts: [
      ["AI", 0.64],
      ["models", 0.18],
      ["systems", 0.11],
    ],
  },
  {
    text: "end",
    alts: [
      ["end", 0.58],
      ["that", 0.21],
      ["products", 0.12],
    ],
  },
  {
    text: "to",
    alts: [
      ["to", 0.93],
      ["and", 0.04],
      ["through", 0.02],
    ],
  },
  {
    text: "end,",
    alts: [
      ["end", 0.96],
      ["finish", 0.02],
      ["production", 0.01],
    ],
  },
  {
    text: "from",
    alts: [
      ["from", 0.68],
      ["across", 0.17],
      ["spanning", 0.08],
    ],
  },
  {
    text: "fine-tuning",
    alts: [
      ["fine-tuning", 0.52],
      ["training", 0.29],
      ["pretraining", 0.08],
    ],
  },
  {
    text: "and",
    alts: [
      ["and", 0.88],
      ["to", 0.07],
      ["or", 0.03],
    ],
  },
  {
    text: "evaluating",
    alts: [
      ["evaluating", 0.56],
      ["judging", 0.22],
      ["benchmarking", 0.13],
    ],
  },
  {
    text: "models",
    alts: [
      ["models", 0.61],
      ["LLMs", 0.27],
      ["embeddings", 0.06],
    ],
  },
  {
    text: "to",
    alts: [
      ["to", 0.86],
      ["through", 0.08],
      ["and", 0.04],
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
    text: "agents,",
    alts: [
      ["agents", 0.57],
      ["tools", 0.19],
      ["pipelines", 0.14],
    ],
  },
  {
    text: "retrieval",
    alts: [
      ["retrieval", 0.48],
      ["RAG", 0.31],
      ["search", 0.12],
    ],
  },
  {
    text: "and",
    alts: [
      ["and", 0.91],
      ["plus", 0.05],
      ["or", 0.02],
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
    text: "products",
    alts: [
      ["products", 0.62],
      ["apps", 0.21],
      ["software", 0.11],
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
