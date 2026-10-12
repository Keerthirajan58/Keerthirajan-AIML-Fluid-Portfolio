/**
 * Light / dark theme. Light is the default identity; a visitor's choice is
 * remembered. The inline script runs before first paint so there is no flash.
 */
export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "ks-theme";
export const THEME_COLORS: Record<ThemeMode, string> = {
  light: "#F1F2F4",
  dark: "#0D0C10",
};

export const themeScript = `(function(){var d=document.documentElement,t="light";try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")t="dark"}catch(e){}d.dataset.theme=t;d.style.colorScheme=t})();`;

export function readTheme(): ThemeMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener("ks-themechange", callback);
  return () => window.removeEventListener("ks-themechange", callback);
}

/** Keeps the browser chrome (address bar tint) in step with the page. */
export function syncThemeColor(mode: ThemeMode) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[mode]);
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* Private mode: the choice simply isn't remembered. */
  }
  syncThemeColor(mode);
  window.dispatchEvent(new Event("ks-themechange"));
}

/**
 * Applies a theme with a soft circular reveal that spreads from `origin`
 * (the toggle). Browsers without view transitions, and visitors who prefer
 * reduced motion, get an instant switch.
 */
export function switchTheme(
  mode: ThemeMode,
  origin?: { x: number; y: number },
) {
  const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!("startViewTransition" in document) || still) {
    applyTheme(mode);
    return;
  }
  const transition = document.startViewTransition(() => applyTheme(mode));
  if (!origin) return;
  const { x, y } = origin;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      /* Skipped transition: the theme has still been applied. */
    });
}
