import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  columnWidth,
  columnsFor,
  galleryColumns,
  placeGrid,
  placeMasonry,
} from "@/lib/masonry";
import { SECTIONS, lossAt, lossPath } from "@/lib/sections";
import { CERT_LOGOS, certLogo } from "@/lib/certLogos";
import { getCertifications } from "@/lib/projects";

describe("grid and masonry maths", () => {
  it("picks columns by width and splits the gaps evenly", () => {
    expect(columnsFor(1200)).toBe(3);
    expect(columnsFor(960)).toBe(3);
    expect(columnsFor(700)).toBe(2);
    expect(columnsFor(599)).toBe(1);
    expect(columnsFor(500, [800, 400])).toBe(2);
    expect(columnWidth(1000, 3, 20)).toBeCloseTo(320);
    expect(columnWidth(500, 1, 20)).toBe(500);
  });

  it("lines cards up in standard rows, each as tall as its tallest card", () => {
    const { placements, height } = placeGrid([300, 420, 360, 280], 3, 100, 18);
    expect(placements.map((p) => [p.x, p.y, p.height])).toEqual([
      [0, 0, 420],
      [118, 0, 420],
      [236, 0, 420],
      [0, 438, 280],
    ]);
    expect(height).toBe(420 + 18 + 280);
    // A single column keeps every card at its natural height.
    expect(placeGrid([300, 120], 1, 300, 18).placements).toEqual([
      { x: 0, y: 0, column: 0, height: 300 },
      { x: 0, y: 318, column: 0, height: 120 },
    ]);
    expect(placeGrid([], 3, 100, 18)).toEqual({ placements: [], height: 0 });
  });

  it("fills the shortest column, leftmost on ties, keeping reading order across the top", () => {
    const { placements, height } = placeMasonry([100, 50, 80, 30], 2, 100, 10);
    expect(placements).toEqual([
      { x: 0, y: 0, column: 0 },
      { x: 110, y: 0, column: 1 },
      { x: 110, y: 60, column: 1 },
      { x: 0, y: 110, column: 0 },
    ]);
    expect(height).toBe(140);
    const even = placeMasonry([10, 10, 10, 10], 3, 50, 5).placements;
    expect(even.map((p) => p.column)).toEqual([0, 1, 2, 0]);
    expect(placeMasonry([], 3, 50, 5).height).toBe(0);
  });

  it("puts a short set in one row and gives phone screenshots narrower columns", () => {
    const four = [0.75, 1.55, 1.33, 0.72];
    const six = [1.68, 1.68, 1.68, 1.68, 1.68, 1.68];
    const phones = [0.75, 1.33, ...Array(11).fill(0.46)];
    expect(galleryColumns(1208, four)).toBe(4);
    expect(galleryColumns(1208, [1.44, 1.78])).toBe(2);
    expect(galleryColumns(1208, six)).toBe(3);
    expect(galleryColumns(1208, phones)).toBe(5);
    expect(galleryColumns(700, four)).toBe(2);
    expect(galleryColumns(700, phones)).toBe(3);
    expect(galleryColumns(390, phones)).toBe(2);
    expect(galleryColumns(390, six)).toBe(2);
    expect(galleryColumns(280, [1])).toBe(1);
    expect(galleryColumns(280, four)).toBe(1);
    expect(galleryColumns(1208, [])).toBe(1);
  });
});

describe("training monitor curve", () => {
  it("has one epoch per home section", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual([
      "hero",
      "about",
      "experience",
      "projects",
      "skills",
      "credentials",
      "testimonials",
      "contact",
    ]);
  });

  it("falls as you read and settles near zero by Contact", () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 1].map(lossAt);
    samples
      .slice(1)
      .forEach((loss, i) => expect(loss).toBeLessThan(samples[i]));
    expect(lossAt(1)).toBeLessThan(0.05);
    expect(lossAt(-1)).toBe(lossAt(0));
    expect(lossAt(3)).toBe(lossAt(1));
  });

  it("draws the curve inside its 96×26 box", () => {
    const d = lossPath(0.6);
    expect(d.startsWith("M1.0,2.0")).toBe(true);
    const points = d.match(/[ML][\d.]+,[\d.]+/g)!;
    expect(points).toHaveLength(41);
    for (const point of points) {
      const [x, y] = point.slice(1).split(",").map(Number);
      expect(x).toBeGreaterThanOrEqual(1);
      expect(x).toBeLessThanOrEqual(95);
      expect(y).toBeGreaterThanOrEqual(2);
      expect(y).toBeLessThanOrEqual(24);
    }
    // Before any reading the curve is flat at the top.
    expect(lossPath(0, 2)).toBe("M1.0,2.0L48.0,2.0L95.0,2.0");
  });
});

describe("certification logos", () => {
  /** Reads a PNG's pixel size from its IHDR chunk. */
  const pngSize = (publicPath: string) => {
    const bytes = readFileSync(join(process.cwd(), "public", publicPath));
    expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  };

  it("shows each issuer's real logo, with initials only for API Academy", () => {
    const certs = getCertifications();
    const withoutLogo = certs.filter((c) => !certLogo(c.slug));
    expect(withoutLogo.map((c) => c.slug)).toEqual([
      "certification-api-designer",
    ]);
    // Every mapped logo belongs to a real certification.
    expect(Object.keys(CERT_LOGOS).sort()).toEqual(
      certs
        .map((c) => c.slug)
        .filter((slug) => slug !== "certification-api-designer")
        .sort(),
    );
  });

  it("ships every logo file at the size the page declares", () => {
    for (const logo of Object.values(CERT_LOGOS))
      expect(pngSize(logo.src)).toEqual({
        width: logo.width,
        height: logo.height,
      });
  });
});
