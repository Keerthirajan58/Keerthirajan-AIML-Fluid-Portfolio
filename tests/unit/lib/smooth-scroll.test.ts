import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HEADER_OFFSET,
  registerScroller,
  scrollToSection,
} from "@/lib/smoothScroll";

describe("smooth section scrolling", () => {
  afterEach(() => {
    registerScroller(null);
    document.body.innerHTML = "";
  });

  it("glides with the registered scroller, updates the hash and focuses the target", () => {
    document.body.innerHTML = '<section id="work" tabindex="-1">Work</section>';
    const scrollTo = vi.fn((_t: HTMLElement, o: { onComplete?: () => void }) =>
      o.onComplete?.(),
    );
    registerScroller({ scrollTo });
    expect(scrollToSection("work")).toBe(true);
    const [, options] = scrollTo.mock.calls[0];
    expect(options).toMatchObject({ offset: -HEADER_OFFSET, duration: 1.15 });
    // Ease-in-out: slow at both ends, halfway at the middle.
    const ease = (options as unknown as { easing: (t: number) => number })
      .easing;
    expect(ease(0)).toBe(0);
    expect(ease(0.25)).toBeCloseTo(0.0625);
    expect(ease(0.5)).toBeCloseTo(0.5);
    expect(ease(0.75)).toBeCloseTo(0.9375);
    expect(ease(1)).toBe(1);
    expect(location.hash).toBe("#work");
    expect(document.activeElement?.id).toBe("work");
  });

  it("falls back to native smooth scrolling and ignores missing targets", () => {
    document.body.innerHTML =
      '<section id="about" tabindex="-1">About</section>';
    const native = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    expect(scrollToSection("missing")).toBe(false);
    expect(scrollToSection("about", { updateHash: false })).toBe(true);
    expect(native).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
  });

  it("jumps instantly under reduced motion, even with a scroller", () => {
    document.body.innerHTML =
      '<section id="skills" tabindex="-1">Skills</section>';
    const scrollTo = vi.fn();
    registerScroller({ scrollTo });
    vi.mocked(window.matchMedia).mockReturnValueOnce({
      matches: true,
    } as MediaQueryList);
    const native = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToSection("skills");
    expect(scrollTo).not.toHaveBeenCalled();
    expect(native).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" }),
    );
  });
});
