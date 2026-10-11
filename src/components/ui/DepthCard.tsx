"use client";
import { useRef, type ReactNode } from "react";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";

/** Pointer-only surface depth; no links, focus targets, or layout geometry move. */
export function DepthCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const enabled = useMotionEnabled();
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--shine", "0");
  };
  return (
    <article
      ref={ref}
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
      {children}
    </article>
  );
}
