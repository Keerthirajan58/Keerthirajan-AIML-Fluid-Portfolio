"use client";
import { useEffect, useLayoutEffect, type RefObject } from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Positions a `.filter-lens` pill under the `[aria-pressed="true"]` button of
 * a button group via CSS variables, so the CSS can spring it between choices.
 */
export function useActiveLens(
  ref: RefObject<HTMLElement | null>,
  selected: unknown,
) {
  useIsoLayoutEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const place = () => {
      const active = bar.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!active) return;
      bar.style.setProperty("--fx", `${active.offsetLeft}px`);
      bar.style.setProperty("--fy", `${active.offsetTop}px`);
      bar.style.setProperty("--fw", `${active.offsetWidth}px`);
      bar.style.setProperty("--fh", `${active.offsetHeight}px`);
      if (!bar.dataset.lensReady)
        requestAnimationFrame(() => {
          bar.dataset.lensReady = "true";
        });
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [ref, selected]);
}
