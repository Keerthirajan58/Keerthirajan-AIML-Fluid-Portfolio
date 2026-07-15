import type { Metadata, Viewport } from "next";
import { Unbounded, Inter } from "next/font/google";
import { profile, contact } from "@/content/data";
import { getSiteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollFX } from "@/components/motion/ScrollFX";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  colorScheme: "light",
  themeColor: "#E23744",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The inline script below adds a "js" class pre-hydration; React must
      // not treat that as a mismatch (same pattern as theme-switcher scripts).
      suppressHydrationWarning
      className={`${unbounded.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/* Marks JS availability before first paint of body content, so the
            [data-reveal] hide-then-animate CSS only ever applies when the
            reveal animations can actually run. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <SmoothScroll />
        <ScrollFX />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-crimson focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
