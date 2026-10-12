/**
 * Safe to deploy: no secrets or personal data in the source, environment
 * variables used only where intended, external links that can't hijack the
 * page, no injected HTML, and security headers on every response.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { securityHeaders } from "@/lib/security";
import { cmsImageHosts } from "@/lib/content/hosts";
import { localContent } from "@/content";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
function walk(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? walk(path) : [path];
  });
}
const source = walk("src").filter((f) => /\.(ts|tsx|css)$/.test(f));
const configs = [
  "next.config.ts",
  "playwright.config.ts",
  "vitest.config.mts",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "package.json",
  ".env.example",
  ".github/workflows/verify.yml",
];

describe("secrets", () => {
  it("never appear in source, config or tests", () => {
    const patterns = [
      /AKIA[0-9A-Z]{16}/, // AWS access key
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /\bgh[pousr]_[A-Za-z0-9]{30,}/, // GitHub token
      /\bsk-[A-Za-z0-9]{20,}/, // API secret keys
      /\bxox[abpr]-[A-Za-z0-9-]{10,}/, // Slack token
      /Bearer [A-Za-z0-9._-]{20,}/,
    ];
    for (const file of [...source, ...configs, ...walk("tests")]) {
      const text = read(file);
      for (const pattern of patterns) expect(text, file).not.toMatch(pattern);
    }
  });

  it("are never committed in the example environment", () => {
    const values = read(".env.example")
      .split("\n")
      .filter((line) => /^[A-Z_]+=/.test(line))
      .map((line) => line.split("=") as [string, string]);
    for (const [key, value] of values) {
      if (key === "NEXT_PUBLIC_SITE_URL") expect(value).toMatch(/^https:\/\//);
      else expect(value, key).toBe("");
    }
  });

  it("are read only from known environment variables", () => {
    const allowed = new Set([
      "NEXT_PUBLIC_SITE_URL",
      "VERCEL_PROJECT_PRODUCTION_URL",
      "VERCEL_URL",
      "NEXT_PUBLIC_FORMSPREE_FORM_ID",
      "WEBFLOW_API_TOKEN",
      "WEBFLOW_COLLECTIONS",
    ]);
    const used = new Set(
      source.flatMap((f) =>
        [...read(f).matchAll(/process\.env\.([A-Z_]+)/g)].map((m) => m[1]),
      ),
    );
    expect([...used].filter((v) => !allowed.has(v))).toEqual([]);
    // The CMS token is only ever read on the server.
    const tokenReaders = source.filter((f) =>
      read(f).includes("WEBFLOW_API_TOKEN"),
    );
    expect(tokenReaders).toEqual(["src/lib/content/load.ts"]);
  });
});

describe("personal data", () => {
  it("keeps the owner's email addresses in the contact content only", () => {
    const { emails } = localContent.contact;
    expect(emails.length).toBeGreaterThan(0);
    for (const file of source.filter((f) => f !== "src/content/contact.ts"))
      for (const email of emails) expect(read(file), file).not.toContain(email);
  });

  it("publishes no phone numbers", () => {
    for (const file of source)
      expect(read(file), file).not.toMatch(/href=["'`]tel:|\+1[\s-]?\(?\d{3}/);
  });
});

describe("markup", () => {
  it("opens external links in new tabs without handing over the page", () => {
    for (const file of source.filter((f) => f.endsWith(".tsx"))) {
      const text = read(file);
      const blank = text.match(/target="_blank"/g)?.length ?? 0;
      const safe = text.match(/rel="noopener noreferrer"/g)?.length ?? 0;
      expect(safe, file).toBe(blank);
    }
  });

  it("injects HTML only for the theme script, and never evaluates strings", () => {
    const injected = source.filter((f) =>
      read(f).includes("dangerouslySetInnerHTML"),
    );
    expect(injected).toEqual(["src/app/layout.tsx"]);
    expect(read("src/app/layout.tsx")).toMatch(
      /dangerouslySetInnerHTML=\{\{ __html: themeScript \}\}/,
    );
    for (const file of source)
      expect(read(file), file).not.toMatch(/\beval\(|new Function\(/);
  });
});

describe("response headers", () => {
  it("are sent on every route", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(await nextConfig.headers!()).toEqual([
      { source: "/:path*", headers: securityHeaders },
    ]);
  });

  it("block framing, sniffing, plugins and stray form posts", () => {
    const header = (key: string) =>
      securityHeaders.find((h) => h.key === key)?.value;
    const csp = header("Content-Security-Policy")!;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self' https://formspree.io");
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("X-Content-Type-Options")).toBe("nosniff");
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("Permissions-Policy")).toContain("camera=()");
    expect(header("Strict-Transport-Security")).toMatch(/max-age=\d{8}/);
  });

  it("load remote images over https from the CMS CDN only", () => {
    expect(nextConfig.images?.remotePatterns).toEqual(
      cmsImageHosts.map((hostname) => ({ protocol: "https", hostname })),
    );
  });
});

describe("dependencies", () => {
  it("ship only what the site needs", () => {
    const pkg = JSON.parse(read("package.json"));
    expect(Object.keys(pkg.dependencies).sort()).toEqual(
      ["lenis", "motion", "next", "react", "react-dom", "zod"].sort(),
    );
    expect(pkg.private).toBe(true);
    // The old motion package and audit tooling stay out.
    expect(pkg.dependencies).not.toHaveProperty("framer-motion");
    expect(pkg.devDependencies).not.toHaveProperty("lighthouse");
  });
});
