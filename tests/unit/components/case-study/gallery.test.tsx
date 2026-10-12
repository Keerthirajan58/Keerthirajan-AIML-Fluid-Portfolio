import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectGallery } from "@/components/case-study/ProjectGallery";

describe("case-study gallery", () => {
  const images = [
    { src: "/images/a.jpg", width: 1600, height: 1000 },
    { src: "/images/b.jpg", width: 900, height: 1200 },
    { src: "/images/c.jpg", width: 1200, height: 1200 },
  ];
  /** jsdom has no layout: give the wall a width the test controls. */
  const wallWidth = (width: () => number) =>
    vi
      .spyOn(Element.prototype, "clientWidth", "get")
      .mockImplementation(function (this: Element) {
        return this.classList.contains("gallery-wall") ? width() : 0;
      });

  it("lays the images out in justified rows, each at its own shape", () => {
    let width = 1000;
    wallWidth(() => width);
    const resize: { callback?: () => void } = {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize.callback = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<ProjectGallery images={images} title="Demo" />);
    const wall = document.querySelector<HTMLElement>(".gallery-wall")!;
    const tiles = Array.from(
      wall.querySelectorAll<HTMLElement>(".gallery-tile"),
    );
    expect(
      tiles.map((t) => t.querySelector("img")!.getAttribute("src")),
    ).toEqual(images.map((i) => i.src));
    // Portrait stays portrait: each tile carries its image's own shape.
    expect(tiles.map((t) => t.style.getPropertyValue("--ratio"))).toEqual([
      "1.6000",
      "0.7500",
      "1.0000",
    ]);
    expect(wall).toHaveAttribute("data-justified", "true");
    const size = (t: HTMLElement) => ({
      x: parseFloat(t.style.getPropertyValue("--x")),
      y: parseFloat(t.style.getPropertyValue("--y")),
      w: parseFloat(t.style.width),
      h: parseFloat(t.style.height),
    });
    // 1000px wide: one row, one height, edge to edge.
    const row = (1000 - 2 * 14) / 3.35;
    tiles.map(size).forEach((t, i) => {
      expect(t.y).toBe(0);
      expect(t.h).toBeCloseTo(row);
      expect(t.w / t.h).toBeCloseTo([1.6, 0.75, 1][i]);
    });
    expect(size(tiles[0]).x).toBe(0);
    expect(size(tiles[2]).x + size(tiles[2]).w).toBeCloseTo(1000);
    expect(parseFloat(wall.style.height)).toBeCloseTo(row);
    // On a phone-width wall the rows re-balance for the new width.
    width = 500;
    resize.callback?.();
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    tiles
      .map(size)
      .forEach((t) => expect(t.h).toBeCloseTo((500 - 2 * 10) / 3.35));
    expect(size(tiles[2]).x + size(tiles[2]).w).toBeCloseTo(500);
  });

  it("gives each image a size hint from its own shape", () => {
    render(<ProjectGallery images={images.slice(0, 2)} title="Pair" />);
    expect(
      Array.from(document.querySelectorAll(".gallery-tile img")).map((img) =>
        img.getAttribute("sizes"),
      ),
    ).toEqual([
      "(max-width: 879px) 60vw, 576px",
      "(max-width: 879px) 60vw, 270px",
    ]);
  });

  it("opens the chosen image and restores focus after lightbox navigation", async () => {
    render(<ProjectGallery images={images} title="Demo" />);
    const opener = screen.getByRole("button", { name: "Open image 2 of 3" });
    await userEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[1].src,
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "alt",
      "Demo, image 2",
    );
    expect(dialog).toHaveTextContent("2 / 3");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Next full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[2].src,
    );
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[0].src,
    );
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Previous full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[1].src,
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close image viewer" }),
    );
    expect(opener).toHaveFocus();
  });

  it("renders no controls for empty media", () => {
    const { container } = render(<ProjectGallery images={[]} title="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });
});
