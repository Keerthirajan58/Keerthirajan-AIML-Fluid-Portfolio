/**
 * JS-readable mirror of the design tokens defined in `src/app/globals.css`.
 *
 * Tailwind v4 tokens live in CSS (`@theme`) and have no built-in way to be
 * read back out in JS. This file exists for consumers that need raw values
 * outside of className strings — e.g. the Phase 4 node-scatter signature
 * element, which draws to canvas/SVG and needs real hex/pixel values, not
 * CSS custom properties.
 *
 * Keep this in sync with `src/app/globals.css` by hand — there is no
 * automated link between the two.
 */

export const colors = {
  paper: "#0B1728",
  surface: "#172B40",
  ink: "#EEF5F8",
  inkMuted: "#B0C0CE",
  crimson: "#A9DDE7",
  wine: "#B5D7E7",
} as const;

export const fonts = {
  display: "var(--font-instrument)",
  body: "var(--font-inter)",
} as const;
