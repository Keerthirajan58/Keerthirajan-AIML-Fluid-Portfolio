import { afterEach, describe, expect, it, vi } from "vitest";
import { splitByTerms } from "@/lib/highlight";
import { heroSentence, heroTokens } from "@/content/heroTokens";
import {
  registerScroller,
  scrollToSection,
  HEADER_OFFSET,
} from "@/lib/smoothScroll";
import { findPublicImage, getImageSize } from "@/lib/imageSize";
import { mailtoHref } from "@/lib/contact";

describe("term highlighting", () => {
  it("marks whole terms case-insensitively, longest first, flexible on spacing", () => {
    const parts = splitByTerms(
      "Used LoRA/PEFT with pytorch and Hugging Face Transformers; not PyTorchLite.",
      ["PyTorch", "LoRA / PEFT", "Hugging Face", "Hugging Face Transformers"],
    );
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual([
      "LoRA/PEFT",
      "pytorch",
      "Hugging Face Transformers",
    ]);
    expect(parts.map((p) => p.text).join("")).toBe(
      "Used LoRA/PEFT with pytorch and Hugging Face Transformers; not PyTorchLite.",
    );
  });
  it("returns the text untouched when there is nothing to find", () => {
    expect(splitByTerms("plain", [])).toEqual([{ text: "plain", hit: false }]);
    expect(splitByTerms("plain", ["  "])).toEqual([
      { text: "plain", hit: false },
    ]);
  });
});

describe("hero tokens", () => {
  it("spell out exactly the hero sentence, with sane probabilities", () => {
    expect(heroTokens.map((t) => t.text).join(" ")).toBe(heroSentence);
    for (const t of heroTokens) {
      expect(t.alts).toHaveLength(3);
      const total = t.alts.reduce((sum, [, p]) => sum + p, 0);
      expect(total).toBeLessThanOrEqual(1);
      expect(t.alts[0][1]).toBe(Math.max(...t.alts.map(([, p]) => p)));
    }
  });
});

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
    expect(scrollTo).toHaveBeenCalledWith(
      document.getElementById("work"),
      expect.objectContaining({
        offset: -HEADER_OFFSET,
        duration: expect.any(Number),
      }),
    );
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
});

describe("image helpers", () => {
  it("reads true cover dimensions and falls back for remote or missing files", () => {
    expect(
      getImageSize("/images/projects/siri-core-modeling/cover.jpg"),
    ).toEqual({
      width: 1044,
      height: 1388,
    });
    expect(getImageSize("https://cdn.prod.website-files.com/x.jpg")).toEqual({
      width: 1200,
      height: 900,
    });
    expect(getImageSize("/images/does-not-exist.jpg")).toEqual({
      width: 1200,
      height: 900,
    });
    expect(findPublicImage("images/profile")).toBe("/images/profile.jpg");
    expect(findPublicImage("images/no-such-photo")).toBeNull();
  });
});

describe("mail fallback", () => {
  it("drafts a subject and body the visitor can send", () => {
    const href = mailtoHref("me@example.com", {
      name: "Ada",
      email: "ada@example.com",
      message: "Hello there",
      topic: "Job opportunity",
    });
    expect(href.startsWith("mailto:me@example.com?subject=")).toBe(true);
    expect(decodeURIComponent(href)).toContain(
      "Job opportunity: hello from Ada",
    );
    expect(decodeURIComponent(href)).toContain(
      "Hello there\n\nAda (ada@example.com)",
    );
  });
});
