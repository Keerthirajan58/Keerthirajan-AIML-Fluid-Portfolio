import { describe, expect, it } from "vitest";
import {
  extents,
  landscapes,
  loss,
  sectionLandscapes,
  toDomain,
  toScreen,
} from "@/lib/landscape/functions";
import { contourLevels, contourSegments } from "@/lib/landscape/contours";
import {
  createWalker,
  gradient,
  optimizerLabels,
  resetState,
  step,
  tuneRates,
  type OptimizerKind,
} from "@/lib/landscape/optimizers";

const wide = { width: 1440, height: 900 };
const tall = { width: 390, height: 844 };

describe("landscape functions", () => {
  it("maps every home section to a real landscape", () => {
    expect(sectionLandscapes.map(([id]) => id)).toEqual([
      "hero",
      "about",
      "experience",
      "projects",
      "skills",
      "credentials",
      "testimonials",
      "contact",
    ]);
    for (const [, id] of sectionLandscapes)
      expect(landscapes[id]).toBeDefined();
  });
  it("bottoms out at zero at each function's known minimum", () => {
    expect(landscapes.himmelblau.f(3, 2)).toBeCloseTo(0, 8);
    expect(landscapes.rosenbrock.f(1, 1)).toBeCloseTo(0, 8);
    expect(landscapes.ravine.f(0, 0)).toBe(0);
    expect(landscapes.camel.f(0.0898, -0.7126)).toBeCloseTo(0, 3);
    expect(landscapes.booth.f(1, 3)).toBeCloseTo(0, 8);
    expect(landscapes.beale.f(3, 0.5)).toBeCloseTo(0, 8);
    expect(landscapes.bowl.f(0, 0)).toBe(0);
    expect(loss(landscapes.bowl, 0, 0)).toBe(0);
  });
  it("keeps the shorter viewport side at the function's span", () => {
    const l = landscapes.himmelblau;
    expect(extents(l, wide)).toEqual({ hx: l.span * 1.6, hy: l.span });
    expect(extents(l, tall).hx).toBe(l.span);
    expect(extents(l, tall).hy).toBeCloseTo((l.span * 844) / 390);
  });
  it("round-trips screen and domain coordinates", () => {
    for (const v of [wide, tall]) {
      const l = landscapes.rosenbrock;
      const [x, y] = toDomain(l, v, 321, 654);
      const [sx, sy] = toScreen(l, v, x, y);
      expect(sx).toBeCloseTo(321, 6);
      expect(sy).toBeCloseTo(654, 6);
    }
    // Screen centre is the domain centre; up on screen is +y.
    const l = landscapes.booth;
    expect(toDomain(l, wide, 720, 450)).toEqual([1, 3]);
    expect(toDomain(l, wide, 720, 0)[1]).toBeGreaterThan(3);
  });
});

describe("contours", () => {
  it("traces a single iso-line through a simple gradient", () => {
    // 3x3 grid increasing to the right: the 0.5 level crosses each row once.
    const values = Float32Array.from([0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1]);
    const segs = contourSegments(values, 3, 3, 0.75);
    expect(segs.length).toBe(8);
    for (let i = 0; i < segs.length; i += 2) expect(segs[i]).toBeCloseTo(1.5);
  });
  it("resolves saddle cells without losing segments", () => {
    const saddle = Float32Array.from([1, 0, 0, 1]);
    expect(contourSegments(saddle, 2, 2, 0.5)).toHaveLength(8);
    const centreHigh = Float32Array.from([1, 0.2, 0.2, 1]);
    expect(contourSegments(centreHigh, 2, 2, 0.5)).toHaveLength(8);
    expect(contourSegments(Float32Array.from([0, 0, 0, 0]), 2, 2, 0.5)).toEqual(
      [],
    );
  });
  it("spreads levels inside the sampled range", () => {
    const values = Float32Array.from({ length: 1000 }, (_, i) => i);
    const levels = contourLevels(values, 10);
    expect(levels).toHaveLength(10);
    expect(levels[0]).toBeGreaterThan(values[0]);
    expect(levels[9]).toBeLessThan(values[999]);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });
});

describe("optimisers", () => {
  const bowl = landscapes.bowl;
  const g = (x: number, y: number) => loss(bowl, x, y);
  const rates = tuneRates(g, { x0: -4, x1: 4, y0: -3, y1: 3 });
  it("derives stable learning rates from curvature", () => {
    expect(rates.sgd).toBeGreaterThan(0);
    expect(rates.momentum).toBeLessThan(rates.sgd);
  });
  it.each(["sgd", "momentum", "adam"] as OptimizerKind[])(
    "%s descends the bowl to its minimum",
    (kind) => {
      const w = createWalker(kind, 2.4, -1.6);
      const start = g(w.x, w.y);
      for (let i = 0; i < 600; i++)
        step(w, gradient(g, w.x, w.y, 1e-3), 3, rates);
      expect(g(w.x, w.y)).toBeLessThan(start / 50);
      expect(Math.hypot(w.x, w.y)).toBeLessThan(0.2);
    },
  );
  it("clips steps on steep walls and can reset its state", () => {
    const w = createWalker("sgd", 0, 0);
    const moved = step(w, [1e6, 0], 3, { sgd: 1, momentum: 1 });
    expect(moved).toBeCloseTo(0.15);
    const a = createWalker("adam", 1, 1);
    step(a, [1, 1], 3, rates);
    resetState(a);
    expect(a).toMatchObject({ m: [0, 0], v: [0, 0], t: 0 });
    expect(optimizerLabels.adam).toBe("Adam");
  });
  it("computes central-difference gradients", () => {
    const [gx, gy] = gradient((x, y) => x * x + 3 * y, 2, 5, 1e-4);
    expect(gx).toBeCloseTo(4, 5);
    expect(gy).toBeCloseTo(3, 5);
  });
});
