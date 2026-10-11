"use client";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
const SilkScene = dynamic(() => import("./SilkScene"), { ssr: false });
class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function Atmosphere() {
  const enabled = useMotionEnabled(),
    path = usePathname();
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-fallback" />
      {enabled && path === "/" && (
        <CanvasBoundary>
          <SilkScene />
        </CanvasBoundary>
      )}
    </div>
  );
}
