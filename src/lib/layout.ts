/**
 * Layout maths for the work grid (standard rows) and case-study galleries
 * (justified rows).
 */
export type Placement = { x: number; y: number; column: number };
export type Box = { x: number; y: number; width: number; height: number };

export function columnsFor(width: number, breakpoints = [960, 600]) {
  return width >= breakpoints[0] ? 3 : width >= breakpoints[1] ? 2 : 1;
}

export function columnWidth(width: number, columns: number, gap: number) {
  return (width - gap * (columns - 1)) / columns;
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

/** Target row height for a gallery of the given width. */
export function galleryRowHeight(width: number) {
  return width >= 880 ? 300 : width >= 560 ? 220 : 150;
}

/**
 * Justified rows, like a photo book: every image keeps its own shape, every
 * row spans the full width exactly, and all images in a row share a height.
 * Row breaks are chosen (in reading order) so row heights stay as close to
 * `target` as possible; a row that would grow taller than `maxHeight` (a
 * lone wide image) is capped and centred instead.
 */
export function placeJustified(
  ratios: number[],
  width: number,
  target: number,
  gap: number,
  maxHeight = target * 1.6,
) {
  const count = ratios.length;
  if (!count || width <= 0) return { boxes: [] as Box[], height: 0 };
  const rowHeight = (from: number, to: number) => {
    let sum = 0;
    for (let k = from; k < to; k++) sum += ratios[k];
    return (width - gap * (to - from - 1)) / sum;
  };
  // cost[i]: best layout of the first i images; start[i]: where its last row
  // begins. Rows hold at most 12 images.
  const cost = new Array<number>(count + 1).fill(Infinity);
  const start = new Array<number>(count + 1).fill(0);
  cost[0] = 0;
  for (let end = 1; end <= count; end++)
    for (let from = end - 1; from >= Math.max(0, end - 12); from--) {
      const h = rowHeight(from, end);
      const penalty = h > maxHeight ? 1e9 + h : 0;
      const next = cost[from] + (h - target) ** 2 + penalty;
      if (next < cost[end]) {
        cost[end] = next;
        start[end] = from;
      }
    }
  const rows: [number, number][] = [];
  for (let end = count; end > 0; end = start[end])
    rows.unshift([start[end], end]);
  const boxes: Box[] = [];
  let y = 0;
  for (const [from, to] of rows) {
    const h = Math.min(rowHeight(from, to), maxHeight);
    let used = gap * (to - from - 1);
    for (let k = from; k < to; k++) used += ratios[k] * h;
    let x = (width - used) / 2;
    for (let k = from; k < to; k++) {
      const w = ratios[k] * h;
      boxes.push({ x, y, width: w, height: h });
      x += w + gap;
    }
    y += h + gap;
  }
  return { boxes, height: y - gap };
}
