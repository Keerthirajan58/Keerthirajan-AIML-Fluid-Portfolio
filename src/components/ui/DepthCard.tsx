"use client";
import type { CSSProperties, ReactNode } from "react";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";

/**
 * Pointer-only surface depth: a slight tilt, an iridescent sheen and a
 * glowing edge that follow the cursor. No links, focus targets or layout
 * geometry move.
 */
export function DepthCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const enabled = useMotionEnabled();
  const reset = ({ currentTarget: el }: { currentTarget: HTMLElement }) => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--shine", "0");
  };
  return (
    <article
      style={style}
      className={`depth-card ${className}`}
      onPointerMove={(e) => {
        if (!enabled || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        e.currentTarget.style.setProperty("--rx", `${(0.5 - y) * 4}deg`);
        e.currentTarget.style.setProperty("--ry", `${(x - 0.5) * 4}deg`);
        e.currentTarget.style.setProperty("--mx", `${x * 100}%`);
        e.currentTarget.style.setProperty("--my", `${y * 100}%`);
        e.currentTarget.style.setProperty("--shine", "1");
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <span className="depth-edge" aria-hidden="true" />
      {children}
    </article>
  );
}
