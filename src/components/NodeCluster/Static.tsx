import { NODES, EDGES } from "./data";

/**
 * Static form of the Latent Space cluster. Serves as: SSR/no-JS content, the
 * prefers-reduced-motion rendering, the loading state while the WebGL chunk
 * fetches, and the permanent fallback if WebGL is unavailable or its context
 * is lost. Deterministic — matches the WebGL scene's anchor layout exactly.
 */
export function NodeClusterStatic({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
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
