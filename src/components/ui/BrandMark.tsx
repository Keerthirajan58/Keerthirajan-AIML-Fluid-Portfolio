import type { SVGProps } from "react";

/** Original KS ligature: an open K flowing into an angular S. */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="48"
      height="48"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        className="brand-orbit"
        d="M44 5H20L5 20v24l15 15h24l15-15V20L44 5Z"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".4"
      />
      <path
        d="M19 18v28m0-14 14-14m-14 14 14 14m14-28H36l-8 8 19 12-8 8H28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <circle
        className="brand-point"
        cx="54"
        cy="10"
        r="4"
        fill="currentColor"
      />
    </svg>
  );
}
