"use client";
import { useLayoutEffect, type RefObject } from "react";

type ChipOptions = {
  /** Tag of the chip elements (direct children of the group). */
  chip?: string;
  /** Finds the chosen chip; defaults to the pressed button. */
  chosen?: (group: HTMLElement) => HTMLElement | null;
};

const pressedButton = (group: HTMLElement) =>
  group.querySelector<HTMLElement>(':scope > button[aria-pressed="true"]');

/**
 * Two indicators for a group of chips, positioned through CSS variables on
 * the group so the stylesheet can animate them:
 *
 * - the ink pill (`--ix --iy --iw --ih`) marks the chosen chip and moves only
 *   when the choice changes;
 * - the glass lens (`--lx --ly --lw --lh`) follows the hovered (or
 *   keyboard-focused) chip, like the header's liquid lens, and rests on the
 *   chosen chip otherwise.
 */
export function useChipIndicators(
  ref: RefObject<HTMLElement | null>,
  selected: unknown,
  {
    chip: chipTag = "button",
    chosen: findChosen = pressedButton,
  }: ChipOptions = {},
) {
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    let hovered: HTMLElement | null = null;
    const write = (prefix: "i" | "l", chip: HTMLElement) => {
      group.style.setProperty(`--${prefix}x`, `${chip.offsetLeft}px`);
      group.style.setProperty(`--${prefix}y`, `${chip.offsetTop}px`);
      group.style.setProperty(`--${prefix}w`, `${chip.offsetWidth}px`);
      group.style.setProperty(`--${prefix}h`, `${chip.offsetHeight}px`);
    };
    const place = () => {
      const chosen = findChosen(group);
      if (!chosen) return;
      write("i", chosen);
      write("l", hovered ?? chosen);
      if (!group.dataset.ready)
        requestAnimationFrame(() => {
          group.dataset.ready = "true";
        });
    };
    const chipFrom = (target: EventTarget | null) => {
      const chip = target instanceof Element ? target.closest(chipTag) : null;
      return chip && chip.parentElement === group
        ? (chip as HTMLElement)
        : null;
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const chip = chipFrom(e.target);
      if (chip && chip !== hovered) {
        hovered = chip;
        place();
      }
    };
    const rest = () => {
      if (!hovered) return;
      hovered = null;
      place();
    };
    const keyboardFocus = (chip: HTMLElement) => {
      try {
        return chip.matches(":focus-visible");
      } catch {
        return true; // Engines without :focus-visible: treat focus as visible.
      }
    };
    const focus = (e: FocusEvent) => {
      const chip = chipFrom(e.target);
      if (chip && keyboardFocus(chip)) {
        hovered = chip;
        place();
      }
    };
    place();
    group.addEventListener("pointerover", over);
    group.addEventListener("pointerleave", rest);
    group.addEventListener("focusin", focus);
    group.addEventListener("focusout", rest);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(group);
    return () => {
      group.removeEventListener("pointerover", over);
      group.removeEventListener("pointerleave", rest);
      group.removeEventListener("focusin", focus);
      group.removeEventListener("focusout", rest);
      observer?.disconnect();
    };
  }, [ref, selected, chipTag, findChosen]);
}
