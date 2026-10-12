import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({
  path: "/",
  motion: true,
  scrollToSection: vi.fn((id: string) => {
    void id;
    return true;
  }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => runtime.path }));
vi.mock("@/components/motion/useMotionEnabled", () => ({
  useMotionEnabled: () => runtime.motion,
}));
vi.mock("@/lib/smoothScroll", () => ({
  scrollToSection: runtime.scrollToSection,
}));

import { Atmosphere } from "@/components/background/Atmosphere";
import { TrainingMonitor } from "@/components/layout/TrainingMonitor";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { homeSections } from "@/content/site";
import { lossAt } from "@/lib/training";
import {
  THEME_COLORS,
  THEME_STORAGE_KEY,
  applyTheme,
  themeScript,
} from "@/lib/themeMode";

/** Stands in for IntersectionObserver: tests decide which section is live. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  targets: Element[] = [];
  disconnect = vi.fn();
  constructor(public callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  /** Makes the section with `id` the one crossing the middle of the screen. */
  static cross(id: string) {
    for (const observer of FakeObserver.instances) {
      const target = observer.targets.find((t) => t.id === id);
      if (!target) continue;
      act(() =>
        observer.callback(
          [
            { isIntersecting: false, target: observer.targets[0] },
            { isIntersecting: true, target },
          ] as unknown as IntersectionObserverEntry[],
          observer as unknown as IntersectionObserver,
        ),
      );
    }
  }
}

const sections = homeSections.map(({ id }) => (
  <section id={id} key={id} tabIndex={-1} />
));

beforeEach(() => {
  runtime.path = "/";
  runtime.motion = true;
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  document.documentElement.dataset.theme = "light";
  document.documentElement.style.colorScheme = "";
  delete document.documentElement.dataset.motion;
  localStorage.clear();
});
afterEach(() => {
  document.head.innerHTML = "";
});

describe("living background", () => {
  it("paints the light field with drifting glows, an ember and grain", () => {
    const { container } = render(<Atmosphere />);
    const field = container.querySelector(".atmosphere")!;
    expect(field).toHaveAttribute("aria-hidden", "true");
    expect(
      Array.from(field.querySelectorAll(".glow")).map((g) => g.className),
    ).toEqual([
      "glow glow-a",
      "glow glow-b",
      "glow glow-c",
      "glow glow-ember",
      "glow glow-pointer",
    ]);
    expect(field.querySelector(".grain")).not.toBeNull();
    // No canvas, no WebGL: the background is pure CSS.
    expect(field.querySelector("canvas")).toBeNull();
  });

  it("re-lights the field as each section reaches the middle of the screen", () => {
    const { container, unmount } = render(
      <>
        {sections}
        <Atmosphere />
      </>,
    );
    const field = container.querySelector(".atmosphere")!;
    expect(field).toHaveAttribute("data-scene", "hero");
    expect(FakeObserver.instances[0].targets.map((t) => t.id)).toEqual(
      homeSections.map((s) => s.id),
    );
    FakeObserver.cross("experience");
    expect(field).toHaveAttribute("data-scene", "experience");
    FakeObserver.cross("contact");
    expect(field).toHaveAttribute("data-scene", "contact");
    unmount();
    expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled();
  });

  it("keeps a quiet, fixed scene on case studies and without observers", () => {
    runtime.path = "/projects/pitchpulse";
    const { container, unmount } = render(<Atmosphere />);
    expect(container.querySelector(".atmosphere")).toHaveAttribute(
      "data-scene",
      "page",
    );
    expect(FakeObserver.instances).toHaveLength(0);
    unmount();
    runtime.path = "/";
    vi.stubGlobal("IntersectionObserver", undefined);
    const home = render(<Atmosphere />);
    expect(home.container.querySelector(".atmosphere")).toHaveAttribute(
      "data-scene",
      "hero",
    );
  });

  it("only follows a fine pointer when motion is allowed", () => {
    runtime.motion = false;
    const { container } = render(<Atmosphere />);
    expect(container.querySelector(".atmosphere")).not.toHaveAttribute(
      "data-live",
    );
  });
});

describe("training monitor", () => {
  it("trains the page as you read, in plain words", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(
      <>
        {sections}
        <TrainingMonitor />
      </>,
    );
    const monitor = screen.getByRole("complementary", {
      name: "Training monitor",
    });
    expect(monitor).toHaveTextContent("Epoch 1 of 8");
    expect(monitor).toHaveTextContent("Intro");
    expect(monitor).toHaveTextContent(
      `Loss ${lossAt(0).toFixed(3)} and falling`,
    );
    expect(monitor).toHaveTextContent(
      "Scrolling trains this page. Each section is one epoch.",
    );
    // The owner asked for no optimiser or test-function jargon.
    expect(monitor.textContent).not.toMatch(
      /rosenbrock|himmelblau|camel|rastrigin|adam|sgd|momentum|landscape/i,
    );

    FakeObserver.cross("projects");
    expect(monitor).toHaveTextContent("Epoch 4 of 8");
    expect(monitor).toHaveTextContent("Work");
    expect(screen.getByRole("link", { name: "Epoch 4: Work" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(
      screen.getByRole("link", { name: "Epoch 1: Intro" }),
    ).toHaveAttribute("data-done", "true");

    // Reading progress drives the loss readout without re-rendering.
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 1768,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 500,
    });
    fireEvent.scroll(window);
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    expect(monitor).toHaveTextContent(`Loss ${lossAt(0.5).toFixed(3)}`);
    expect(monitor.querySelector("path")?.getAttribute("d")).toMatch(
      /^M1\.0,2\.0/,
    );

    FakeObserver.cross("contact");
    expect(monitor).toHaveTextContent("Epoch 8 of 8");
    expect(monitor).toHaveTextContent("Converged. Let's talk.");
    expect(monitor).not.toHaveTextContent("and falling");
  });

  it("pauses and resumes the background, and jumps between epochs", () => {
    render(
      <>
        {sections}
        <TrainingMonitor />
      </>,
    );
    expect(document.documentElement.dataset.motion).toBe("running");
    fireEvent.click(
      screen.getByRole("button", { name: "Pause background motion" }),
    );
    const resume = screen.getByRole("button", {
      name: "Resume background motion",
    });
    expect(resume).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.motion).toBe("paused");
    fireEvent.click(resume);
    expect(document.documentElement.dataset.motion).toBe("running");

    const epochs = screen.getByRole("navigation", { name: "Epochs" });
    expect(epochs.querySelectorAll("a")).toHaveLength(homeSections.length);
    const skills = screen.getByRole("link", { name: "Epoch 5: Skills" });
    expect(skills).toHaveAttribute("href", "#skills");
    const click = fireEvent.click(skills);
    expect(runtime.scrollToSection).toHaveBeenCalledWith("skills");
    // Handled by the smooth scroller, so the default jump is prevented.
    expect(click).toBe(false);
  });

  it("only appears on the home page", () => {
    runtime.path = "/projects/pitchpulse";
    const { container } = render(<TrainingMonitor />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("theme switch", () => {
  it("switches to dark, remembers the choice and keeps both toggles in step", () => {
    document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLORS.light}">`;
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    );
    const [header, menu] = screen.getAllByRole("button", {
      name: "Dark theme",
    });
    expect(header).toHaveAttribute("aria-pressed", "false");
    expect(header).toHaveAttribute("title", "Switch to dark theme");

    fireEvent.click(header);
    const root = document.documentElement;
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      THEME_COLORS.dark,
    );
    expect(menu).toHaveAttribute("aria-pressed", "true");
    expect(menu).toHaveAttribute("title", "Switch to light theme");

    fireEvent.click(menu);
    expect(root.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(header).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the remembered theme before first paint, light by default", () => {
    const run = () => {
      delete document.documentElement.dataset.theme;
      // The same string the layout inlines in <head>.
      new Function(themeScript)();
      return document.documentElement.dataset.theme;
    };
    expect(run()).toBe("light");
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(run()).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(run()).toBe("light");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(run()).toBe("light");
  });

  it("tints the browser chrome for a returning dark-theme visitor", () => {
    document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLORS.light}">`;
    document.documentElement.dataset.theme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      THEME_COLORS.dark,
    );
  });

  it("responds to every click at once, even mid-switch", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Dark theme" });
    // No animation gates the switch: each click flips the theme immediately
    // (the stylesheet cross-fades the colours and can reverse mid-way).
    for (const expected of ["dark", "light", "dark", "light", "dark"]) {
      fireEvent.click(toggle);
      expect(document.documentElement.dataset.theme).toBe(expected);
      expect(toggle).toHaveAttribute(
        "aria-pressed",
        String(expected === "dark"),
      );
    }
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("still switches when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("private mode");
    });
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("training monitor edge cases", () => {
  it("ignores sections it doesn't know and works without observers", () => {
    render(
      <>
        {sections}
        <TrainingMonitor />
      </>,
    );
    const monitor = screen.getByRole("complementary", {
      name: "Training monitor",
    });
    // An unknown or non-intersecting target leaves the epoch alone.
    const observer = FakeObserver.instances.at(-1)!;
    act(() =>
      observer.callback(
        [
          { isIntersecting: true, target: document.createElement("div") },
          { isIntersecting: false, target: observer.targets[3] },
        ] as unknown as IntersectionObserverEntry[],
        observer as unknown as IntersectionObserver,
      ),
    );
    expect(monitor).toHaveTextContent("Epoch 1 of 8");
  });

  it("reads zero progress on a page that cannot scroll", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("IntersectionObserver", undefined);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 0,
    });
    render(<TrainingMonitor />);
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    expect(frames).toHaveLength(1);
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    expect(screen.getByRole("complementary")).toHaveTextContent(
      `Loss ${lossAt(0).toFixed(3)}`,
    );
  });

  it("keeps the converged message when progress updates arrive", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(
      <>
        {sections}
        <TrainingMonitor />
      </>,
    );
    FakeObserver.cross("contact");
    fireEvent.scroll(window);
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    expect(screen.getByRole("complementary")).toHaveTextContent(
      "Converged. Let's talk.",
    );
  });

  it("lets the browser follow an epoch link it cannot glide to", () => {
    runtime.scrollToSection.mockReturnValueOnce(false);
    render(<TrainingMonitor />);
    const click = fireEvent.click(
      screen.getByRole("link", { name: "Epoch 2: About" }),
    );
    expect(click).toBe(true);
  });
});

describe("living background edge cases", () => {
  it("settles the pointer glow, batching moves into one frame", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const { container } = render(<Atmosphere />);
    const glow = container.querySelector<HTMLElement>(".glow-pointer")!;
    const move = (x: number, y: number, pointerType = "mouse") => {
      const event = new Event("pointermove");
      Object.assign(event, { pointerType, clientX: x, clientY: y });
      window.dispatchEvent(event);
    };
    move(100, 100);
    move(120, 110, "pen"); // a second move reuses the pending frame
    expect(frames).toHaveLength(1);
    // Ease until the glow arrives, then stop asking for frames.
    let ticks = 0;
    while (frames.length && ticks < 500) {
      frames.shift()!(0);
      ticks++;
    }
    expect(frames).toHaveLength(0);
    expect(ticks).toBeGreaterThan(10);
    expect(glow.style.transform).toMatch(/translate3d\(1[12]\d\.\dpx/);
  });
});
