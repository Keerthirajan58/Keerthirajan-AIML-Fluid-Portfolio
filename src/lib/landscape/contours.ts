/**
 * Marching squares over a regular grid. Returns flat segment lists
 * ([x1, y1, x2, y2, ...] in grid units) for one iso level.
 */
export function contourSegments(
  values: Float32Array,
  cols: number,
  rows: number,
  level: number,
): number[] {
  const out: number[] = [];
  const at = (c: number, r: number) => values[r * cols + c];
  // Interpolated crossing point between two corners.
  const lerp = (a: number, b: number) =>
    a === b ? 0.5 : (level - a) / (b - a);
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const tl = at(c, r),
        tr = at(c + 1, r),
        br = at(c + 1, r + 1),
        bl = at(c, r + 1);
      const code =
        (tl > level ? 8 : 0) |
        (tr > level ? 4 : 0) |
        (br > level ? 2 : 0) |
        (bl > level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const top = [c + lerp(tl, tr), r];
      const right = [c + 1, r + lerp(tr, br)];
      const bottom = [c + lerp(bl, br), r + 1];
      const left = [c, r + lerp(tl, bl)];
      const seg = (a: number[], b: number[]) =>
        out.push(a[0], a[1], b[0], b[1]);
      switch (code) {
        case 1:
        case 14:
          seg(left, bottom);
          break;
        case 2:
        case 13:
          seg(bottom, right);
          break;
        case 3:
        case 12:
          seg(left, right);
          break;
        case 4:
        case 11:
          seg(top, right);
          break;
        case 6:
        case 9:
          seg(top, bottom);
          break;
        case 7:
        case 8:
          seg(left, top);
          break;
        case 5:
        case 10: {
          // Saddle: resolve with the cell's centre value.
          const centre = (tl + tr + br + bl) / 4 > level;
          if ((code === 5) === centre) {
            seg(left, top);
            seg(bottom, right);
          } else {
            seg(left, bottom);
            seg(top, right);
          }
          break;
        }
      }
    }
  }
  return out;
}

/** Evenly spaced levels between two quantiles of the sampled values. */
export function contourLevels(values: Float32Array, count: number) {
  const sorted = Float32Array.from(values).sort();
  const lo = sorted[Math.floor(sorted.length * 0.01)];
  const hi = sorted[Math.floor(sorted.length * 0.94)];
  return Array.from(
    { length: count },
    (_, i) => lo + ((hi - lo) * (i + 0.5)) / count,
  );
}
