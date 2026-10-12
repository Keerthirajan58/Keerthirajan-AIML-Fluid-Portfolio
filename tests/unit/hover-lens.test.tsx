import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, fireEvent } from "@testing-library/react";
import { HoverLens } from "@/components/ui/HoverLens";

const rect = (left: number, top: number, width: number, height: number) =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }) as DOMRect;

function setup() {
  const { container } = render(
    <div className="group">
      <a href="#a" className="button">
        A
      </a>
      <a href="#b" className="button">
        B
      </a>
      <p className="note">Not a button</p>
      <HoverLens items=".button" />
    </div>,
  );
  const group = container.querySelector<HTMLElement>(".group")!;
  const [a, b] = Array.from(group.querySelectorAll<HTMLElement>(".button"));
  const note = group.querySelector<HTMLElement>(".note")!;
  const lens = group.querySelector<HTMLElement>(".hover-lens")!;
  group.getBoundingClientRect = () => rect(100, 50, 400, 200);
  a.getBoundingClientRect = () => rect(120, 60, 90, 40);
  b.getBoundingClientRect = () => rect(230, 60, 110, 40);
  return { group, a, b, note, lens };
}

describe("HoverLens", () => {
  afterEach(() => vi.useRealTimers());

  it("is hidden until a pointer reaches an item, then sits on it", () => {
    const { a, lens } = setup();
    expect(lens).not.toHaveAttribute("data-on");
    expect(lens).toHaveAttribute("aria-hidden", "true");
    fireEvent.pointerOver(a, { pointerType: "mouse" });
    expect(lens).toHaveAttribute("data-on");
    expect(lens.style.getPropertyValue("--hx")).toBe("20px");
    expect(lens.style.getPropertyValue("--hy")).toBe("10px");
    expect(lens.style.getPropertyValue("--hw")).toBe("90px");
    expect(lens.style.getPropertyValue("--hh")).toBe("40px");
  });

  it("glides to the next item and fades out after the pointer leaves", () => {
    vi.useFakeTimers();
    const { group, a, b, note, lens } = setup();
    fireEvent.pointerOver(a, { pointerType: "mouse" });
    fireEvent.pointerOver(b, { pointerType: "mouse" });
    expect(lens.style.getPropertyValue("--hx")).toBe("130px");
    expect(lens.style.getPropertyValue("--hw")).toBe("110px");
    // Crossing a gap keeps it on; it hides only once the grace period ends.
    fireEvent.pointerOver(note, { pointerType: "mouse" });
    expect(lens).toHaveAttribute("data-on");
    fireEvent.pointerOver(a, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    expect(lens).toHaveAttribute("data-on");
    fireEvent.pointerLeave(group, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(300));
    expect(lens).not.toHaveAttribute("data-on");
  });

  it("ignores touch", () => {
    const { a, lens } = setup();
    fireEvent.pointerOver(a, { pointerType: "touch" });
    expect(lens).not.toHaveAttribute("data-on");
  });
});
