"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { homeSections } from "@/content/site";
import { lossAt, lossPath } from "@/lib/training";
import { scrollToSection } from "@/lib/smoothScroll";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

/**
 * A small joke for ML readers: scrolling "trains" the page. Each section is
 * an epoch and the loss falls as you read; at Contact the run has converged.
 * Hovering explains it and shows epoch dots that jump between sections.
 * Also hosts the pause control for the background's motion.
 */
export function TrainingMonitor() {
  const home = usePathname() === "/";
  const [epoch, setEpoch] = useState(0);
  const [paused, setPaused] = useState(false);
  const loss = useRef<HTMLElement>(null);
  const curve = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!home || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = homeSections.findIndex((s) => s.id === entry.target.id);
          if (index >= 0) setEpoch(index);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    homeSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [home]);

  // Reading progress drives the loss readout; written straight to the DOM.
  useEffect(() => {
    if (!home) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (loss.current) loss.current.textContent = lossAt(p).toFixed(3);
      curve.current?.setAttribute("d", lossPath(p));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [home]);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "running";
  }, [paused]);

  if (!home) return null;
  const converged = epoch === homeSections.length - 1;
  return (
    <aside className="trainer" aria-label="Training monitor">
      <div className="trainer-head">
        <span
          className="trainer-pulse"
          data-paused={paused || undefined}
          aria-hidden="true"
        />
        <p className="trainer-title">
          <span className="trainer-epoch">
            Epoch {epoch + 1} of {homeSections.length}
          </span>
          <strong>{homeSections[epoch].epoch}</strong>
        </p>
        <button
          type="button"
          className="trainer-pause"
          aria-pressed={paused}
          aria-label={
            paused ? "Resume background motion" : "Pause background motion"
          }
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>
      <div className="trainer-plot">
        <svg viewBox="0 0 96 26" aria-hidden="true">
          <path ref={curve} d={lossPath(0)} />
        </svg>
        {converged ? (
          <p className="trainer-done">
            <strong>Converged.</strong> Let&apos;s talk.
          </p>
        ) : (
          <p>
            Loss <strong ref={loss}>{lossAt(0).toFixed(3)}</strong> and falling
          </p>
        )}
      </div>
      <div className="trainer-more">
        <p className="trainer-note">
          Scrolling trains this page. Each section is one epoch.
        </p>
        <nav className="trainer-epochs" aria-label="Epochs">
          {homeSections.map(({ id, epoch: label }, i) => (
            <a
              key={id}
              href={"#" + id}
              aria-label={`Epoch ${i + 1}: ${label}`}
              aria-current={i === epoch ? "step" : undefined}
              data-done={i < epoch || undefined}
              onClick={(e) => {
                if (scrollToSection(id)) e.preventDefault();
              }}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
