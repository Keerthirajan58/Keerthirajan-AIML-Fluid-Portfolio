"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
import { sectionLandscapes, landscapes } from "@/lib/landscape/functions";
import {
  optimizerLabels,
  type OptimizerKind,
} from "@/lib/landscape/optimizers";
import { scrollToSection } from "@/lib/smoothScroll";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import type { LandscapeEngine, Stats } from "./landscapeEngine";

const SECTION_LABELS: Record<string, string> = {
  hero: "Intro",
  about: "About",
  experience: "Experience",
  projects: "Work",
  skills: "Skills",
  credentials: "Credentials",
  testimonials: "Recommendations",
  contact: "Contact",
};
const KINDS: OptimizerKind[] = ["adam", "momentum", "sgd"];
const SWATCH: Record<OptimizerKind, string> = {
  adam: "#df212f",
  momentum: "#3a5c96",
  sgd: "#686f7a",
};

const formatLoss = (v: number) =>
  v < 1e-6
    ? "≈ 0 · converged"
    : v < 0.001
      ? v.toExponential(1)
      : v < 10
        ? v.toFixed(3)
        : v.toFixed(1);

/**
 * The page background, everywhere: a soft light field plus a live loss
 * landscape. Each home section is an epoch with its own test function; glass
 * bubbles running SGD, momentum and Adam descend it, and the cursor adds a
 * minimum of its own. The training monitor reports the run and can pause it.
 */
export function Atmosphere() {
  const glow = useRef<HTMLSpanElement>(null);
  const layerA = useRef<HTMLCanvasElement>(null);
  const layerB = useRef<HTMLCanvasElement>(null);
  const orbs = useRef<HTMLCanvasElement>(null);
  const engine = useRef<LandscapeEngine | null>(null);
  const hud = useRef<{
    name: HTMLElement | null;
    note: HTMLElement | null;
    loss: HTMLElement | null;
    spark: SVGPathElement | null;
  }>({ name: null, note: null, loss: null, spark: null });
  const enabled = useMotionEnabled();
  const path = usePathname();
  const home = path === "/";
  const [paused, setPaused] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const landscapeFor = (index: number) =>
    home ? sectionLandscapes[index][1] : "rosenbrock";
  const epochRef = useRef(0);
  useEffect(() => {
    epochRef.current = epoch;
  }, [epoch]);

  // Write per-frame stats straight to the DOM: no React re-render per frame.
  const write = (s: Stats) => {
    const h = hud.current;
    if (h.name && h.name.textContent !== s.landscape.name)
      h.name.textContent = s.landscape.name;
    if (h.note && h.note.textContent !== s.landscape.note)
      h.note.textContent = s.landscape.note;
    if (h.loss) h.loss.textContent = formatLoss(s.best);
    if (h.spark && s.history.length > 1) {
      const max = Math.max(...s.history, 0.001);
      const d = s.history
        .map(
          (v, i) =>
            `${i ? "L" : "M"}${((i / (s.history.length - 1)) * 120).toFixed(1)},${(26 - (v / max) * 22).toFixed(1)}`,
        )
        .join("");
      h.spark.setAttribute("d", d);
    }
  };

  // Boot the renderer once the browser is idle, so it never competes with
  // the first paint. Reduced motion, touch and Save-Data get a still map.
  useEffect(() => {
    let cancelled = false;
    let instance: LandscapeEngine | null = null;
    const boot = () =>
      import("./landscapeEngine")
        .then(({ LandscapeEngine }) => {
          if (cancelled || !layerA.current || !layerB.current || !orbs.current)
            return;
          instance = new LandscapeEngine({
            contours: [layerA.current, layerB.current],
            orbs: orbs.current,
            animated: enabled,
            onStats: write,
          });
          instance.setLandscape(landscapeFor(epochRef.current));
          engine.current = instance;
        })
        .catch(() => {
          /* The field stays as plain glows if the renderer can't load. */
        });
    const idle = "requestIdleCallback" in window;
    const handle = idle
      ? requestIdleCallback(boot, { timeout: 2500 })
      : window.setTimeout(boot, 1200);
    return () => {
      cancelled = true;
      if (idle) cancelIdleCallback(handle);
      else clearTimeout(handle);
      instance?.destroy();
      engine.current = null;
    };
    // landscapeFor/write only read refs; the engine is rebuilt on `enabled`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Sections are epochs: switch landscape as each one reaches mid-screen.
  useEffect(() => {
    if (!home || typeof IntersectionObserver === "undefined") {
      engine.current?.setLandscape(landscapeFor(0));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionLandscapes.findIndex(
            ([id]) => id === entry.target.id,
          );
          if (index < 0) continue;
          setEpoch(index);
          engine.current?.setLandscape(sectionLandscapes[index][1]);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    sectionLandscapes.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home]);

  // Pointer: the warm glow eases after it, and the optimisers feel its well.
  useEffect(() => {
    const el = glow.current;
    if (!enabled || !el) return;
    let x = window.innerWidth * 0.5,
      y = window.innerHeight * 0.42,
      tx = x,
      ty = y,
      frame = 0;
    const tick = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      tx = e.clientX;
      ty = e.clientY;
      engine.current?.setPointer(e.clientX, e.clientY);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    let resizeTimer = 0;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => engine.current?.resize(), 200);
    };
    const visibility = () => engine.current?.setVisible(!document.hidden);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      el.style.transform = "";
    };
  }, [enabled]);

  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  const current = landscapes[landscapeFor(epoch)];
  return (
    <>
      <div
        className="atmosphere"
        aria-hidden="true"
        data-live={enabled ? "true" : undefined}
      >
        <span className="glow glow-blush" />
        <span className="glow glow-haze" />
        <span className="glow glow-peach" />
        <span className="glow glow-pointer" ref={glow} />
        <canvas className="landscape-layer" ref={layerA} />
        <canvas
          className="landscape-layer"
          ref={layerB}
          style={{ opacity: 0 }}
        />
        <canvas className="landscape-orbs" ref={orbs} />
      </div>
      <aside className="trainer" aria-label="Training monitor">
        <div className="trainer-head">
          <span
            className="trainer-pulse"
            data-paused={paused || !enabled}
            aria-hidden="true"
          />
          <p className="trainer-title">
            {home && (
              <span className="trainer-epoch">
                Epoch {epoch + 1}/{sectionLandscapes.length}
              </span>
            )}
            <strong ref={(n) => void (hud.current.name = n)}>
              {current.name}
            </strong>
          </p>
          {enabled && (
            <button
              type="button"
              className="trainer-pause"
              aria-pressed={paused}
              aria-label={
                paused
                  ? "Resume background animation"
                  : "Pause background animation"
              }
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          )}
        </div>
        <div className="trainer-plot">
          <svg viewBox="0 0 120 28" aria-hidden="true">
            <path ref={(n) => void (hud.current.spark = n)} d="M0,4L120,26" />
          </svg>
          <p>
            <span ref={(n) => void (hud.current.note = n)}>{current.note}</span>
            <span className="trainer-loss">
              loss <strong ref={(n) => void (hud.current.loss = n)}>…</strong>
            </span>
          </p>
        </div>
        <ul className="trainer-legend" aria-label="Optimisers">
          {KINDS.map((k) => (
            <li key={k}>
              <i style={{ background: SWATCH[k] }} aria-hidden="true" />
              {optimizerLabels[k]}
            </li>
          ))}
        </ul>
        {home && (
          <nav className="trainer-epochs" aria-label="Epochs">
            {sectionLandscapes.map(([id], i) => (
              <a
                key={id}
                href={"#" + id}
                aria-label={`Epoch ${i + 1}: ${SECTION_LABELS[id]}`}
                aria-current={i === epoch ? "step" : undefined}
                data-done={i < epoch || undefined}
                onClick={(e) => {
                  if (scrollToSection(id)) e.preventDefault();
                }}
              />
            ))}
          </nav>
        )}
      </aside>
    </>
  );
}
