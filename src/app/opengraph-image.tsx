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
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 96px",
        // A still frame of the Clear Air light field.
        background: `radial-gradient(circle at 12% 0%, ${colors.blush}, transparent 55%), radial-gradient(circle at 92% 6%, ${colors.haze}, transparent 58%), radial-gradient(circle at 50% 120%, ${colors.peach}, transparent 60%), ${colors.air}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 24px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.75)",
          fontSize: 24,
          fontWeight: 600,
          color: colors.slate,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: colors.crimson,
          }}
        />
        {profile.heroEyebrow}
      </div>

      <p
        style={{
          margin: "36px 0 0",
          fontFamily: "Unbounded",
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -4,
          color: colors.ink,
          maxWidth: 1000,
        }}
      >
        {profile.name}
      </p>

      <p
        style={{
          margin: "32px 0 0",
          fontSize: 30,
          fontWeight: 500,
          color: colors.slate,
          maxWidth: 900,
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
