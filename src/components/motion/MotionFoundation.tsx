"use client";
import dynamic from "next/dynamic";
import { useMotionEnabled } from "./useMotionEnabled";
const SmoothScroll = dynamic(
  () => import("./SmoothScroll").then((module) => module.SmoothScroll),
  { ssr: false },
);
const ScrollFX = dynamic(
  () => import("./ScrollFX").then((module) => module.ScrollFX),
  { ssr: false },
);
/** Do not download desktop animation engines on touch/reduced-motion devices. */
export function MotionFoundation() {
  const enabled = useMotionEnabled();
  return enabled ? (
    <>
      <SmoothScroll />
      <ScrollFX />
    </>
  ) : null;
}
