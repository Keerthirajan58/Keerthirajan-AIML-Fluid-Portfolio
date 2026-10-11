"use client";
import dynamic from "next/dynamic";
import { useMotionEnabled } from "./useMotionEnabled";
const SmoothScroll = dynamic(
  () => import("./SmoothScroll").then((module) => module.SmoothScroll),
  { ssr: false },
);
/**
 * Desktop wheel smoothing only. Scroll choreography is CSS scroll-driven
 * animation (see globals.css), so no animation engine is downloaded.
 */
export function MotionFoundation() {
  const enabled = useMotionEnabled();
  return enabled ? <SmoothScroll /> : null;
}
