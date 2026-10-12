import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import {
  caseStudyRoutes,
  LocalContentRepository,
  readWithFallback,
} from "@/lib/content/repository";
import { loadContent } from "@/lib/content/load";
import { collectionNames } from "@/lib/content/webflow";
import { contentWith } from "../../support/content";

describe("content repository", () => {
  it("serves the local content and lists its case-study routes", async () => {
    expect(await new LocalContentRepository().read()).toBe(localContent);
    expect(caseStudyRoutes).toEqual(
      localContent.projects.filter((p) => p.caseStudy).map((p) => p.slug),
    );
    expect(caseStudyRoutes).toHaveLength(7);
  });

  it("returns validated content from a healthy source", async () => {
    const edited = contentWith((c) => {
      c.profile.tagline = "A new tagline.";
    });
    const result = await readWithFallback({ read: async () => edited });
    expect(result.profile.tagline).toBe("A new tagline.");
  });

  it("falls back to the local content as a whole on outages or bad data", async () => {
    const failed = vi.fn();
    const offline = {
      read: async () => {
        throw new Error("offline");
      },
    };
    expect(await readWithFallback(offline, failed)).toBe(localContent);
    expect(failed).toHaveBeenCalledWith(new Error("offline"));
    // Invalid data and unknown routes are rejected the same way.
    expect(
      await readWithFallback({
        read: async () => contentWith((c) => (c.projects = [])),
      }),
    ).toBe(localContent);
    expect(await readWithFallback(offline)).toBe(localContent);
  });
});

describe("loadContent", () => {
  const ids = JSON.stringify(
    Object.fromEntries(collectionNames.map((name) => [name, "a".repeat(24)])),
  );

  it("uses the local content unless the CMS is fully configured", async () => {
    vi.stubEnv("WEBFLOW_API_TOKEN", "");
    vi.stubEnv("WEBFLOW_COLLECTIONS", ids);
    expect(await loadContent()).toBe(localContent);
    vi.stubEnv("WEBFLOW_API_TOKEN", "token");
    vi.stubEnv("WEBFLOW_COLLECTIONS", "not json");
    expect(await loadContent()).toBe(localContent);
  });

  it("warns and keeps the local content when the CMS fails", async () => {
    vi.stubEnv("WEBFLOW_API_TOKEN", "token");
    vi.stubEnv("WEBFLOW_COLLECTIONS", ids);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 503 })),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await loadContent()).toBe(localContent);
    expect(warn).toHaveBeenCalledWith(
      "Webflow unavailable or invalid; using the local content.",
    );
  });
});
