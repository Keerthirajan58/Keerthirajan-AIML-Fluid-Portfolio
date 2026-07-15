/**
 * Static node-scatter — the "Latent Space" signature element in its still form.
 * Nodes are labelled with real skills from his work (embeddings / semantic
 * search / evaluation). Phase 4 makes an interactive version of this and reuses
 * this exact static arrangement as the prefers-reduced-motion fallback, so it's
 * intentionally deterministic (no randomness).
 */

type Node = { x: number; y: number; r: number; label?: string };

// Coordinates in a 0..400 viewBox. Central hub + labelled satellites.
const NODES: Node[] = [
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

// Edges from the central hub (index 0) outward, plus a couple of cross-links.
const EDGES: [number, number][] = [
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

export function NodeClusterStatic({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="A cluster of connected nodes labelled with machine-learning concepts, representing a vector embedding space."
    >
      <g stroke="var(--color-crimson)" strokeOpacity="0.25" strokeWidth="1">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
          />
        ))}
      </g>
      <g>
        {NODES.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={i === 0 ? "var(--color-crimson)" : "var(--color-wine)"}
              fillOpacity={i === 0 ? 1 : 0.85}
            />
            {n.label && (
              <text
                x={n.x}
                y={n.y - n.r - 8}
                textAnchor="middle"
                className="fill-ink-muted"
                style={{ fontSize: 12 }}
              >
                {n.label}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}
