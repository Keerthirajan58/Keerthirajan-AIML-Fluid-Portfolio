/**
 * Column layout maths shared by the work grid and case-study galleries.
 * Items go into the shortest column (leftmost on ties), so the first row
 * keeps reading order: item 1, 2, 3 across the top.
 */
export type Placement = { x: number; y: number; column: number };

export function columnsFor(width: number, breakpoints = [960, 600]) {
  return width >= breakpoints[0] ? 3 : width >= breakpoints[1] ? 2 : 1;
}

export function columnWidth(width: number, columns: number, gap: number) {
  return (width - gap * (columns - 1)) / columns;
}

export function placeMasonry(
  heights: number[],
  columns: number,
  colWidth: number,
  gap: number,
) {
  const tops = new Array(columns).fill(0);
  const placements: Placement[] = heights.map((h) => {
    let c = 0;
    for (let k = 1; k < columns; k++) if (tops[k] < tops[c] - 0.5) c = k;
    const placement = { x: c * (colWidth + gap), y: tops[c], column: c };
    tops[c] += h + gap;
    return placement;
  });
  const height = Math.max(0, ...tops.map((t) => t - gap));
  return { placements, height };
}

/**
 * Standard rows, like a CSS grid: items fill left to right and every item in
 * a row takes that row's tallest height, so frames line up.
 */
export function placeGrid(
  heights: number[],
  columns: number,
  colWidth: number,
  gap: number,
) {
  const rows: number[] = [];
  heights.forEach((h, i) => {
    const row = Math.floor(i / columns);
    rows[row] = Math.max(rows[row] ?? 0, h);
  });
  const tops: number[] = [];
  let top = 0;
  for (const h of rows) {
    tops.push(top);
    top += h + gap;
  }
  const placements = heights.map((_, i) => {
    const row = Math.floor(i / columns);
    return {
      x: (i % columns) * (colWidth + gap),
      y: tops[row],
      column: i % columns,
      height: rows[row],
    };
  });
  return { placements, height: rows.length ? top - gap : 0 };
}

/**
 * Columns for an image wall. A short set (up to five on a desktop) reads best
 * as one row of varied heights; larger sets use three columns across a
 * desktop and two on a phone, with extra columns when most shots are tall
 * (phone screenshots) so no tile towers over the page.
 */
export function galleryColumns(width: number, ratios: number[]) {
  const count = ratios.length;
  const most = width >= 880 ? 5 : width >= 560 ? 3 : width >= 300 ? 2 : 1;
  if (count <= most) return Math.max(1, count);
  const base = width >= 880 ? 3 : width >= 300 ? 2 : 1;
  const tall = ratios.filter((r) => r < 0.8).length > count / 2;
  const extra = tall ? (width >= 880 ? 2 : width >= 560 ? 1 : 0) : 0;
  return Math.min(count, base + extra);
}
