import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  columnWidth,
  columnsFor,
  galleryRowHeight,
  placeGrid,
  placeJustified,
  type Box,
} from "@/lib/layout";
import { SECTIONS, lossAt, lossPath } from "@/lib/sections";
import { CERT_LOGOS, certLogo } from "@/lib/certLogos";
import { getCertifications } from "@/lib/projects";

/** Groups boxes into rows by their top edge. */
const rowsOf = (boxes: Box[]) => {
  const rows = new Map<number, Box[]>();
  for (const box of boxes) rows.set(box.y, [...(rows.get(box.y) ?? []), box]);
  return [...rows.values()];
};

describe("work grid maths", () => {
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
});

describe("gallery maths: justified rows", () => {
  it("keeps every image's shape and fills each row exactly", () => {
    const ratios = [1.6, 0.75, 1];
    const { boxes, height } = placeJustified(ratios, 1000, 300, 14);
    const h = (1000 - 28) / 3.35;
    expect(boxes.map((b) => b.y)).toEqual([0, 0, 0]);
    boxes.forEach((b, i) => {
      expect(b.height).toBeCloseTo(h);
      expect(b.width / b.height).toBeCloseTo(ratios[i]);
    });
    expect(boxes[0].x).toBeCloseTo(0);
    expect(boxes[1].x).toBeCloseTo(boxes[0].width + 14);
    expect(boxes[2].x + boxes[2].width).toBeCloseTo(1000);
    expect(height).toBeCloseTo(h);
  });

  it("chooses balanced row breaks in reading order", () => {
    // PitchPulse: a cover, a landscape shot and eleven phone screens.
    const ratios = [0.75, 1.33, ...Array<number>(11).fill(0.46)];
    const { boxes, height } = placeJustified(ratios, 1208, 300, 14);
    const rows = rowsOf(boxes);
    expect(rows.map((r) => r.length)).toEqual([5, 8]);
    for (const row of rows) {
      // One height per row, close to the target, spanning the full width.
      row.forEach((b) => expect(b.height).toBeCloseTo(row[0].height));
      expect(row[0].height).toBeGreaterThan(250);
      expect(row[0].height).toBeLessThan(360);
      expect(row[0].x).toBeCloseTo(0);
      expect(row.at(-1)!.x + row.at(-1)!.width).toBeCloseTo(1208);
    }
    // Reading order: left to right, top to bottom.
    boxes.slice(1).forEach((b, i) => {
      const prev = boxes[i];
      expect(b.y > prev.y || (b.y === prev.y && b.x > prev.x)).toBe(true);
    });
    expect(height).toBeCloseTo(rows[0][0].height + 14 + rows[1][0].height);
  });

  it("splits a set across more rows on a phone", () => {
    const { boxes } = placeJustified([0.75, 1.55, 1.33, 0.72], 343, 150, 10);
    expect(rowsOf(boxes).map((r) => r.length)).toEqual([2, 2]);
  });

  it("caps a lone wide image and centres it", () => {
    const { boxes, height } = placeJustified([1.5], 1208, 300, 14);
    expect(boxes).toEqual([{ x: 244, y: 0, width: 720, height: 480 }]);
    expect(height).toBe(480);
    expect(placeJustified([], 1208, 300, 14)).toEqual({
      boxes: [],
      height: 0,
    });
    expect(placeJustified([1], 0, 300, 14).boxes).toEqual([]);
  });

  it("targets taller rows on wider walls", () => {
    expect(galleryRowHeight(1208)).toBe(300);
    expect(galleryRowHeight(700)).toBe(220);
    expect(galleryRowHeight(343)).toBe(150);
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

  it("shows every issuer's real logo", () => {
    const certs = getCertifications();
    expect(certs.filter((c) => !certLogo(c.slug))).toEqual([]);
    // Every mapped logo belongs to a real certification.
    expect(Object.keys(CERT_LOGOS).sort()).toEqual(
      certs.map((c) => c.slug).sort(),
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
