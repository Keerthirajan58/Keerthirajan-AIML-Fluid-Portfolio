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
    (
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
        {/* Echo of the hero node-cluster motif — a few static crimson/wine
            dots with connecting lines, kept simple for satori's renderer. */}
        <svg
          width="420"
          height="420"
          viewBox="0 0 400 400"
          style={{ position: "absolute", right: 40, top: 105, opacity: 0.9 }}
        >
          <g stroke={colors.crimson} strokeOpacity="0.3" strokeWidth="2">
            <line x1="200" y1="200" x2="96" y2="120" />
            <line x1="200" y1="200" x2="312" y2="104" />
            <line x1="200" y1="200" x2="328" y2="232" />
            <line x1="200" y1="200" x2="232" y2="320" />
            <line x1="200" y1="200" x2="84" y2="268" />
          </g>
          <circle cx="200" cy="200" r="14" fill={colors.crimson} />
          <circle cx="96" cy="120" r="9" fill={colors.wine} />
          <circle cx="312" cy="104" r="9" fill={colors.wine} />
          <circle cx="328" cy="232" r="9" fill={colors.wine} />
          <circle cx="232" cy="320" r="9" fill={colors.wine} />
          <circle cx="84" cy="268" r="9" fill={colors.wine} />
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
      </div>
    ),
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
