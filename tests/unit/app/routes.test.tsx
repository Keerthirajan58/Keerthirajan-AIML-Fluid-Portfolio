/**
 * The App Router entry points, rendered the way Next calls them.
 */
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const og = vi.hoisted(() => ({ calls: [] as unknown[][] }));
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(...args: unknown[]) {
      og.calls.push(args);
    }
  },
}));
vi.mock("next/font/local", () => ({
  default: (options: { variable: string }) => ({ variable: options.variable }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import Home from "@/app/page";
import ProjectPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "@/app/projects/[slug]/page";
import RootLayout, { metadata, viewport } from "@/app/layout";
import OpenGraphImage, { alt, contentType, size } from "@/app/opengraph-image";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { localContent } from "@/content";
import { homeSections } from "@/content/site";
import { caseStudyRoutes } from "@/lib/content/repository";
import { THEME_COLORS } from "@/lib/themeMode";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.stubEnv("WEBFLOW_API_TOKEN", "");
  og.calls = [];
});

describe("home page", () => {
  it("renders every home section in order", async () => {
    render(await Home());
    const ids = Array.from(document.querySelectorAll("section[id]"))
      .map((s) => s.id)
      .filter((id) => homeSections.some((s) => s.id === id));
    expect(ids).toEqual(homeSections.map((s) => s.id));
  });
});

describe("case-study route", () => {
  it("pre-renders one page per case study", () => {
    expect(generateStaticParams()).toEqual(
      caseStudyRoutes.map((slug) => ({ slug })),
    );
    expect(dynamicParams).toBe(true);
  });

  it("titles each page and shares its cover", async () => {
    expect(await generateMetadata(params("pitchpulse"))).toEqual({
      title: "PitchPulse",
      description: localContent.projects.find((p) => p.slug === "pitchpulse")!
        .description,
      openGraph: {
        title: "PitchPulse",
        description: expect.any(String),
        images: ["/images/projects/pitchpulse/cover.jpg"],
      },
    });
    // A project without a page keeps its title but has no share image.
    const moodbites = await generateMetadata(params("moodbites"));
    expect(moodbites.openGraph).not.toHaveProperty("images");
    expect(await generateMetadata(params("missing"))).toEqual({});
  });

  it("renders a case study and 404s anything else", async () => {
    render(await ProjectPage(params("face-cloaking")));
    expect(
      screen.getByRole("heading", { level: 1, name: "Face Cloaking" }),
    ).toBeVisible();
    await expect(ProjectPage(params("moodbites"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    await expect(ProjectPage(params("missing"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});

describe("root layout", () => {
  it("sets the title, description and share cards", () => {
    expect(metadata.title).toEqual({
      default: "Keerthirajan · AI, end to end",
      template: "%s · Keerthirajan",
    });
    expect(metadata.description).toBe(localContent.profile.tagline);
    expect(metadata.openGraph).toMatchObject({
      title: localContent.profile.pageTitle,
      siteName: localContent.profile.name,
    });
    expect(metadata.authors).toEqual([
      {
        name: localContent.profile.name,
        url: "https://www.linkedin.com/in/keerthirajans58/",
      },
    ]);
    expect(viewport.themeColor).toBe(THEME_COLORS.light);
  });

  it("wraps every page in the site chrome, with the theme set before paint", async () => {
    const page = (await RootLayout({
      children: <p>Page body</p>,
    })) as ReactElement<{ lang: string; children: ReactNode }>;
    expect(page.type).toBe("html");
    expect(page.props.lang).toBe("en");
    const html = renderToStaticMarkup(page);
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('localStorage.getItem("ks-theme")');
    expect(html).toContain('<main id="main" tabindex="-1"');
    expect(html).toContain("Page body");
    expect(html).toContain("Skip to content");
    expect(html).toContain("All rights reserved.");
  });
});

describe("share image", () => {
  it("draws the name and roles on a still of the light field", async () => {
    expect(alt).toBe(localContent.profile.pageTitle);
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    await OpenGraphImage();
    const [element, options] = og.calls[0] as [
      ReactElement,
      { width: number; fonts: { name: string; data: Buffer }[] },
    ];
    const html = renderToStaticMarkup(element);
    const escaped = (text: string) => text.replace(/&/g, "&amp;");
    expect(html).toContain(escaped(localContent.profile.name));
    expect(html).toContain(escaped(localContent.profile.heroEyebrow));
    expect(html).toContain(escaped(localContent.profile.roles.join("  ·  ")));
    expect(options.width).toBe(1200);
    expect(options.fonts[0].name).toBe("Unbounded");
    expect(options.fonts[0].data.length).toBeGreaterThan(1000);
  });
});

describe("sitemap and robots", () => {
  it("lists the home page and every case study on the canonical domain", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    const entries = sitemap();
    expect(entries.map((e) => e.url)).toEqual([
      "https://example.com",
      ...caseStudyRoutes.map((slug) => `https://example.com/projects/${slug}`),
    ]);
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://example.com/sitemap.xml",
    });
  });
});
