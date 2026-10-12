import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({
  path: "/",
  loaders: [] as (() => Promise<unknown>)[],
}));
vi.mock("next/navigation", () => ({ usePathname: () => runtime.path }));
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) => {
    runtime.loaders.push(loader);
    return function Loaded() {
      return <span data-testid="lazy" />;
    };
  },
}));

import { AnchorGlide } from "@/components/motion/AnchorGlide";
import { MotionFoundation } from "@/components/motion/MotionFoundation";
import { RouteArrival } from "@/components/motion/RouteArrival";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";

/** Makes the motion media query match (or not) for the next renders. */
function motionQuery(matches: boolean) {
  const listeners = new Set<() => void>();
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) =>
          listeners.delete(cb),
      }) as unknown as MediaQueryList,
  );
  return listeners;
}

afterEach(() => {
  runtime.path = "/";
  history.replaceState(null, "", "/");
  Reflect.deleteProperty(navigator, "connection");
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    value: 8,
  });
});

describe("motion preference", () => {
  it("allows motion only for a fine pointer without reduced motion or data saver", () => {
    motionQuery(true);
    expect(renderHook(() => useMotionEnabled()).result.current).toBe(true);
    motionQuery(false);
    expect(renderHook(() => useMotionEnabled()).result.current).toBe(false);
    motionQuery(true);
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: Object.assign(new EventTarget(), { saveData: true }),
    });
    expect(renderHook(() => useMotionEnabled()).result.current).toBe(false);
    Reflect.deleteProperty(navigator, "connection");
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 2,
    });
    expect(renderHook(() => useMotionEnabled()).result.current).toBe(false);
    Object.defineProperty(navigator, "hardwareConcurrency", {
      configurable: true,
      value: 0,
    });
    expect(renderHook(() => useMotionEnabled()).result.current).toBe(true);
  });

  it("listens for changes and stops on unmount", () => {
    const listeners = motionQuery(true);
    const connection = new EventTarget();
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
    const add = vi.spyOn(connection, "addEventListener");
    const remove = vi.spyOn(connection, "removeEventListener");
    const { unmount } = renderHook(() => useMotionEnabled());
    expect(listeners.size).toBe(1);
    expect(add).toHaveBeenCalledWith("change", expect.any(Function));
    unmount();
    expect(listeners.size).toBe(0);
    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
  });
});

describe("motion foundation", () => {
  it("loads Lenis wheel smoothing only when motion is allowed", async () => {
    motionQuery(false);
    const { queryByTestId, rerender } = render(<MotionFoundation />);
    expect(queryByTestId("lazy")).toBeNull();
    motionQuery(true);
    rerender(<MotionFoundation key="again" />);
    expect(queryByTestId("lazy")).not.toBeNull();
    // The lazy chunk resolves to the smooth scroller itself.
    expect(await runtime.loaders[0]()).toBe(SmoothScroll);
  });
});

describe("anchor glide", () => {
  it("leaves clicks it shouldn't handle to the browser", () => {
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { getByText } = render(
      <>
        <AnchorGlide />
        <a href="#target">Jump</a>
        <a href="#target" download>
          Download
        </a>
        <section id="target" tabIndex={-1} />
      </>,
    );
    const jump = getByText("Jump");
    expect(fireEvent.click(jump, { button: 1 })).toBe(true);
    expect(fireEvent.click(jump, { altKey: true })).toBe(true);
    expect(fireEvent.click(getByText("Download"))).toBe(true);
    // Already handled elsewhere.
    const handled = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    handled.preventDefault();
    jump.dispatchEvent(handled);
    // A click that doesn't start on an element.
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(scroll).not.toHaveBeenCalled();
    // A plain click glides.
    expect(fireEvent.click(jump)).toBe(false);
    expect(scroll).toHaveBeenCalledOnce();
  });
});

describe("route arrival", () => {
  const routes = (path: string) => {
    runtime.path = path;
    return (
      <>
        <main id="main" tabIndex={-1} />
        <RouteArrival />
      </>
    );
  };

  it("keeps the hash target's focus and survives a failing animation", () => {
    motionQuery(true);
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: () => {
        throw new Error("no Web Animations");
      },
    });
    const { rerender } = render(routes("/"));
    history.replaceState(null, "", "/projects/pitchpulse#gallery");
    expect(() => rerender(routes("/projects/pitchpulse"))).not.toThrow();
    expect(document.getElementById("main")).not.toHaveFocus();
  });

  it("does nothing without a main region", () => {
    const { rerender } = render(<RouteArrival />);
    runtime.path = "/projects/pitchpulse";
    act(() => rerender(<RouteArrival />));
    expect(document.activeElement).toBe(document.body);
  });
});
