/**
 * JS-readable mirror of the Clear Air tokens in `src/styles/foundation/tokens.css` (`@theme`).
 * Used where CSS custom properties are unavailable: the OG image, the
 * viewport theme colour, and generated icons. Keep in sync by hand.
 */

export const colors = {
  air: "#F1F2F4",
  sheet: "#FFFFFF",
  panel: "#F5F6F8",
  line: "#E5E7EB",
  ink: "#0F1013",
  slate: "#5B616B",
  crimson: "#DF212F",
  blush: "#F6CFCB",
  haze: "#D6E2F3",
  peach: "#FFE4D6",
} as const;

export const fonts = {
  display: "var(--font-unbounded)",
  body: "var(--font-inter)",
} as const;
