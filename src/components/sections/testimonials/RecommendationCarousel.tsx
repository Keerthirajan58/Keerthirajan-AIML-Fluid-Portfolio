"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/content/types";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
import { wrapIndex } from "@/lib/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
/** The slide a rail is scrolled to (0 while it has no width, e.g. hidden). */
const slideAt = (el: HTMLElement) =>
  el.clientWidth ? Math.round(el.scrollLeft / el.clientWidth) : 0;

export function RecommendationCarousel({ items }: { items: Testimonial[] }) {
  const enabled = useMotionEnabled(),
    rail = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; left: number } | null>(null);
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [interacting, setInteracting] = useState(false);
  const go = (index: number) => {
    const el = rail.current!;
    const next = wrapIndex(index, items.length);
    const child = el.children[next] as HTMLElement;
    setActive(next);
    el.scrollTo({
      left: child.offsetLeft,
      behavior: enabled ? "smooth" : "instant",
    });
  };
  useEffect(() => {
    if (!enabled || paused || interacting || items.length < 2) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const el = rail.current!;
      const next = wrapIndex(slideAt(el) + 1, items.length);
      const child = el.children[next] as HTMLElement;
      el.scrollTo({
        left: child.offsetLeft,
        behavior: "smooth",
      });
    }, 12000);
    return () => clearInterval(timer);
  }, [enabled, paused, interacting, items.length]);
  if (!items.length) return null;
  return (
    <div
      className="recommendations"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={(e) => {
        if (!(
          e.target instanceof Element &&
          e.target.closest("[data-playback-control]")
        ))
          setPaused(true);
      }}
    >
      <div
        className="testimonial-rail"
        role="region"
        aria-label="Recommendations"
        tabIndex={0}
        ref={rail}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            setPaused(true);
            go(active + (e.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onScroll={({ currentTarget: el }) =>
          setActive(wrapIndex(slideAt(el), items.length))
        }
        onPointerDown={(e) => {
          setPaused(true);
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
          e.currentTarget.dataset.dragging = "true";
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            e.currentTarget.scrollLeft =
              drag.current.left + drag.current.x - e.clientX;
        }}
        onPointerUp={(e) => {
          drag.current = null;
          delete e.currentTarget.dataset.dragging;
          go(active);
        }}
        onPointerCancel={(e) => {
          drag.current = null;
          delete e.currentTarget.dataset.dragging;
        }}
      >
        {items.map((t) => (
          <figure className="testimonial" key={t.name}>
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <Image src={t.image} alt={t.name} width={64} height={64} />
              <div>
                <strong>{t.name}</strong>
                <span>{t.title}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="carousel-controls">
        <span aria-live="polite" className="carousel-count">
          {active + 1} / {items.length}
        </span>
        <div className="carousel-dots" aria-label="Choose recommendation">
          {items.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Recommendation by ${item.name}`}
              aria-pressed={active === index}
              onClick={() => {
                setPaused(true);
                go(index);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        {enabled && (
          <button
            data-playback-control
            className="playback-button"
            aria-pressed={paused}
            onClick={() => setPaused((v) => !v)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="currentColor"
            >
              {paused ? (
                <path d="m4 2 10 6-10 6Z" />
              ) : (
                <path d="M3 2h3v12H3zm7 0h3v12h-3Z" />
              )}
            </svg>
            {paused ? "Play" : "Pause"}
          </button>
        )}
        <button
          className="icon-button"
          aria-label="Previous recommendation"
          onClick={() => {
            setPaused(true);
            go(active - 1);
          }}
        >
          <ArrowLeftIcon />
        </button>
        <button
          className="icon-button"
          aria-label="Next recommendation"
          onClick={() => {
            setPaused(true);
            go(active + 1);
          }}
        >
          <ArrowLeftIcon className="arrow-forward" />
        </button>
      </div>
    </div>
  );
}
