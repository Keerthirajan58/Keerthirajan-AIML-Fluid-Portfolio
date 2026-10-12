/**
 * The training monitor's maths: scrolling "trains" the page, so the loss
 * falls with reading progress. Its epochs are the home sections
 * (`content/site.ts`).
 */
/**
 * Playful "training loss" for a reading position p in [0, 1]: falls
 * steeply, then settles near zero by the end of the page.
 */
export function lossAt(p: number) {
  const t = Math.min(1, Math.max(0, p));
  return 0.012 + 2.4 * Math.exp(-4.4 * t) * (1 + 0.035 * Math.sin(t * 41));
}

/** SVG path of the loss curve from the top of the page to p (96×26 box). */
export function lossPath(p: number, points = 40) {
  const t = Math.min(1, Math.max(0, p));
  const max = lossAt(0);
  let d = "";
  for (let i = 0; i <= points; i++) {
    const at = (i / points) * t;
    const x = (i / points) * 94 + 1;
    const y = 2 + (1 - lossAt(at) / max) * 22;
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}
