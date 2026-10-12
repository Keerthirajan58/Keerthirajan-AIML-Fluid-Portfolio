import { afterEach, describe, expect, it, vi } from "vitest";
import { colors } from "@/lib/theme";
import {
  applyTheme,
  readTheme,
  subscribeTheme,
  syncThemeColor,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  themeScript,
} from "@/lib/themeMode";

afterEach(() => {
  document.head.innerHTML = "";
  document.documentElement.dataset.theme = "light";
  localStorage.clear();
});

describe("theme mode", () => {
  it("reads, applies and announces the theme", () => {
    const changed = vi.fn();
    const stop = subscribeTheme(changed);
    document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLORS.light}">`;
    applyTheme("dark");
    expect(readTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(changed).toHaveBeenCalledOnce();
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      THEME_COLORS.dark,
    );
    stop();
    applyTheme("light");
    expect(changed).toHaveBeenCalledOnce();
    expect(readTheme()).toBe("light");
  });

  it("tolerates a page without a theme-color tag", () => {
    expect(() => syncThemeColor("dark")).not.toThrow();
  });

  it("runs before paint and defaults to light", () => {
    const run = () => {
      delete document.documentElement.dataset.theme;
      new Function(themeScript)();
      return document.documentElement.dataset.theme;
    };
    expect(run()).toBe("light");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(run()).toBe("dark");
  });

  it("mirrors the brand colours used outside CSS", () => {
    expect(THEME_COLORS.light).toBe(colors.air);
    expect(colors.crimson).toBe("#DF212F");
  });
});
