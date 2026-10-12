"use client";
import { useEffect, useSyncExternalStore } from "react";
import {
  readTheme,
  subscribeTheme,
  switchTheme,
  syncThemeColor,
  type ThemeMode,
} from "@/lib/themeMode";

/** Sun/moon switch. Pressed = dark theme on. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const mode = useSyncExternalStore<ThemeMode>(
    subscribeTheme,
    readTheme,
    () => "light",
  );
  const dark = mode === "dark";
  // A returning dark-theme visitor: tint the browser chrome to match.
  useEffect(() => syncThemeColor(mode), [mode]);
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      aria-pressed={dark}
      aria-label="Dark theme"
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        switchTheme(dark ? "light" : "dark", {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        });
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <g className="theme-sun">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect
              key={a}
              x="11.2"
              y="1.6"
              width="1.6"
              height="3.4"
              rx="0.8"
              fill="currentColor"
              transform={`rotate(${a} 12 12)`}
            />
          ))}
        </g>
        <path
          className="theme-moon"
          d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
