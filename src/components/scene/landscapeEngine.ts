/**
 * Canvas renderer for the background loss landscape: contour lines of the
 * current section's test function, and glass "optimiser" bubbles descending
 * it with real SGD / momentum / Adam updates. Browser-only; all maths lives
 * in src/lib/landscape and is unit-tested there.
 */
import {
  landscapes,
  loss,
  extents,
  toDomain,
  toScreen,
  type Landscape,
  type Viewport,
} from "@/lib/landscape/functions";
import { contourLevels, contourSegments } from "@/lib/landscape/contours";
import {
  createWalker,
  gradient,
  resetState,
  step,
  tuneRates,
  type OptimizerKind,
  type Rates,
  type Walker,
} from "@/lib/landscape/optimizers";

export const OPTIMIZER_COLORS: Record<OptimizerKind, string> = {
  adam: "223, 33, 47",
  momentum: "58, 92, 150",
  sgd: "104, 111, 122",
};

export type Stats = {
  landscape: Landscape;
  /** Lowest raw loss among the bubbles right now. */
  best: number;
  /** Recent log-loss history of the best bubble, oldest first. */
  history: number[];
  steps: number;
};

type Bubble = {
  w: Walker;
  trail: number[];
  alpha: number;
  phase: "in" | "run" | "out";
  still: number;
  life: number;
};

type Options = {
  contours: [HTMLCanvasElement, HTMLCanvasElement];
  orbs: HTMLCanvasElement;
  animated: boolean;
  onStats?: (stats: Stats) => void;
};

const TRAIL_POINTS = 70;
const HISTORY = 90;

/** Small deterministic PRNG so the still (reduced-motion) render is stable. */
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class LandscapeEngine {
  private l: Landscape = landscapes.himmelblau;
  private v: Viewport = { width: 1, height: 1 };
  private dpr = 1;
  private front = 0;
  private cache = new Map<string, Float32Array[]>();
  private bubbles: Bubble[] = [];
  private rates: Rates = { sgd: 0, momentum: 0 };
  private scale = 1;
  private raf = 0;
  private running = false;
  private paused = false;
  private pointer: { x: number; y: number; at: number } | null = null;
  private well = 0;
  private steps = 0;
  private history: number[] = [];
  private sprites = new Map<OptimizerKind, HTMLCanvasElement>();
  private random = Math.random;
  private idle = 0;
  /** Animated trails fade out; still renders keep the whole descent. */
  private trailLimit = TRAIL_POINTS;

  constructor(private opts: Options) {
    if (!opts.animated) this.trailLimit = 400;
    this.resize();
    if (opts.animated) {
      const kinds: OptimizerKind[] =
        this.v.width < 700
          ? ["adam", "momentum", "sgd"]
          : ["adam", "momentum", "sgd", "adam", "momentum", "sgd"];
      this.bubbles = kinds.map((kind) => this.spawn(kind));
      this.start();
    }
    this.precompute();
  }

  /* ── public API ── */

  setLandscape(id: string) {
    const next = landscapes[id];
    if (!next || next === this.l) return;
    const prev = this.l;
    // Keep every bubble where it is on screen; it starts descending the new
    // surface from there.
    for (const b of this.bubbles) {
      const [sx, sy] = toScreen(prev, this.v, b.w.x, b.w.y);
      [b.w.x, b.w.y] = toDomain(next, this.v, sx, sy);
      resetState(b.w);
      b.still = 0;
      b.life = 0;
    }
    this.l = next;
    this.retune();
    this.history = [];
    const back = this.opts.contours[1 - this.front];
    this.paintContours(back, this.segments(next));
    back.style.opacity = "1";
    this.opts.contours[this.front].style.opacity = "0";
    this.front = 1 - this.front;
    if (!this.opts.animated) this.drawStill();
    this.report();
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y, at: performance.now() };
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.stop();
    else if (this.opts.animated) this.start();
  }

  setVisible(visible: boolean) {
    if (!visible) this.stop();
    else if (this.opts.animated && !this.paused) this.start();
  }

  resize() {
    const prev = this.v;
    this.v = { width: window.innerWidth, height: window.innerHeight };
    this.dpr = Math.min(
      window.devicePixelRatio || 1,
      this.v.width < 700 ? 1 : 1.5,
    );
    for (const c of [...this.opts.contours, this.opts.orbs]) {
      c.width = Math.round(this.v.width * this.dpr);
      c.height = Math.round(this.v.height * this.dpr);
    }
    // Bubbles keep their relative screen position.
    for (const b of this.bubbles) {
      const [sx, sy] = toScreen(this.l, prev, b.w.x, b.w.y);
      [b.w.x, b.w.y] = toDomain(
        this.l,
        this.v,
        (sx / prev.width) * this.v.width,
        (sy / prev.height) * this.v.height,
      );
      b.trail = [];
    }
    this.cache.clear();
    this.retune();
    this.opts.contours[this.front].style.opacity = "1";
    this.opts.contours[1 - this.front].style.opacity = "0";
    this.paintContours(this.opts.contours[this.front], this.segments(this.l));
    if (!this.opts.animated) this.drawStill();
  }

  destroy() {
    this.stop();
    if (this.idle && "cancelIdleCallback" in window)
      cancelIdleCallback(this.idle);
  }

  /* ── contours ── */

  private segments(l: Landscape) {
    const cached = this.cache.get(l.id);
    if (cached) return cached;
    const gap = this.v.width < 700 ? 12 : 9;
    const cols = Math.ceil(this.v.width / gap) + 1;
    const rows = Math.ceil(this.v.height / gap) + 1;
    const values = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const [x, y] = toDomain(l, this.v, c * gap, r * gap);
        values[r * cols + c] = loss(l, x, y);
      }
    const segs = contourLevels(values, 18).map((level) =>
      Float32Array.from(
        contourSegments(values, cols, rows, level),
        (n) => n * gap,
      ),
    );
    this.cache.set(l.id, segs);
    return segs;
  }

  private paintContours(canvas: HTMLCanvasElement, segs: Float32Array[]) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.v.width, this.v.height);
    segs.forEach((s, i) => {
      // The lowest level is the basin floor: the one crimson line.
      ctx.strokeStyle =
        i === 0
          ? "rgba(223, 33, 47, 0.26)"
          : i % 4 === 3
            ? "rgba(15, 16, 19, 0.11)"
            : "rgba(15, 16, 19, 0.06)";
      ctx.lineWidth = i % 4 === 3 || i === 0 ? 1.1 : 0.8;
      ctx.beginPath();
      for (let k = 0; k < s.length; k += 4) {
        ctx.moveTo(s[k], s[k + 1]);
        ctx.lineTo(s[k + 2], s[k + 3]);
      }
      ctx.stroke();
    });
  }

  /** Warm the cache for the other sections while the browser is idle. */
  private precompute() {
    if (!("requestIdleCallback" in window)) return;
    const queue = Object.keys(landscapes);
    const next = () => {
      const id = queue.shift();
      if (!id) return;
      this.segments(landscapes[id]);
      this.idle = requestIdleCallback(next, { timeout: 4000 });
    };
    this.idle = requestIdleCallback(next, { timeout: 4000 });
  }

  /* ── optimisation ── */

  private retune() {
    const { hx, hy } = extents(this.l, this.v);
    this.scale = Math.min(hx, hy);
    this.rates = tuneRates((x, y) => loss(this.l, x, y), {
      x0: this.l.center[0] - hx,
      x1: this.l.center[0] + hx,
      y0: this.l.center[1] - hy,
      y1: this.l.center[1] + hy,
    });
  }

  /** Loss plus a soft well under the visitor's cursor: you are the minimum. */
  private objective = (x: number, y: number) => {
    let g = loss(this.l, x, y);
    if (this.pointer && this.well > 0.01) {
      const [px, py] = toDomain(this.l, this.v, this.pointer.x, this.pointer.y);
      const s = 0.16 * this.scale;
      g -= this.well * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s));
    }
    return g;
  };

  private spawn(kind: OptimizerKind): Bubble {
    const { hx, hy } = extents(this.l, this.v);
    let best: [number, number] = [this.l.center[0], this.l.center[1]];
    let high = -Infinity;
    // Start somewhere high: the best of three random draws.
    for (let i = 0; i < 3; i++) {
      const x = this.l.center[0] + (this.random() * 1.7 - 0.85) * hx;
      const y = this.l.center[1] + (this.random() * 1.7 - 0.85) * hy;
      const g = loss(this.l, x, y);
      if (g > high) {
        high = g;
        best = [x, y];
      }
    }
    return {
      w: createWalker(kind, best[0], best[1]),
      trail: [],
      alpha: 0,
      phase: "in",
      still: 0,
      life: 0,
    };
  }

  private advance(b: Bubble) {
    if (b.phase === "in") {
      b.alpha = Math.min(1, b.alpha + 0.04);
      if (b.alpha >= 1) b.phase = "run";
    }
    if (b.phase === "out") {
      b.alpha -= 0.03;
      if (b.alpha <= 0) Object.assign(b, this.spawn(b.w.kind));
      return;
    }
    const moved = step(
      b.w,
      gradient(this.objective, b.w.x, b.w.y, 1e-3 * this.scale),
      this.scale,
      this.rates,
    );
    b.still = moved < 0.0012 * this.scale ? b.still + 1 : 0;
    b.life += 1;
    const [sx, sy] = toScreen(this.l, this.v, b.w.x, b.w.y);
    const off =
      sx < -40 || sy < -40 || sx > this.v.width + 40 || sy > this.v.height + 40;
    if (b.still > 110 || b.life > 960 || off) b.phase = "out";
    b.trail.push(sx, sy);
    if (b.trail.length > this.trailLimit * 2) b.trail.splice(0, 2);
  }

  /* ── animation ── */

  private start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick = () => {
    if (!this.running) return;
    const live =
      this.pointer && performance.now() - this.pointer.at < 4000 ? 1.4 : 0;
    this.well += (live - this.well) * 0.05;
    for (const b of this.bubbles) this.advance(b);
    this.steps += 1;
    this.drawOrbs();
    if (this.steps % 6 === 0) this.report();
    this.raf = requestAnimationFrame(this.tick);
  };

  private report() {
    let best = Infinity;
    for (const b of this.bubbles)
      if (b.phase !== "out") best = Math.min(best, this.l.f(b.w.x, b.w.y));
    if (!Number.isFinite(best)) return;
    this.history.push(Math.log1p(best));
    if (this.history.length > HISTORY) this.history.shift();
    this.opts.onStats?.({
      landscape: this.l,
      best,
      history: this.history,
      steps: this.steps,
    });
  }

  /** Reduced motion / touch: draw finished descents once, as a still map. */
  private drawStill() {
    this.random = mulberry(this.l.id.length * 977 + 13);
    const kinds: OptimizerKind[] = ["adam", "momentum", "sgd"];
    this.bubbles = kinds.map((kind) => {
      const b = this.spawn(kind);
      b.phase = "run";
      for (let i = 0; i < 320 && b.phase === "run"; i++) this.advance(b);
      b.alpha = 1;
      b.phase = "run";
      return b;
    });
    this.random = Math.random;
    this.drawOrbs();
    this.report();
  }

  private sprite(kind: OptimizerKind) {
    const cached = this.sprites.get(kind);
    if (cached) return cached;
    const r = 11 * this.dpr;
    const c = document.createElement("canvas");
    c.width = c.height = Math.ceil(r * 2 + 4);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    const o = c.width / 2;
    // Glass body.
    const body = ctx.createRadialGradient(
      o - r * 0.35,
      o - r * 0.4,
      r * 0.1,
      o,
      o,
      r,
    );
    body.addColorStop(0, "rgba(255,255,255,0.95)");
    body.addColorStop(0.6, "rgba(255,240,245,0.55)");
    body.addColorStop(1, "rgba(214,226,243,0.75)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(o, o, r, 0, Math.PI * 2);
    ctx.fill();
    // Iridescent rim.
    // Conic gradients are newer than the rest of the canvas API.
    const conic = (ctx as Partial<CanvasRenderingContext2D>)
      .createConicGradient;
    const rim = conic
      ? ctx.createConicGradient(0, o, o)
      : ctx.createLinearGradient(0, 0, c.width, c.height);
    rim.addColorStop(0, "rgba(255,179,196,0.9)");
    rim.addColorStop(0.33, "rgba(198,214,255,0.9)");
    rim.addColorStop(0.66, "rgba(196,239,221,0.9)");
    rim.addColorStop(1, "rgba(255,179,196,0.9)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.6 * this.dpr;
    ctx.stroke();
    // Optimiser colour core + specular highlight.
    ctx.fillStyle = `rgba(${OPTIMIZER_COLORS[kind]}, 0.9)`;
    ctx.beginPath();
    ctx.arc(o + r * 0.18, o + r * 0.2, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(
      o - r * 0.38,
      o - r * 0.42,
      r * 0.32,
      r * 0.17,
      -0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    this.sprites.set(kind, c);
    return c;
  }

  private drawOrbs() {
    const ctx = this.opts.orbs.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.v.width, this.v.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const b of this.bubbles) {
      const t = b.trail,
        n = t.length / 2,
        rgb = OPTIMIZER_COLORS[b.w.kind];
      ctx.lineWidth = b.w.kind === "adam" ? 1.7 : 1.3;
      // Trail fades towards its tail, drawn in a few alpha bands.
      const bands = 6;
      for (let k = 0; k < bands; k++) {
        const from = Math.floor((k * (n - 1)) / bands),
          to = Math.floor(((k + 1) * (n - 1)) / bands);
        if (to <= from) continue;
        ctx.strokeStyle = `rgba(${rgb}, ${(((k + 1) / bands) * 0.55 * b.alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(t[from * 2], t[from * 2 + 1]);
        for (let i = from + 1; i <= to; i++) ctx.lineTo(t[i * 2], t[i * 2 + 1]);
        ctx.stroke();
      }
      const [x, y] = toScreen(this.l, this.v, b.w.x, b.w.y);
      const s = this.sprite(b.w.kind);
      const size = s.width / this.dpr;
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.drawImage(s, x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
  }
}
