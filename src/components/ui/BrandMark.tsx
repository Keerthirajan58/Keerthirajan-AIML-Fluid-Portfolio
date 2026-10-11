import type { SVGProps } from "react";

/* Glass bubble mark: the KS monogram (Unbounded ExtraBold outlines, so it
   never depends on a font loading) inside an iridescent soap-bubble orb with
   a crimson glint. `compact` swaps in a single K for very small sizes. */
const KS =
  "M19.50 40.27L15.07 40.27L15.07 24.52L19.92 24.52L19.92 36.43L18.66 35.40L27.04 24.52L32.16 24.52L19.50 40.27ZM26.85 40.27L22.61 32.90L26.20 30.01L32.39 40.27L26.85 40.27ZM31.58 35.11L31.58 35.11L36.54 35.11Q36.62 35.66 37.07 36.06Q37.53 36.47 38.30 36.69Q39.08 36.91 40.13 36.91L40.13 36.91Q41.58 36.91 42.39 36.58Q43.20 36.24 43.20 35.55L43.20 35.55Q43.20 35.07 42.73 34.76Q42.27 34.46 40.91 34.35L40.91 34.35L38.13 34.12Q34.73 33.87 33.21 32.64Q31.69 31.41 31.69 29.33L31.69 29.33Q31.69 27.63 32.67 26.49Q33.66 25.34 35.43 24.76Q37.19 24.17 39.58 24.17L39.58 24.17Q41.89 24.17 43.69 24.82Q45.48 25.47 46.55 26.66Q47.61 27.84 47.71 29.42L47.71 29.42L42.75 29.42Q42.67 28.96 42.28 28.61Q41.89 28.26 41.18 28.07Q40.47 27.88 39.48 27.88L39.48 27.88Q38.18 27.88 37.41 28.20Q36.64 28.51 36.64 29.14L36.64 29.14Q36.64 29.61 37.09 29.90Q37.55 30.20 38.76 30.30L38.76 30.30L41.81 30.55Q44.08 30.72 45.47 31.26Q46.87 31.79 47.50 32.70Q48.13 33.62 48.13 35.00L48.13 35.00Q48.13 36.68 47.12 37.95Q46.11 39.23 44.30 39.93Q42.48 40.63 40.05 40.63L40.05 40.63Q37.55 40.63 35.66 39.94Q33.77 39.25 32.70 38.00Q31.62 36.75 31.58 35.11Z";
const K =
  "M25.45 43.75L19.13 43.75L19.13 21.25L26.05 21.25L26.05 38.26L24.26 36.79L36.23 21.25L43.55 21.25L25.45 43.75ZM35.95 43.75L29.89 33.22L35.02 29.08L43.88 43.75L35.95 43.75Z";

export function BrandMark({
  idPrefix = "ks",
  compact = false,
  ...props
}: SVGProps<SVGSVGElement> & { idPrefix?: string; compact?: boolean }) {
  const fill = `${idPrefix}-fill`,
    rim = `${idPrefix}-rim`;
  return (
    <svg
      viewBox="0 0 64 64"
      width="48"
      height="48"
      aria-hidden="true"
      className="brand-mark"
      {...props}
    >
      <defs>
        <radialGradient id={fill} cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#fbeef2" />
          <stop offset="1" stopColor="#dbe6f8" />
        </radialGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb3c4" />
          <stop offset="0.35" stopColor="#c6d6ff" />
          <stop offset="0.7" stopColor="#c4efdd" />
          <stop offset="1" stopColor="#ffcfa8" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="33.5" r="29" fill="rgb(15 16 19 / 0.08)" />
      <circle cx="32" cy="32" r="29" fill={`url(#${fill})`} />
      <g className="brand-rim">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={`url(#${rim})`}
          strokeWidth="3.2"
        />
      </g>
      <ellipse
        cx="21"
        cy="15.5"
        rx="9"
        ry="4.4"
        fill="#fff"
        opacity="0.92"
        transform="rotate(-32 21 15.5)"
      />
      <path
        d="M13.5 40.5a19 19 0 0 0 8.5 8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path d={compact ? K : KS} fill="#0f1013" />
      <circle
        className="brand-glint"
        cx={compact ? 48 : 47.5}
        cy={compact ? 47 : 46.5}
        r={compact ? 4.6 : 3.3}
        fill="#df212f"
      />
    </svg>
  );
}
