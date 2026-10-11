/**
 * Classic optimisation test functions, one per section of the page. The
 * background draws their contours and lets real optimisers descend them.
 */
export type Landscape = {
  id: string;
  name: string;
  note: string;
  f: (x: number, y: number) => number;
  /** Centre of the visible domain. */
  center: [number, number];
  /** Half-extent of the domain along the viewport's shorter side. */
  span: number;
};

const sq = (v: number) => v * v;
const tilt = Math.PI / 7;

export const landscapes: Record<string, Landscape> = {
  himmelblau: {
    id: "himmelblau",
    name: "Himmelblau",
    note: "four equal minima",
    f: (x, y) => sq(x * x + y - 11) + sq(x + y * y - 7),
    center: [0, 0],
    span: 5.6,
  },
  rosenbrock: {
    id: "rosenbrock",
    name: "Rosenbrock",
    note: "a long, flat valley",
    f: (x, y) => sq(1 - x) + 100 * sq(y - x * x),
    center: [0, 0.9],
    span: 1.9,
  },
  ravine: {
    id: "ravine",
    name: "Ill-conditioned ravine",
    note: "where momentum earns its keep",
    f: (x, y) => {
      const u = x * Math.cos(tilt) - y * Math.sin(tilt);
      const v = x * Math.sin(tilt) + y * Math.cos(tilt);
      return 0.35 * u * u + 7 * v * v;
    },
    center: [0, 0],
    span: 4,
  },
  camel: {
    id: "camel",
    name: "Six-hump camel",
    note: "six minima, two global",
    // Shifted by its global minimum (−1.0316) so the loss bottoms out at 0.
    f: (x, y) =>
      (4 - 2.1 * x * x + (x * x * x * x) / 3) * x * x +
      x * y +
      (-4 + 4 * y * y) * y * y +
      1.0316,
    center: [0, 0],
    span: 1.25,
  },
  booth: {
    id: "booth",
    name: "Booth",
    note: "one broad basin",
    f: (x, y) => sq(x + 2 * y - 7) + sq(2 * x + y - 5),
    center: [1, 3],
    span: 6,
  },
  beale: {
    id: "beale",
    name: "Beale",
    note: "sharp ridges, flat floor",
    f: (x, y) =>
      sq(1.5 - x + x * y) +
      sq(2.25 - x + x * y * y) +
      sq(2.625 - x + x * y * y * y),
    center: [0.6, 0.1],
    span: 3,
  },
  bowl: {
    id: "bowl",
    name: "Convex bowl",
    note: "everything converges",
    f: (x, y) => x * x + 1.6 * y * y,
    center: [0, 0],
    span: 3,
  },
};

/** Which landscape belongs to which page section (one epoch each). */
export const sectionLandscapes: [section: string, landscape: string][] = [
  ["hero", "himmelblau"],
  ["about", "rosenbrock"],
  ["experience", "ravine"],
  ["projects", "camel"],
  ["skills", "booth"],
  ["credentials", "beale"],
  ["testimonials", "himmelblau"],
  ["contact", "bowl"],
];

/** Loss as the optimisers see it: log-compressed so every function is tame. */
export const loss = (l: Landscape, x: number, y: number) =>
  Math.log1p(Math.max(0, l.f(x, y)));

export type Viewport = { width: number; height: number };

/** Domain half-extents for a viewport, keeping the function's aspect true. */
export function extents(l: Landscape, v: Viewport) {
  const wide = v.width >= v.height;
  const ratio = wide ? v.width / v.height : v.height / v.width;
  return wide
    ? { hx: l.span * ratio, hy: l.span }
    : { hx: l.span, hy: l.span * ratio };
}

export function toDomain(l: Landscape, v: Viewport, sx: number, sy: number) {
  const { hx, hy } = extents(l, v);
  return [
    l.center[0] + (sx / v.width - 0.5) * 2 * hx,
    l.center[1] - (sy / v.height - 0.5) * 2 * hy,
  ] as const;
}

export function toScreen(l: Landscape, v: Viewport, x: number, y: number) {
  const { hx, hy } = extents(l, v);
  return [
    ((x - l.center[0]) / (2 * hx) + 0.5) * v.width,
    (0.5 - (y - l.center[1]) / (2 * hy)) * v.height,
  ] as const;
}
