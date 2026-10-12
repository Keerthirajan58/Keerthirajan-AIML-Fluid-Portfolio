import { describe, expect, it, vi } from "vitest";
import { getAnchorTarget, isSafeLink, wrapIndex } from "@/lib/navigation";
import { getSiteUrl } from "@/lib/site";

describe("same-page anchors", () => {
  it("accepts only anchors on the current page", () => {
    const here = "https://example.com/";
    expect(getAnchorTarget("/#about", here)).toBe("about");
    expect(getAnchorTarget("#caf%C3%A9", here)).toBe("café");
    expect(
      getAnchorTarget("/#about", "https://example.com/projects/x"),
    ).toBeNull();
    expect(getAnchorTarget("https://evil.com/#about", here)).toBeNull();
    expect(getAnchorTarget("https://example.com/?x=1#about", here)).toBeNull();
    expect(getAnchorTarget("/", here)).toBeNull();
    expect(getAnchorTarget("#%zz", here)).toBeNull();
  });
});

describe("safe links", () => {
  it("allows site paths, https and mailto only", () => {
    for (const ok of [
      "/",
      "/projects/x",
      "https://example.com",
      "mailto:a@example.com",
    ])
      expect(isSafeLink(ok), ok).toBe(true);
    for (const bad of [
      "//evil.com",
      "http://example.com",
      "javascript:alert(1)",
      "data:text/html,x",
      "mailto:nobody",
      "https://exa mple.com",
      "",
    ])
      expect(isSafeLink(bad), bad).toBe(false);
  });
});

describe("index wrapping", () => {
  it("wraps both ways and survives empty lists", () => {
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(9, 4)).toBe(1);
    expect(wrapIndex(2, 0)).toBe(0);
  });
});

describe("site URL", () => {
  it("prefers the explicit domain, then Vercel's stable production URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(getSiteUrl()).toBe("https://example.com");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "portfolio.vercel.app");
    expect(getSiteUrl()).toBe("https://portfolio.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");
    expect(getSiteUrl()).toBe("https://preview-123.vercel.app");
    vi.stubEnv("VERCEL_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
