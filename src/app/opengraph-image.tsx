import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content/data";
import { colors } from "@/lib/theme";

export const alt = profile.pageTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const unbounded = await readFile(
    join(process.cwd(), "src/assets/fonts/Unbounded-ExtraBold.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 96px",
        background: colors.paper,
        position: "relative",
      }}
    >
      {/* Static material bands echo the graphite / copper atmosphere. */}
      <svg
        width="420"
        height="420"
        viewBox="0 0 400 400"
        style={{ position: "absolute", right: 40, top: 105, opacity: 0.9 }}
      >
        <g transform="rotate(-25 200 200)" fill={colors.wine} opacity="0.1">
          <rect x="110" y="-80" width="50" height="540" rx="25" />
          <rect x="220" y="-80" width="50" height="540" rx="25" />
          <rect x="330" y="-80" width="50" height="540" rx="25" />
        </g>
      </svg>

      <p
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.crimson,
        }}
      >
        {profile.heroEyebrow}
      </p>

      <p
        style={{
          margin: "20px 0 0",
          fontFamily: "Unbounded",
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.05,
          color: colors.ink,
          maxWidth: 820,
        }}
      >
        {profile.name}
      </p>

      <p
        style={{
          margin: "28px 0 0",
          fontSize: 32,
          fontWeight: 500,
          color: colors.inkMuted,
          maxWidth: 760,
        }}
      >
        {profile.roles.join("  ·  ")}
      </p>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Unbounded",
          data: unbounded,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
