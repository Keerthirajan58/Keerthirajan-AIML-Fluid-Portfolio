/**
 * Shared geometry for the "Latent Space" hero cluster — consumed by both the
 * static SVG fallback and the WebGL scene so the upgrade swap is seamless.
 * Coordinates live in the SVG's 0..400 viewBox space; `toWorld` maps them into
 * the R3F scene's world units.
 */

export type ClusterNode = { x: number; y: number; r: number; label?: string };

/** Labeled skill nodes + a few fixed ambient dots (the static arrangement). */
export const NODES: ClusterNode[] = [
  { x: 200, y: 200, r: 7, label: "Latent space" },
  { x: 96, y: 120, r: 5, label: "Embeddings" },
  { x: 312, y: 104, r: 5, label: "PyTorch" },
  { x: 328, y: 232, r: 5, label: "LLM-as-Judge" },
  { x: 232, y: 320, r: 5, label: "Semantic search" },
  { x: 84, y: 268, r: 5, label: "LoRA / PEFT" },
  { x: 168, y: 72, r: 3 },
  { x: 288, y: 320, r: 3 },
  { x: 40, y: 188, r: 3 },
  { x: 360, y: 168, r: 3 },
];

/** Hub-and-spoke edges of the static SVG (indices into NODES). */
export const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 6],
  [3, 7],
  [5, 8],
  [2, 9],
];

/** SVG viewBox space (0..400) → world units (-2..2, y up). */
export function toWorld(x: number, y: number): [number, number] {
  return [(x - 200) / 100, -(y - 200) / 100];
}

/** Deterministic PRNG so the ambient cloud is identical every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
