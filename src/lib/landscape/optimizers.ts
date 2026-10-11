/**
 * Three optimisers stepping on a 2-D loss, written out by hand so the
 * background shows their real behaviour: SGD's zig-zag, momentum's
 * overshoot, Adam's per-axis scaling.
 */
export type OptimizerKind = "sgd" | "momentum" | "adam";

export const optimizerLabels: Record<OptimizerKind, string> = {
  sgd: "SGD",
  momentum: "Momentum",
  adam: "Adam",
};

export type Walker = {
  kind: OptimizerKind;
  x: number;
  y: number;
  /** Momentum velocity / Adam first moment. */
  m: [number, number];
  /** Adam second moment. */
  v: [number, number];
  t: number;
};

export function createWalker(
  kind: OptimizerKind,
  x: number,
  y: number,
): Walker {
  return { kind, x, y, m: [0, 0], v: [0, 0], t: 0 };
}

export function resetState(w: Walker) {
  w.m = [0, 0];
  w.v = [0, 0];
  w.t = 0;
}

/** Central-difference gradient of `g` at (x, y). */
export function gradient(
  g: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number,
): [number, number] {
  return [
    (g(x + h, y) - g(x - h, y)) / (2 * h),
    (g(x, y + h) - g(x, y - h)) / (2 * h),
  ];
}

export type Rates = { sgd: number; momentum: number };

/**
 * Plain gradient descent is only stable when the learning rate is below
 * 2 / (largest curvature). Estimate that curvature near the minima (the
 * lowest fifth of sampled points) so SGD and momentum get stable rates that
 * still show their character, exactly the tuning problem real training has.
 */
export function tuneRates(
  g: (x: number, y: number) => number,
  bounds: { x0: number; x1: number; y0: number; y1: number },
  samples = 48,
): Rates {
  const pts: { v: number; x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++)
    for (let j = 0; j < samples; j++) {
      const x = bounds.x0 + ((bounds.x1 - bounds.x0) * (i + 0.5)) / samples;
      const y = bounds.y0 + ((bounds.y1 - bounds.y0) * (j + 0.5)) / samples;
      pts.push({ v: g(x, y), x, y });
    }
  pts.sort((a, b) => a.v - b.v);
  const h = (bounds.x1 - bounds.x0) / samples / 4;
  let curvature = 1e-6;
  for (const p of pts.slice(0, Math.ceil(pts.length / 5))) {
    const gxx = (g(p.x + h, p.y) - 2 * p.v + g(p.x - h, p.y)) / (h * h);
    const gyy = (g(p.x, p.y + h) - 2 * p.v + g(p.x, p.y - h)) / (h * h);
    curvature = Math.max(curvature, Math.abs(gxx), Math.abs(gyy));
  }
  return { sgd: 0.9 / curvature, momentum: 0.22 / curvature };
}

/**
 * One optimisation step. `scale` is the domain's half-extent, so the same
 * settings move at a similar on-screen pace on every landscape. Returns the
 * distance moved, in domain units.
 */
export function step(
  w: Walker,
  grad: [number, number],
  scale: number,
  rates: Rates,
) {
  w.t += 1;
  let dx: number, dy: number;
  if (w.kind === "sgd") {
    dx = -rates.sgd * grad[0];
    dy = -rates.sgd * grad[1];
  } else if (w.kind === "momentum") {
    const lr = rates.momentum;
    w.m = [0.92 * w.m[0] + grad[0], 0.92 * w.m[1] + grad[1]];
    dx = -lr * w.m[0];
    dy = -lr * w.m[1];
  } else {
    const lr = 0.011 * scale,
      b1 = 0.9,
      b2 = 0.999;
    w.m = [b1 * w.m[0] + (1 - b1) * grad[0], b1 * w.m[1] + (1 - b1) * grad[1]];
    w.v = [
      b2 * w.v[0] + (1 - b2) * grad[0] * grad[0],
      b2 * w.v[1] + (1 - b2) * grad[1] * grad[1],
    ];
    const mh = [w.m[0] / (1 - b1 ** w.t), w.m[1] / (1 - b1 ** w.t)];
    const vh = [w.v[0] / (1 - b2 ** w.t), w.v[1] / (1 - b2 ** w.t)];
    dx = (-lr * mh[0]) / (Math.sqrt(vh[0]) + 1e-8);
    dy = (-lr * mh[1]) / (Math.sqrt(vh[1]) + 1e-8);
  }
  // Clip so a steep wall never flings a bubble off screen.
  const max = 0.05 * scale;
  const len = Math.hypot(dx, dy);
  if (len > max) {
    dx *= max / len;
    dy *= max / len;
  }
  w.x += dx;
  w.y += dy;
  return Math.hypot(dx, dy);
}
