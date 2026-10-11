/* eslint-disable @next/next/no-html-link-for-pages -- Native anchor default behavior is the subject under test. */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const runtime = vi.hoisted(() => ({
  enabled: true,
  path: "/",
  scrollTo: vi.fn(),
  destroy: vi.fn(),
  lenisOptions: vi.fn(),
}));
vi.mock("@/components/motion/useMotionEnabled", () => ({
  useMotionEnabled: () => runtime.enabled,
}));
vi.mock("next/navigation", () => ({ usePathname: () => runtime.path }));
vi.mock("lenis", () => ({
  default: class {
    scrollTo = runtime.scrollTo;
    destroy = runtime.destroy;
    constructor(options: unknown) {
      runtime.lenisOptions(options);
    }
  },
}));
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { RouteArrival } from "@/components/motion/RouteArrival";
import { Atmosphere } from "@/components/scene/Atmosphere";
import { MotionFoundation } from "@/components/motion/MotionFoundation";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { DepthCard } from "@/components/ui/DepthCard";
import { localContent } from "@/content/repository";
beforeEach(() => {
  runtime.enabled = true;
  runtime.path = "/";
  vi.clearAllMocks();
});
afterEach(() => {
  vi.useRealTimers();
});
it("automatically advances recommendations, pauses on hover/focus, and supports pointer drag", () => {
  vi.useFakeTimers();
  const { container } = render(
    <RecommendationCarousel items={localContent.testimonials} />,
  );
  const rail = screen.getByRole("region", { name: "Recommendations" });
  Object.defineProperty(rail, "clientWidth", {
    configurable: true,
    value: 100,
  });
  Object.defineProperty(rail.children[1], "offsetLeft", {
    configurable: true,
    value: 124,
  });
  act(() => vi.advanceTimersByTime(12000));
  expect(rail.scrollTo).toHaveBeenLastCalledWith({
    left: 124,
    behavior: "smooth",
  });
  vi.mocked(rail.scrollTo).mockClear();
  fireEvent.mouseEnter(container.firstChild!);
  act(() => vi.advanceTimersByTime(12000));
  expect(rail.scrollTo).not.toHaveBeenCalled();
  fireEvent.mouseLeave(container.firstChild!);
  fireEvent.focus(rail);
  act(() => vi.advanceTimersByTime(12000));
  expect(rail.scrollTo).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  act(() => vi.advanceTimersByTime(12000));
  expect(rail.scrollTo).toHaveBeenCalled();
  Object.defineProperty(rail, "setPointerCapture", { value: vi.fn() });
  const down = new Event("pointerdown", { bubbles: true });
  Object.assign(down, { pointerType: "mouse", clientX: 100, pointerId: 1 });
  fireEvent(rail, down);
  expect(rail).toHaveAttribute("data-dragging", "true");
  const move = new Event("pointermove", { bubbles: true });
  Object.assign(move, { clientX: -24 });
  fireEvent(rail, move);
  fireEvent.scroll(rail);
  expect(rail.scrollLeft).toBe(124);
  fireEvent.pointerUp(rail);
  expect(rail).not.toHaveAttribute("data-dragging");
  fireEvent.pointerCancel(rail);
});
it("handles an empty recommendation source safely", () => {
  const { container } = render(<RecommendationCarousel items={[]} />);
  expect(container).toBeEmptyDOMElement();
});
it("keeps magnetic link hit targets fixed and skips movement for reduced motion", () => {
  const { rerender } = render(<MagneticLink href="#work">Work</MagneticLink>);
  const link = screen.getByRole("link", { name: "Work" });
  const move = new Event("pointermove", { bubbles: true });
  Object.assign(move, { clientX: 400, clientY: 400 });
  fireEvent(link, move);
  expect(link.style.transform).toBe("");
  expect(link).toHaveAttribute("href", "#work");
  fireEvent.pointerLeave(link);
  runtime.enabled = false;
  rerender(<MagneticLink href="#work">Work</MagneticLink>);
  fireEvent(link, move);
  expect(link.style.transform).toBe("");
});
it("never loads motion or decorative cursor when disabled", () => {
  runtime.enabled = false;
  const { container } = render(
    <>
      <SmoothScroll />
      <Atmosphere />
      <MotionFoundation />
    </>,
  );
  expect(runtime.lenisOptions).not.toHaveBeenCalled();
  expect(container.querySelector(".cursor-halo")).toBeNull();
  expect(container.querySelector("canvas")).toBeNull();
  expect(container.querySelector(".atmosphere")).not.toHaveAttribute(
    "data-live",
  );
});
it("keeps Lenis wheel-only and handles same-page links with focus, then cleans up", () => {
  runtime.scrollTo.mockImplementation(
    (target: HTMLElement, options: { onComplete: () => void }) =>
      options.onComplete(),
  );
  const { unmount } = render(
    <>
      <SmoothScroll />
      <a href="#target">Jump</a>
      <section id="target" tabIndex={-1}>
        Target
      </section>
    </>,
  );
  expect(runtime.lenisOptions).toHaveBeenCalledWith(
    expect.objectContaining({ smoothWheel: true, syncTouch: false, autoRaf: true }),
  );
  fireEvent.click(screen.getByText("Jump"));
  expect(runtime.scrollTo).toHaveBeenCalledOnce();
  expect(document.getElementById("target")).toHaveFocus();
  fireEvent.click(screen.getByText("Jump"), { ctrlKey: true });
  expect(runtime.scrollTo).toHaveBeenCalledOnce();
  unmount();
  expect(runtime.destroy).toHaveBeenCalledOnce();
});
it("does not intercept missing targets, external routes or new tabs", () => {
  render(
    <>
      <SmoothScroll />
      <a href="#missing">Missing</a>
      <a href="/projects/pitchpulse">Project</a>
      <a href="#target" target="_blank">
        New tab
      </a>
      <div id="target" />
    </>,
  );
  for (const name of ["Missing", "Project", "New tab"])
    fireEvent.click(screen.getByText(name));
  expect(runtime.scrollTo).not.toHaveBeenCalled();
});
it("route arrival never delays routing and cancels when unmounted", async () => {
  const cancel = vi.fn(),
    animate = vi.fn(() => ({ finished: Promise.resolve(), cancel }));
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  const { rerender, unmount } = render(
    <>
      <main id="main" tabIndex={-1} />
      <RouteArrival />
    </>,
  );
  expect(animate).not.toHaveBeenCalled();
  history.replaceState(null, "", "/");
  runtime.path = "/projects/pitchpulse";
  rerender(
    <>
      <main id="main" tabIndex={-1} />
      <RouteArrival />
    </>,
  );
  await waitFor(() => expect(animate).toHaveBeenCalledOnce());
  expect(document.getElementById("main")).toHaveFocus();
  unmount();
  expect(cancel).toHaveBeenCalled();
});
it("skips route animation under reduced motion and keeps project pages canvas-free", () => {
  runtime.enabled = false;
  const { rerender, container } = render(
    <>
      <main id="main" tabIndex={-1} />
      <RouteArrival />
      <Atmosphere />
    </>,
  );
  runtime.path = "/projects/pitchpulse";
  rerender(
    <>
      <main id="main" tabIndex={-1} />
      <RouteArrival />
      <Atmosphere />
    </>,
  );
  expect(container.querySelector("canvas")).toBeNull();
  expect(container.querySelector(".atmosphere .glow-pointer")).not.toBeNull();
});
it("renders the light field immediately, with no mounting timer", () => {
  vi.useFakeTimers();
  const { container, unmount } = render(<Atmosphere />);
  expect(container.querySelectorAll(".atmosphere .glow")).toHaveLength(4);
  expect(vi.getTimerCount()).toBe(0);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("eases the pointer glow toward a fine pointer and ignores touch", () => {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const { container, unmount } = render(<Atmosphere />);
  const glow = container.querySelector<HTMLElement>(".glow-pointer")!;
  expect(container.querySelector(".atmosphere")).toHaveAttribute(
    "data-live",
    "true",
  );
  const touch = new Event("pointermove");
  Object.assign(touch, { pointerType: "touch", clientX: 10, clientY: 10 });
  window.dispatchEvent(touch);
  expect(frames).toHaveLength(0);
  const mouse = new Event("pointermove");
  Object.assign(mouse, { pointerType: "mouse", clientX: 0, clientY: 0 });
  window.dispatchEvent(mouse);
  expect(frames).toHaveLength(1);
  frames.shift()!(0);
  expect(glow.style.transform).toMatch(/^translate3d\(/);
  unmount();
  expect(glow.style.transform).toBe("");
});
it("limits education depth to fine pointers, resets on departure and respects static mode", () => {
  const { container, rerender } = render(<DepthCard>Education</DepthCard>);
  const card = container.querySelector("article")!;
  card.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 200 }) as DOMRect;
  const move = new Event("pointermove", { bubbles: true });
  Object.assign(move, { clientX: 200, clientY: 0, pointerType: "mouse" });
  fireEvent(card, move);
  expect(card.style.getPropertyValue("--rx")).toBe("2deg");
  expect(card.style.getPropertyValue("--ry")).toBe("2deg");
  fireEvent.pointerLeave(card);
  expect(card.style.getPropertyValue("--rx")).toBe("0deg");
  runtime.enabled = false;
  rerender(<DepthCard>Education</DepthCard>);
  fireEvent(card, move);
  expect(card.style.getPropertyValue("--rx")).toBe("0deg");
});
