"use client";
import { useState, type ReactNode } from "react";
import { LazyMotion, m } from "motion/react";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
const loadFeatures = () =>
  import("./motionFeatures").then((module) => module.default);
/** Only the contents move, by at most 3px. The actual hit target never moves. */
export function MagneticLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const enabled = useMotionEnabled(),
    [offset, setOffset] = useState({ x: 0, y: 0 });
  return (
    <a
      href={href}
      className="button button-primary magnetic-link"
      onPointerMove={(e) => {
        if (!enabled) return;
        const box = e.currentTarget.getBoundingClientRect();
        setOffset({
          x: Math.max(
            -3,
            Math.min(3, (e.clientX - box.left - box.width / 2) * 0.08),
          ),
          y: Math.max(
            -3,
            Math.min(3, (e.clientY - box.top - box.height / 2) * 0.08),
          ),
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {enabled ? (
        <LazyMotion features={loadFeatures} strict>
          <m.span
            className="magnetic-content"
            animate={offset}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 25,
              mass: 0.6,
            }}
          >
            {children}
          </m.span>
        </LazyMotion>
      ) : (
        <span className="magnetic-content">{children}</span>
      )}
    </a>
  );
}
