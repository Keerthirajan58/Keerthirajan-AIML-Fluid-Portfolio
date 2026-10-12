/**
 * Less common paths through the interactive pieces: resizes, keyboard
 * focus, repeated choices and frames that land after unmount.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import { Section } from "@/components/ui/Section";
import { HoverLens } from "@/components/ui/HoverLens";
import { useChipIndicators } from "@/components/ui/useChipIndicators";
import { ProjectGallery } from "@/components/case-study/ProjectGallery";
import { ExperienceJourney } from "@/components/sections/experience/ExperienceJourney";
import { ProjectExplorer } from "@/components/sections/projects/ProjectExplorer";
import { ProjectNotes } from "@/components/sections/projects/ProjectNotes";
import { SkillsCloud } from "@/components/sections/skills/SkillsCloud";
import { RecommendationCarousel } from "@/components/sections/testimonials/RecommendationCarousel";

/** A ResizeObserver whose callback the test triggers. */
function fakeResizeObserver() {
  const callbacks: (() => void)[] = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: () => void) {
        callbacks.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  return () => callbacks.forEach((cb) => cb());
}

/** requestAnimationFrame that queues until the test flushes it. */
function manualFrames() {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    frames.push(cb),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return () => act(() => frames.splice(0).forEach((f) => f(0)));
}

describe("section heading", () => {
  it("renders a title without an id", () => {
    render(<Section title="Untitled region">Body</Section>);
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveAttribute("id");
  });
});

describe("experience journey", () => {
  it("ignores a frame that lands after unmount", () => {
    const flush = manualFrames();
    const { unmount } = render(
      <ExperienceJourney>
        <ol>
          <li className="timeline-item">Role</li>
        </ol>
      </ExperienceJourney>,
    );
    unmount();
    expect(() => flush()).not.toThrow();
  });
});

describe("work grid", () => {
  it("re-lays rows when the width changes or fonts arrive, but not for height-only resizes", async () => {
    const flush = manualFrames();
    const resize = fakeResizeObserver();
    let width = 1000;
    vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(
      function (this: Element) {
        return this.classList.contains("project-grid") ? width : 0;
      },
    );
    let fontsReady!: () => void;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((r) => (fontsReady = r)) },
    });
    render(
      <ProjectExplorer
        items={[{ slug: "a", filters: ["web"], card: <p>a</p> }]}
      />,
    );
    flush();
    const slot = document.querySelector<HTMLElement>(".project-slot")!;
    expect(slot.style.width).toBe(`${(1000 - 36) / 3}px`);
    resize(); // same width: nothing to do
    width = 600;
    resize();
    flush();
    expect(slot.style.width).toBe(`${(600 - 18) / 2}px`);
    await act(async () => fontsReady());
    flush();
    Reflect.deleteProperty(document, "fonts");
  });

  it("skips layout while the grid has no width yet", () => {
    manualFrames();
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(0);
    render(
      <ProjectExplorer items={[{ slug: "a", filters: [], card: <p>a</p> }]} />,
    );
    expect(document.querySelector(".project-grid")).not.toHaveAttribute(
      "data-masonry",
    );
  });
});

describe("project notes", () => {
  it("only traps Tab at the edges of the dialog", () => {
    render(
      <ProjectNotes title="Demo">
        <a href="#x">Middle link</a>
        <a href="#y">Last link</a>
      </ProjectNotes>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Project notes: Demo" }),
    );
    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Close project notes" });
    const middle = screen.getByRole("link", { name: "Middle link" });
    const last = screen.getByRole("link", { name: "Last link" });
    // Mid-dialog Tab and other keys are left to the browser.
    middle.focus();
    expect(fireEvent.keyDown(dialog, { key: "Tab" })).toBe(true);
    expect(fireEvent.keyDown(dialog, { key: "Enter" })).toBe(true);
    // Tab off the last control wraps to the first, and back again.
    last.focus();
    expect(fireEvent.keyDown(dialog, { key: "Tab" })).toBe(false);
    expect(close).toHaveFocus();
    expect(fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })).toBe(
      false,
    );
    expect(last).toHaveFocus();
  });
});

describe("skills tabs", () => {
  it("does nothing when the chosen tab is clicked again", () => {
    render(
      <SkillsCloud
        categories={["Area"]}
        skills={[{ name: "Skill", categories: ["Area"], evidence: [] }]}
      />,
    );
    const all = screen.getByRole("button", { name: /All/ });
    fireEvent.click(all);
    expect(document.getElementById("skill-cloud")).not.toHaveAttribute(
      "data-wave",
    );
  });
});

describe("recommendation dots", () => {
  it("jump to a recommendation and pause the rotation", () => {
    render(<RecommendationCarousel items={localContent.testimonials} />);
    const second = screen.getByRole("button", {
      name: `Recommendation by ${localContent.testimonials[1].name}`,
    });
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 / 2")).toBeVisible();
  });
});

describe("gallery edges", () => {
  it("ignores resizes that keep the width and keys other than arrows", () => {
    const resize = fakeResizeObserver();
    manualFrames();
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(800);
    render(
      <ProjectGallery
        images={[
          { src: "/images/a.jpg", width: 1600, height: 1000 },
          { src: "/images/b.jpg", width: 1000, height: 1000 },
        ]}
        title="Demo"
      />,
    );
    resize();
    fireEvent.click(screen.getByRole("button", { name: "Open image 1 of 2" }));
    const dialog = screen.getByRole("dialog");
    expect(fireEvent.keyDown(dialog, { key: "Enter" })).toBe(true);
    expect(dialog).toHaveTextContent("1 / 2");
  });
});

describe("hover lens edges", () => {
  function setup() {
    render(
      <div className="group">
        <button className="item">One</button>
        <button className="item">Two</button>
        <HoverLens items=".item" />
      </div>,
    );
    const [one, two] = screen.getAllByRole("button");
    const lens = document.querySelector<HTMLElement>(".hover-lens")!;
    return { one, two, lens };
  }

  it("follows keyboard focus, stays put on repeat hovers and settles after lifts", () => {
    vi.useFakeTimers();
    const flush = manualFrames();
    const { one, two, lens } = setup();
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ":focus-visible" || matches.call(this, selector);
    });
    // Keyboard focus shows the lens.
    fireEvent.focusIn(two);
    expect(two).toHaveAttribute("data-lensed");
    // Hovering the same item again keeps it, cancelling any pending hide.
    fireEvent.pointerOver(two, { pointerType: "mouse" });
    fireEvent.focusOut(two);
    fireEvent.pointerOver(two, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    expect(lens).toHaveAttribute("data-on");
    // A finished hover lift on the current item re-places the lens; other
    // transitions don't.
    fireEvent.transitionEnd(one);
    fireEvent.transitionEnd(two);
    // Pointer movement re-measures once per frame.
    fireEvent.pointerMove(two);
    fireEvent.pointerMove(two);
    flush();
    expect(lens.style.getPropertyValue("--hw")).toBe("0px");
    vi.useRealTimers();
  });

  it("ignores focus that is not from the keyboard or not on an item", () => {
    const { one, lens } = setup();
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, "matches")
      .mockImplementation(function (this: Element, selector: string) {
        return selector !== ":focus-visible" && matches.call(this, selector);
      });
    fireEvent.focusIn(one);
    expect(lens).not.toHaveAttribute("data-on");
    spy.mockRestore();
    fireEvent.focusIn(document.querySelector(".group")!);
    expect(lens).not.toHaveAttribute("data-on");
    // No current item: pointer movement and transitions do nothing.
    fireEvent.pointerMove(one);
    fireEvent.transitionEnd(one);
    expect(lens).not.toHaveAttribute("data-on");
  });
});

describe("chip indicators edges", () => {
  function Chips() {
    const ref = useRef<HTMLDivElement>(null);
    const [chosen, setChosen] = useState("a");
    useChipIndicators(ref, chosen);
    return (
      <div ref={ref}>
        {["a", "b"].map((id) => (
          <button
            key={id}
            aria-pressed={chosen === id}
            onClick={() => setChosen(id)}
          >
            {id}
          </button>
        ))}
      </div>
    );
  }

  it("moves the lens on keyboard focus, even where :focus-visible is unknown", () => {
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.textContent === "b" ? 50 : 0;
      },
    );
    const { container } = render(<Chips />);
    const group = container.firstChild as HTMLElement;
    const b = screen.getByRole("button", { name: "b" });
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, "matches")
      .mockImplementation(function (this: Element, selector: string) {
        if (selector === ":focus-visible")
          throw new SyntaxError("unknown pseudo-class");
        return matches.call(this, selector);
      });
    fireEvent.focusIn(b);
    expect(group.style.getPropertyValue("--lx")).toBe("50px");
    fireEvent.focusOut(b);
    expect(group.style.getPropertyValue("--lx")).toBe("0px");
    // Mouse focus (not :focus-visible) leaves the lens on the choice.
    spy.mockImplementation(function (this: Element, selector: string) {
      return selector !== ":focus-visible" && matches.call(this, selector);
    });
    fireEvent.focusIn(b);
    expect(group.style.getPropertyValue("--lx")).toBe("0px");
    // Leaving without a hovered chip changes nothing.
    fireEvent.pointerLeave(group);
    expect(group.style.getPropertyValue("--lx")).toBe("0px");
  });
});

describe("more lens and chip edges", () => {
  it("measures the lens in the group's own units while it is scaled", () => {
    render(
      <div className="group">
        <button className="item" style={{ borderRadius: "999px" }}>
          One
        </button>
        <HoverLens items=".item" />
      </div>,
    );
    const group = document.querySelector<HTMLElement>(".group")!;
    const item = screen.getByRole("button");
    // The group is drawn at half size (a scroll animation scaling it).
    group.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(400);
    item.getBoundingClientRect = () =>
      ({ left: 10, top: 5, width: 50, height: 20 }) as DOMRect;
    fireEvent.pointerOver(item, { pointerType: "mouse" });
    const lens = document.querySelector<HTMLElement>(".hover-lens")!;
    expect(lens.style.getPropertyValue("--hx")).toBe("20px");
    expect(lens.style.getPropertyValue("--hw")).toBe("100px");
    expect(lens.style.getPropertyValue("--hr")).toBe("999px");
  });

  it("ignores matching items outside its group and frames after it hides", () => {
    vi.useFakeTimers();
    const flush = manualFrames();
    render(
      <div className="item outer">
        <div className="group">
          <span>Plain text</span>
          <button className="item">Inner</button>
          <HoverLens items=".item" />
        </div>
      </div>,
    );
    const lens = document.querySelector<HTMLElement>(".hover-lens")!;
    // The closest match is the outer element, which isn't in the group.
    fireEvent.pointerOver(screen.getByText("Plain text"), {
      pointerType: "mouse",
    });
    expect(lens).not.toHaveAttribute("data-on");
    const inner = screen.getByRole("button");
    fireEvent.pointerOver(inner, { pointerType: "mouse" });
    fireEvent.pointerMove(inner);
    fireEvent.pointerLeave(document.querySelector(".group")!);
    act(() => vi.advanceTimersByTime(300));
    expect(() => flush()).not.toThrow();
    expect(lens).not.toHaveAttribute("data-on");
    vi.useRealTimers();
  });

  it("tolerates an unattached ref, no chosen chip and chips nested too deep", () => {
    const ref = { current: null };
    expect(() =>
      render(<ChipsWith refOverride={ref} chosenNone={false} />),
    ).not.toThrow();
    const { container } = render(<ChipsWith chosenNone />);
    const group = container.firstChild as HTMLElement;
    expect(group.style.getPropertyValue("--ix")).toBe("");
    // A button inside a wrapper is not one of the group's chips.
    fireEvent.pointerOver(screen.getAllByRole("button", { name: "deep" })[0], {
      pointerType: "mouse",
    });
    expect(group.style.getPropertyValue("--lx")).toBe("");
  });

  function ChipsWith({
    refOverride,
    chosenNone,
  }: {
    refOverride?: { current: HTMLDivElement | null };
    chosenNone: boolean;
  }) {
    const own = useRef<HTMLDivElement>(null);
    useChipIndicators(refOverride ?? own, "x", {
      chosen: chosenNone ? () => null : undefined,
    });
    return (
      <div ref={refOverride ? undefined : own}>
        <span>
          <button>deep</button>
        </span>
      </div>
    );
  }

  it("re-places only when a different chip is hovered", () => {
    function Flat() {
      const ref = useRef<HTMLDivElement>(null);
      useChipIndicators(ref, "a");
      return (
        <div ref={ref}>
          <button aria-pressed="true">a</button>
          <button aria-pressed="false">b</button>
        </div>
      );
    }
    const offsets = vi
      .spyOn(HTMLElement.prototype, "offsetLeft", "get")
      .mockImplementation(function (this: HTMLElement) {
        return this.textContent === "b" ? 40 : 0;
      });
    const { container } = render(<Flat />);
    const group = container.firstChild as HTMLElement;
    const b = screen.getByRole("button", { name: "b" });
    fireEvent.pointerOver(b, { pointerType: "mouse" });
    expect(group.style.getPropertyValue("--lx")).toBe("40px");
    // Hovering the same chip again doesn't re-measure.
    offsets.mockReturnValue(99);
    fireEvent.pointerOver(b, { pointerType: "mouse" });
    expect(group.style.getPropertyValue("--lx")).toBe("40px");
  });
});

describe("carousel edges", () => {
  it("handles scrolling, touch drags and other keys without pausing to drag", () => {
    render(<RecommendationCarousel items={localContent.testimonials} />);
    const rail = screen.getByRole("region", { name: "Recommendations" });
    Object.defineProperty(rail, "clientWidth", {
      configurable: true,
      value: 100,
    });
    rail.scrollLeft = 100;
    fireEvent.scroll(rail);
    expect(screen.getByText("2 / 2")).toBeVisible();
    // Touch scrolls natively: no drag state.
    fireEvent.pointerDown(rail, { pointerType: "touch" });
    expect(rail).not.toHaveAttribute("data-dragging");
    fireEvent.pointerMove(rail, { clientX: 10 });
    expect(rail.scrollLeft).toBe(100);
    expect(fireEvent.keyDown(rail, { key: "Home" })).toBe(true);
  });
});

describe("launcher and timeline edges", () => {
  it("renders the launcher without extra classes", async () => {
    const { ContactLauncher } =
      await import("@/components/sections/contact/ContactLauncher");
    render(<ContactLauncher email="me@example.com">Hi</ContactLauncher>);
    expect(screen.getByRole("button", { name: "Hi" })).toHaveAttribute(
      "class",
      "contact-launch ",
    );
  });

  it("does nothing on a timeline without roles", () => {
    const flush = manualFrames();
    render(<ExperienceJourney>No roles yet</ExperienceJourney>);
    flush();
    expect(
      document
        .querySelector<HTMLElement>(".experience-journey")!
        .style.getPropertyValue("--progress"),
    ).toBe("");
  });

  it("drops a late font-triggered layout after the grid unmounts", async () => {
    const flush = manualFrames();
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(900);
    let fontsReady!: () => void;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((r) => (fontsReady = r)) },
    });
    const { unmount } = render(
      <ProjectExplorer items={[{ slug: "a", filters: [], card: <p>a</p> }]} />,
    );
    unmount();
    await act(async () => fontsReady());
    expect(() => flush()).not.toThrow();
    Reflect.deleteProperty(document, "fonts");
  });
});

describe("final edges", () => {
  /** Lets the motion query match, so motion-only paths render. */
  const allowMotion = () =>
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

  it("rotates recommendations only when visible, and its own play button never pauses it", () => {
    vi.useFakeTimers();
    allowMotion();
    render(<RecommendationCarousel items={localContent.testimonials} />);
    const rail = screen.getByRole("region", { name: "Recommendations" });
    vi.mocked(rail.scrollTo).mockClear();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    act(() => vi.advanceTimersByTime(12000));
    expect(rail.scrollTo).not.toHaveBeenCalled();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    // Focusing the play/pause control leaves playback to that control.
    const playback = screen.getByRole("button", { name: "Pause" });
    fireEvent.focus(playback);
    act(() => vi.advanceTimersByTime(12000));
    expect(rail.scrollTo).toHaveBeenCalled();
    fireEvent.keyDown(rail, { key: "ArrowRight" });
    expect(screen.getByText("2 / 2")).toBeVisible();
    vi.useRealTimers();
  });

  it("never rotates a single recommendation", () => {
    vi.useFakeTimers();
    allowMotion();
    render(
      <RecommendationCarousel items={localContent.testimonials.slice(0, 1)} />,
    );
    const rail = screen.getByRole("region", { name: "Recommendations" });
    vi.mocked(rail.scrollTo).mockClear();
    act(() => vi.advanceTimersByTime(24000));
    expect(rail.scrollTo).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("ignores events that start on text rather than an element", () => {
    render(
      <div className="group">
        <button className="item">Label</button>
        <HoverLens items=".item" />
      </div>,
    );
    const text = screen.getByRole("button").firstChild!;
    fireEvent.pointerOver(text, { pointerType: "mouse" });
    expect(document.querySelector(".hover-lens")).not.toHaveAttribute(
      "data-on",
    );
    function Flat() {
      const ref = useRef<HTMLDivElement>(null);
      useChipIndicators(ref, "a");
      return (
        <div ref={ref} data-testid="chips">
          <button aria-pressed="true">a</button>
        </div>
      );
    }
    render(<Flat />);
    const chipText = screen.getByRole("button", { name: "a" }).firstChild!;
    fireEvent.pointerOver(chipText, { pointerType: "mouse" });
    expect(screen.getByTestId("chips").style.getPropertyValue("--lx")).toBe(
      "0px",
    );
  });
});
