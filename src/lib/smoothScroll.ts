/**
 * One place that knows how to glide to a section. Desktop registers its Lenis
 * instance here; everywhere else (touch, no Lenis yet) falls back to native
 * smooth scrolling. Reduced motion always jumps.
 */
type Scroller = {
  scrollTo: (
    target: HTMLElement,
    options: {
      offset: number;
      duration: number;
      easing: (t: number) => number;
      onComplete?: () => void;
    },
  ) => void;
};

let active: Scroller | null = null;

export function registerScroller(scroller: Scroller | null) {
  active = scroller;
}

/** Clearance for the floating header pill. */
export const HEADER_OFFSET = 88;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function scrollToSection(id: string, { updateHash = true } = {}) {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settle = () => target.focus({ preventScroll: true });
  if (updateHash) history.pushState(null, "", "#" + id);
  if (active && !reduce) {
    active.scrollTo(target, {
      offset: -HEADER_OFFSET,
      duration: 1.15,
      easing: easeInOutCubic,
      onComplete: settle,
    });
  } else {
    const top =
      target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    settle();
  }
  return true;
}
