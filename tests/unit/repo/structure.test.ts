/**
 * The repository's shape: only portfolio files are tracked, folders follow
 * one convention, every module is reachable, layers only depend downwards,
 * and every asset and stylesheet is in use.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { homeSections } from "@/content/site";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** Files under a folder, relative to the repo root. */
function walk(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (name === ".DS_Store") return [];
    return statSync(join(root, path)).isDirectory() ? walk(path) : [path];
  });
}

const trackedFiles = (() => {
  try {
    return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return null; // Not a git checkout (for example an exported tarball).
  }
})();

const sourceFiles = walk("src").filter((f) => /\.(ts|tsx)$/.test(f));

/** Every `@/…` or relative import in a source file, resolved to a path. */
function importsOf(file: string): string[] {
  const text = read(file);
  const specifiers = [
    ...text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g),
  ].map((m) => m[1]);
  return specifiers.flatMap((spec) => {
    let base: string;
    if (spec.startsWith("@/")) base = join("src", spec.slice(2));
    else if (spec.startsWith("."))
      base = relative(root, resolve(root, dirname(file), spec));
    else return [];
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      join(base, "index.ts"),
      join(base, "index.tsx"),
    ];
    return candidates.filter((c) => sourceFiles.includes(c)).slice(0, 1);
  });
}

describe("tracked files", () => {
  it.runIf(trackedFiles)("contain no local helper or generated files", () => {
    // Only README.md and THIRD_PARTY_NOTICES.md sit at the top level as
    // Markdown, and the only top-level dot folder is .github.
    const forbidden =
      /^(helper|docs|legacy|scripts|coverage|test-results|playwright-report|node_modules)\/|^\.(?!github\/|env\.example$|gitignore$|prettierignore$|prettierrc$)|^(?!README\.md$|THIRD_PARTY_NOTICES\.md$)[^/]+\.md$|(^|\/)\.DS_Store$|\.log$|tsconfig\.tsbuildinfo$|^next-env\.d\.ts$/;
    expect(trackedFiles!.filter((f) => forbidden.test(f))).toEqual([]);
  });

  it.runIf(trackedFiles)(
    "keep the top level to the portfolio and its tooling",
    () => {
      const top = [
        ...new Set(trackedFiles!.map((f) => f.split("/")[0])),
      ].sort();
      expect(top).toEqual(
        [
          ".env.example",
          ".github",
          ".gitignore",
          ".prettierignore",
          ".prettierrc",
          "LICENSE",
          "README.md",
          "THIRD_PARTY_NOTICES.md",
          "eslint.config.mjs",
          "next.config.ts",
          "package-lock.json",
          "package.json",
          "playwright.config.ts",
          "postcss.config.mjs",
          "public",
          "src",
          "tests",
          "tsconfig.json",
          "vitest.config.mts",
        ].sort(),
      );
    },
  );

  it("ignores secrets and build output", () => {
    const ignore = read(".gitignore").split("\n");
    for (const rule of [
      ".env*",
      "!.env.example",
      "/node_modules",
      "/.next/",
      "/coverage",
      "/test-results",
      "/playwright-report",
      ".vercel",
    ])
      expect(ignore, rule).toContain(rule);
  });

  it("stops Next.js from recreating agent files at the root", () => {
    expect(read("next.config.ts")).toMatch(/agentRules:\s*false/);
  });
});

describe("source layout", () => {
  it("keeps one folder per concern", () => {
    const folders = (dir: string) =>
      readdirSync(join(root, dir)).filter((n) =>
        statSync(join(root, dir, n)).isDirectory(),
      );
    expect(folders("src").sort()).toEqual(
      ["app", "assets", "components", "content", "lib", "styles"].sort(),
    );
    expect(folders("src/components").sort()).toEqual(
      ["background", "case-study", "layout", "motion", "sections", "ui"].sort(),
    );
    // One folder per home section, named after its id.
    expect(folders("src/components/sections").sort()).toEqual(
      homeSections.map((s) => s.id).sort(),
    );
  });

  it("names component files after the component they export", () => {
    const components = sourceFiles.filter(
      (f) => f.startsWith("src/components/") && f.endsWith(".tsx"),
    );
    for (const file of components) {
      const name = file.split("/").pop()!.replace(".tsx", "");
      if (name === "icons") continue;
      expect(name, file).toMatch(/^[A-Z][A-Za-z]+$/);
      expect(read(file), file).toMatch(
        new RegExp(`export (default )?function ${name}\\b`),
      );
    }
  });

  it("reaches every module from a route, so nothing is dead code", () => {
    const entries = sourceFiles.filter((f) =>
      /^src\/app\/.*(page|layout|opengraph-image|sitemap|robots)\.tsx?$/.test(
        f,
      ),
    );
    const seen = new Set<string>();
    const visit = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      importsOf(file).forEach(visit);
    };
    entries.forEach(visit);
    // Shared with next.config, which isn't under src/app.
    visit("src/lib/security.ts");
    visit("src/lib/content/hosts.ts");
    const unreachable = sourceFiles.filter((f) => !seen.has(f));
    expect(unreachable).toEqual([]);
  });

  it("layers content, logic and components one way only", () => {
    for (const file of sourceFiles) {
      const deps = importsOf(file);
      if (file.startsWith("src/content/"))
        expect(
          deps.filter((d) => !d.startsWith("src/content/")),
          file,
        ).toEqual([]);
      if (file.startsWith("src/lib/"))
        expect(
          deps.filter((d) => /^src\/(components|app)\//.test(d)),
          file,
        ).toEqual([]);
      if (file.startsWith("src/components/"))
        expect(
          deps.filter((d) => d.startsWith("src/app/")),
          file,
        ).toEqual([]);
    }
  });

  it("keeps server-only code out of client components", () => {
    const client = sourceFiles.filter((f) =>
      /^["']use client["']/.test(read(f).trimStart()),
    );
    expect(client.length).toBeGreaterThan(10);
    for (const file of client) {
      const text = read(file);
      expect(text, file).not.toMatch(/from ["']node:/);
      expect(text, file).not.toMatch(/process\.env\.(?!NEXT_PUBLIC_)/);
      const deps = importsOf(file);
      expect(
        deps.filter(
          (d) =>
            d.startsWith("src/lib/server/") ||
            d.startsWith("src/lib/content/") ||
            d === "src/content/index.ts",
        ),
        file,
      ).toEqual([]);
    }
  });

  it("leaves no debugging or unfinished code behind", () => {
    for (const file of sourceFiles) {
      const text = read(file);
      expect(text, file).not.toMatch(/console\.(log|debug)\(|\bdebugger\b/);
      expect(text, file).not.toMatch(/\b(TODO|FIXME|XXX)\b/);
    }
  });
});

describe("documentation", () => {
  it("states the copyright and keeps the README to the essentials", () => {
    const readme = read("README.md");
    expect(read("LICENSE")).toMatch(/All rights reserved/);
    expect(readme).toMatch(/All rights reserved/);
    expect(readme).toContain(
      "https://keerthirajan-aiml-fluid-portfolio.vercel.app",
    );
    expect(JSON.parse(read("package.json")).license).toBe("UNLICENSED");
  });
});

describe("styles", () => {
  it("imports every partial exactly once, in one entry", () => {
    const entry = read("src/styles/globals.css");
    const imported = [...entry.matchAll(/@import "\.\/([^"]+)";/g)].map(
      (m) => m[1],
    );
    const partials = walk("src/styles")
      .map((f) => f.replace("src/styles/", ""))
      .filter((f) => f !== "globals.css");
    expect([...imported].sort()).toEqual([...partials].sort());
    expect(new Set(imported).size).toBe(imported.length);
    for (const partial of partials)
      expect(read(`src/styles/${partial}`), partial).not.toMatch(/@import/);
  });
});

describe("public assets", () => {
  it("are all in use: no starter files or orphans are deployed", () => {
    const text = sourceFiles.map(read).join("\n");
    const unused = walk("public")
      .map((f) => f.replace(/^public/, ""))
      .filter((asset) => {
        if (text.includes(asset)) return false;
        // Found by name at render time (see findPublicImage / projectCover).
        if (/^\/images\/contact-profile\.(jpg|jpeg|png|webp)$/.test(asset))
          return false;
        if (
          /^\/images\/projects\/[a-z0-9-]+\/cover\.(jpg|jpeg|png|webp)$/.test(
            asset,
          )
        )
          return false;
        // Certification logos are named through the logo() helper.
        const logo = asset.match(/^\/images\/brands\/certs\/([a-z-]+)\.png$/);
        return !(logo && text.includes(`logo("${logo[1]}")`));
      });
    expect(unused).toEqual([]);
  });
});
