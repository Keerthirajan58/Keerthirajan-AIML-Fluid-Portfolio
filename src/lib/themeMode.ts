/**
 * Light / dark theme. Light is the default identity; a visitor's choice is
 * remembered. The inline script runs before first paint so there is no flash.
 * Switching is instant in the DOM; the stylesheet cross-fades the colours
 * (registered custom properties), so rapid clicks always respond.
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
