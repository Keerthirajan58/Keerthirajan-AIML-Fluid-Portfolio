import { describe, expect, it } from "vitest";
import { lossAt, lossPath } from "@/lib/training";

describe("training monitor curve", () => {
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
    expect(lossPath(-5, 2)).toBe(lossPath(0, 2));
  });
});
