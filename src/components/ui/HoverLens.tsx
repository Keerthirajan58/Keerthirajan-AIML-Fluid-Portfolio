"use client";
import { useEffect, useRef } from "react";

/**
 * The work filters' glass lens for any group of buttons and chips. Nothing
 * shows by default; when a fine pointer (or keyboard focus) reaches one of
 * `items` inside the lens's parent, the lens appears on it, glides to the
 * next one, and fades away once the pointer leaves. A short grace period
 * keeps it gliding across the gaps between neighbours. The item under the
 * lens is marked `data-lensed`, which magnifies its `.lens-content` a little.
 * The parent must be positioned (`position: relative`).
 */
export function HoverLens({ items }: { items: string }) {
  const lens = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // The lens always renders inside the group it serves.
    const el = lens.current!;
    const group = el.parentElement!;
    let current: HTMLElement | null = null,
      frame = 0,
      leave = 0;
    const place = (item: HTMLElement) => {
      // Positions are from the parent's inner (padding) edge, in its own
      // unscaled units, even while a scroll animation scales the parent.
      const origin = group.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      const k =
        origin.width && group.offsetWidth
          ? origin.width / group.offsetWidth
          : 1;
      const x = (box.left - origin.left) / k - group.clientLeft;
      const y = (box.top - origin.top) / k - group.clientTop;
      el.style.setProperty("--hx", `${x}px`);
      el.style.setProperty("--hy", `${y}px`);
      el.style.setProperty("--hw", `${box.width / k}px`);
      el.style.setProperty("--hh", `${box.height / k}px`);
      // One radius (the first corner's) so the stylesheet can grow it.
      const radius = getComputedStyle(item).borderRadius.split(/[\s/]/)[0];
      el.style.setProperty("--hr", radius || "0px");
    };
    const show = (item: HTMLElement) => {
      window.clearTimeout(leave);
      const fresh = !el.hasAttribute("data-on");
      current?.removeAttribute("data-lensed");
      current = item;
      item.setAttribute("data-lensed", "");
      // Arriving from outside: appear in place rather than glide in.
      if (fresh) el.setAttribute("data-snap", "");
      place(item);
      el.setAttribute("data-on", "");
      if (fresh)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => el.removeAttribute("data-snap")),
        );
    };
    const hide = () => {
      window.clearTimeout(leave);
      leave = window.setTimeout(() => {
        current?.removeAttribute("data-lensed");
        current = null;
        el.removeAttribute("data-on");
      }, 140);
    };
    const itemFrom = (target: EventTarget | null) => {
      const item =
        target instanceof Element ? target.closest<HTMLElement>(items) : null;
      return item && group.contains(item) ? item : null;
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const item = itemFrom(e.target);
      if (!item) hide();
      else if (item !== current) show(item);
      else window.clearTimeout(leave);
    };
    // Buttons that drift a little (magnetic, hover lift) keep the lens on them.
    const settle = (e: TransitionEvent) => {
      if (current && e.target === current) place(current);
    };
    const follow = () => {
      if (!current || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (current) place(current);
      });
    };
    const focus = (e: FocusEvent) => {
      const item = itemFrom(e.target);
      if (!item) return;
      try {
        if (!(e.target as Element).matches(":focus-visible")) return;
      } catch {
        /* Engines without :focus-visible: treat focus as visible. */
      }
      show(item);
    };
    group.addEventListener("pointerover", over);
    group.addEventListener("pointermove", follow);
    group.addEventListener("transitionend", settle);
    group.addEventListener("pointerleave", hide);
    group.addEventListener("focusin", focus);
    group.addEventListener("focusout", hide);
    return () => {
      window.clearTimeout(leave);
      cancelAnimationFrame(frame);
      current?.removeAttribute("data-lensed");
      group.removeEventListener("pointerover", over);
      group.removeEventListener("pointermove", follow);
      group.removeEventListener("transitionend", settle);
      group.removeEventListener("pointerleave", hide);
      group.removeEventListener("focusin", focus);
      group.removeEventListener("focusout", hide);
    };
  }, [items]);
  return <span ref={lens} className="hover-lens" aria-hidden="true" />;
}
