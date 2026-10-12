import { describe, expect, it } from "vitest";
import { logoShape, monogram } from "@/lib/credentials";
import { endYear, yearOf } from "@/lib/dates";
import { splitByTerms } from "@/lib/highlight";
import { typingOffsets } from "@/lib/typing";

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
    expect(splitByTerms("C++ and AWS", ["C++"])).toEqual([
      { text: "C++", hit: true },
      { text: " and AWS", hit: false },
    ]);
  });
});

describe("typing schedule", () => {
  it("gives each token a start step, one step per character and space", () => {
    expect(
      typingOffsets([{ text: "I" }, { text: "build" }, { text: "AI." }]),
    ).toEqual([0, 2, 8]);
    expect(typingOffsets([])).toEqual([]);
    // Characters are counted by code point, so emoji take one step.
    expect(typingOffsets([{ text: "a😀" }, { text: "b" }])).toEqual([0, 3]);
  });
});

describe("dates", () => {
  it("reads the year of a date and the end year of a range", () => {
    expect(yearOf("May 2023")).toBe("2023");
    expect(yearOf("Spring")).toBe("");
    expect(endYear("May 2025 - Aug 2025")).toBe("2025");
    expect(endYear("Nov 2021 - Dec 2021 ")).toBe("2021");
    expect(endYear("Present")).toBe("");
  });
});

describe("credential helpers", () => {
  it("sorts logos into marks, compact logos and long wordmarks", () => {
    expect(logoShape({ width: 96, height: 96 })).toBe("mark");
    expect(logoShape({ width: 216, height: 96 })).toBe("compact");
    expect(logoShape({ width: 686, height: 96 })).toBe("wordmark");
  });
  it("makes two letters for issuers without a logo", () => {
    expect(monogram("Example Academy")).toBe("EA");
    expect(monogram("udemy online")).toBe("UO");
    expect(monogram("Coursera")).toBe("Co");
  });
});
