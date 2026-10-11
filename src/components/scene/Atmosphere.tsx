"use client";
import { useEffect, useRef } from "react";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";

/**
 * The Clear Air light field: soft CSS glows fixed behind the page, plus one
 * warm glow that eases toward a fine pointer. Only transforms change, so the
 * field stays on the compositor; touch, reduced-motion and Save-Data visitors
 * get the same field, static.
 */
export function Atmosphere() {
  const glow = useRef<HTMLSpanElement>(null);
  const enabled = useMotionEnabled();
  useEffect(() => {
    const el = glow.current;
    if (!enabled || !el) return;
    let x = window.innerWidth * 0.5,
      y = window.innerHeight * 0.42,
      tx = x,
      ty = y,
      frame = 0;
    const tick = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      el.style.transform = "";
    };
  }, [enabled]);
  return (
    <div
      className="atmosphere"
      aria-hidden="true"
      data-live={enabled ? "true" : undefined}
    >
      <span className="glow glow-blush" />
      <span className="glow glow-haze" />
      <span className="glow glow-peach" />
      <span className="glow glow-pointer" ref={glow} />
    </div>
  );
}
