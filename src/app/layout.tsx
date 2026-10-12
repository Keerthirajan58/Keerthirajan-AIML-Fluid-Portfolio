import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { profile, contact } from "@/content/data";
import { getSiteUrl } from "@/lib/site";
import { THEME_COLORS, themeScript } from "@/lib/themeMode";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionFoundation } from "@/components/motion/MotionFoundation";
import { Atmosphere } from "@/components/scene/Atmosphere";
import { RouteArrival } from "@/components/motion/RouteArrival";
import { AnchorGlide } from "@/components/motion/AnchorGlide";
import { TrainingMonitor } from "@/components/TrainingMonitor";
import { loadContent } from "@/content/load";
import "./globals.css";

// Unbounded sets the hero name (the LCP element), so it is preloaded too.
const unbounded = localFont({
  src: "../assets/fonts/Unbounded-Latin-Variable.woff2",
  variable: "--font-unbounded",
  display: "swap",
});

const inter = localFont({
  src: "../assets/fonts/Inter-Latin-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: profile.pageTitle,
    template: `%s | ${profile.name}`,
  },
  description: profile.tagline,
  keywords: [profile.name, ...profile.roles, "Portfolio"],
  authors: [{ name: profile.name, url: contact.social.linkedin }],
  openGraph: {
    title: profile.pageTitle,
    description: profile.tagline,
    siteName: profile.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.pageTitle,
    description: profile.tagline,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: THEME_COLORS.light,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await loadContent();
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${unbounded.variable} ${inter.variable} h-full antialiased`}
      // The theme script below may switch data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Applies a remembered dark theme before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <MotionFoundation />
        <AnchorGlide />
        <Atmosphere />
        <RouteArrival />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-sheet"
        >
          Skip to content
        </a>
        <SiteHeader contact={content.contact} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <TrainingMonitor />
      </body>
    </html>
  );
}
