"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NODES } from "./data";
import { NodeClusterStatic } from "./Static";
import type { PointerState } from "./ClusterScene";

/**
 * Orchestrates the signature element's progressive upgrade:
 *
 *   static SVG (SSR, always first paint)
 *     → WebGL scene, but only when ALL of these hold:
 *        - browser idle moment has passed (never competes with LCP/hydration)
 *        - user does not prefer reduced motion
 *        - Save-Data is off
 *        - a WebGL context can actually be created
 *
 * The scene pauses (frameloop="never") while offscreen or when the tab is
 * hidden, and a lost WebGL context demotes back to the static SVG for good.
 */

const ClusterScene = dynamic(() => import("./ClusterScene"), {
  ssr: false,
  // While the three.js chunk streams in, the static SVG below stays visible.
  loading: () => null,
});

type SaveDataNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

export function NodeCluster({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<"static" | "webgl">("static");
  const [active, setActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });

  // Upgrade decision — runs once, after idle.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ((navigator as SaveDataNavigator).connection?.saveData) return;

    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!gl) return;

    const upgrade = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches);
      setMode("webgl");
    };
    // requestIdleCallback is missing from older Safari — fall back to a timer.
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(upgrade);
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(upgrade, 1500);
    return () => window.clearTimeout(handle);
  }, []);

  // Live reduced-motion toggle: unlike ScrollFX (gsap.matchMedia, which
  // listens for changes itself), the upgrade check above is a one-time
  // snapshot. If the user turns on reduced-motion at the OS level while the
  // WebGL scene is already running, demote back to the static SVG immediately
  // rather than waiting for a reload.
  useEffect(() => {
    if (mode !== "webgl") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (mq.matches) setMode("static");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  // Pause the frameloop when offscreen or the tab is hidden.
  useEffect(() => {
    if (mode !== "webgl") return;
    const el = containerRef.current;
    if (!el) return;

    let inView = true;
    let visible = !document.hidden;
    const apply = () => setActive(inView && visible);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        apply();
      },
      { rootMargin: "80px" },
    );
    io.observe(el);
    const onVis = () => {
      visible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode]);

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      inside: true,
    };
  };
  const onPointerLeave = () => {
    pointer.current = { ...pointer.current, inside: false };
  };

  const labels = NODES.filter((n) => n.label);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="A drifting cluster of connected nodes labelled with machine-learning concepts, representing a vector embedding space."
      className={`relative aspect-square ${className}`}
      onPointerMove={mode === "webgl" ? onPointerMove : undefined}
      onPointerLeave={mode === "webgl" ? onPointerLeave : undefined}
    >
      {mode === "webgl" ? (
        <>
          <ClusterScene
            active={active}
            isMobile={isMobile}
            pointer={pointer}
            onContextLost={() => setMode("static")}
          />
          {/* Crisp HTML labels over the canvas, at the anchors' fixed spots. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {labels.map((n) => (
              <span
                key={n.label}
                className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap pb-2 text-xs text-ink-muted"
                style={{ left: `${n.x / 4}%`, top: `${n.y / 4}%` }}
              >
                {n.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <NodeClusterStatic className="h-auto w-full" />
      )}
    </div>
  );
}
