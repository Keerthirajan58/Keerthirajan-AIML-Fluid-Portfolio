/**
 * Header behaviour: the liquid lens, the active section while scrolling,
 * and how clicks glide (or don't) to sections.
 */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({ path: "/", scrollToSection: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => runtime.path }));
vi.mock("@/lib/smoothScroll", () => ({
  scrollToSection: runtime.scrollToSection,
}));

import { SiteHeader } from "@/components/layout/SiteHeader";
import { navigation } from "@/content/site";

const frames: FrameRequestCallback[] = [];
const flush = () => act(() => frames.splice(0).forEach((f) => f(0)));
const primary = () => screen.getByRole("navigation", { name: "Primary" });
const link = (name: string) => within(primary()).getByRole("link", { name });

/** Sections in the page, `top` px below the top of the document. */
function sections(tops: Record<string, number>) {
  for (const [id, top] of Object.entries(tops)) {
    const el = document.createElement("section");
    el.id = id;
    el.getBoundingClientRect = () => ({ top: top - window.scrollY }) as DOMRect;
    document.body.append(el);
  }
}

beforeEach(() => {
  runtime.path = "/";
  runtime.scrollToSection.mockReset();
  frames.length = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    frames.push(cb),
  );
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
    function (this: HTMLElement) {
      return navigation.findIndex((n) => n.id === this.dataset.section) * 100;
    },
  );
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(80);
});
afterEach(() => {
  document.querySelectorAll("body > section").forEach((s) => s.remove());
});

describe("liquid lens", () => {
  it("springs under the hovered or focused link and hides with nothing to rest on", () => {
    render(<SiteHeader />);
    const nav = primary();
    expect(nav.style.getPropertyValue("--lens-o")).toBe("0");
    fireEvent.mouseEnter(link("Work"));
    expect(nav.style.getPropertyValue("--lens-x")).toBe("200px");
    expect(nav.style.getPropertyValue("--lens-w")).toBe("80px");
    expect(nav.style.getPropertyValue("--lens-o")).toBe("1");
    // Transitions switch on after the first placement.
    flush();
    expect(nav).toHaveAttribute("data-ready", "true");
    fireEvent.mouseLeave(nav);
    expect(nav.style.getPropertyValue("--lens-o")).toBe("0");
    fireEvent.focus(link("Skills"));
    expect(nav.style.getPropertyValue("--lens-x")).toBe("300px");
    fireEvent.blur(link("Skills"));
    expect(nav.style.getPropertyValue("--lens-o")).toBe("0");
  });

  it("re-measures when the header resizes or the fonts arrive", async () => {
    const observers: (() => void)[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          observers.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    let fontsReady!: () => void;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((r) => (fontsReady = r)) },
    });
    const { unmount } = render(<SiteHeader />);
    fireEvent.mouseEnter(link("About"));
    observers.forEach((cb) => cb());
    await act(async () => fontsReady());
    expect(primary().style.getPropertyValue("--lens-x")).toBe("0px");
    unmount();
    Reflect.deleteProperty(document, "fonts");
  });
});

describe("active section", () => {
  it("follows the section at the reading line while scrolling", () => {
    sections({ about: 0, experience: 400, projects: 900 });
    render(<SiteHeader />);
    // jsdom's window is 768px tall: the reading line sits at 215px.
    expect(link("About")).toHaveAttribute("aria-current", "location");
    flush(); // the lens's first placement
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 500,
    });
    fireEvent.scroll(window);
    fireEvent.scroll(window); // a second event in the same frame is batched
    expect(frames).toHaveLength(1);
    flush();
    expect(link("Experience")).toHaveAttribute("aria-current", "location");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("holds a clicked section while the glide is under way", () => {
    sections({ about: 0, skills: 2000 });
    render(<SiteHeader />);
    fireEvent.click(link("Skills"));
    expect(link("Skills")).toHaveAttribute("aria-current", "location");
    // Mid-glide scroll events don't steal the highlight back.
    fireEvent.scroll(window);
    flush();
    expect(link("Skills")).toHaveAttribute("aria-current", "location");
  });

  it("marks nothing on other pages", () => {
    runtime.path = "/projects/pitchpulse";
    sections({ about: 0 });
    render(<SiteHeader />);
    expect(link("About")).not.toHaveAttribute("aria-current");
    fireEvent.mouseEnter(link("About"));
    fireEvent.mouseLeave(primary());
    expect(primary().style.getPropertyValue("--lens-o")).toBe("0");
  });
});

describe("section links", () => {
  it("glide to a section on the home page", () => {
    sections({ projects: 900 });
    render(<SiteHeader />);
    const click = fireEvent.click(link("Work"));
    expect(click).toBe(false); // default jump prevented
    expect(runtime.scrollToSection).toHaveBeenCalledWith("projects");
  });

  it("let the browser handle modifier clicks, missing sections and other pages", () => {
    sections({ projects: 900 });
    const { unmount } = render(<SiteHeader />);
    expect(fireEvent.click(link("Work"), { metaKey: true })).toBe(true);
    expect(fireEvent.click(link("Work"), { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(link("Work"), { shiftKey: true })).toBe(true);
    expect(fireEvent.click(link("Contact"))).toBe(true); // not in the page
    unmount();
    runtime.path = "/projects/pitchpulse";
    render(<SiteHeader />);
    expect(fireEvent.click(link("Work"))).toBe(true);
    expect(runtime.scrollToSection).not.toHaveBeenCalled();
  });

  it("close the mobile menu first, then glide on the next frame", () => {
    sections({ skills: 1200 });
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const mobile = screen.getByRole("navigation", { name: "Mobile" });
    fireEvent.click(within(mobile).getByRole("link", { name: "Skills" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(runtime.scrollToSection).not.toHaveBeenCalled();
    flush();
    expect(runtime.scrollToSection).toHaveBeenCalledWith("skills");
  });

  it("returns focus to the menu button when the menu closes", () => {
    render(<SiteHeader />);
    const open = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(open);
    fireEvent.click(screen.getByRole("link", { name: /View résumé/ }));
    expect(open).toHaveFocus();
  });
});

describe("late font loads", () => {
  it("are ignored once the header has gone", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    let fontsReady!: () => void;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((r) => (fontsReady = r)) },
    });
    const { unmount } = render(<SiteHeader />);
    unmount();
    await expect(act(async () => fontsReady())).resolves.not.toThrow();
    Reflect.deleteProperty(document, "fonts");
  });
});
