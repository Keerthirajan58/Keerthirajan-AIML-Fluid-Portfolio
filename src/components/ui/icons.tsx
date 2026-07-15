/** Minimal inline SVG icon set. All inherit `currentColor` and take a class. */
import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
  ...props,
});

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.85 9.73.5.1.68-.22.68-.49l-.01-1.9c-2.79.62-3.38-1.22-3.38-1.22-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.23-.26-4.57-1.14-4.57-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M6.94 5A1.94 1.94 0 1 1 3.06 5a1.94 1.94 0 0 1 3.88 0ZM3.32 8.5h3.24V21H3.32V8.5Zm5.46 0h3.1v1.7h.05c.43-.82 1.49-1.7 3.06-1.7 3.27 0 3.87 2.16 3.87 4.96V21h-3.24v-5.55c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92V21H8.78V8.5Z" />
    </svg>
  );
}

export function LeetCodeIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M13.48 2.5a1.3 1.3 0 0 1 .12 1.72l-.12.13-3.9 3.86 5.1 5.06a1.3 1.3 0 0 1-1.7 1.96l-.13-.11-6.03-5.98a1.3 1.3 0 0 1-.12-1.72l.12-.14 4.83-4.79a1.3 1.3 0 0 1 1.83.02Zm4.7 12.02a1.3 1.3 0 0 1 .12 2.58l-.13.01h-5.35a1.3 1.3 0 0 1-.12-2.59l.13-.01h5.35Z" />
      <path d="M11.35 18.08a1.3 1.3 0 0 0 .1 1.72l.05.05 2.02 1.9a1.3 1.3 0 0 0 1.82-1.84l-.1-.1-2.01-1.9a1.3 1.3 0 0 0-1.88.17Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M4 5c0-.55.45-1 1-1h2.2c.46 0 .86.31.97.76l.9 3.6a1 1 0 0 1-.28.95l-1.6 1.6a13 13 0 0 0 5.9 5.9l1.6-1.6a1 1 0 0 1 .95-.28l3.6.9c.45.11.76.51.76.97V19c0 .55-.45 1-1 1A16 16 0 0 1 4 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
