import { describe, expect, it, vi } from "vitest";

/** Fake files under /public, keyed by their public path. */
const files = vi.hoisted(() => new Map<string, Buffer>());
const fakeFs = vi.hoisted(() => async (original: () => Promise<unknown>) => {
  const fs = (await original()) as typeof import("node:fs");
  const key = (p: unknown) => String(p).split("/public")[1] ?? "";
  const existsSync = (p: string) => files.has(key(p));
  const readFileSync = (p: string) => {
    const file = files.get(key(p));
    if (!file) throw new Error("ENOENT");
    return file;
  };
  return {
    ...fs,
    existsSync,
    readFileSync,
    default: { ...fs, existsSync, readFileSync },
  };
});
// Vitest may resolve the module's "node:fs" import as "fs": mock both.
vi.mock("node:fs", fakeFs);
vi.mock("fs", fakeFs);

import {
  findPublicImage,
  getImageSize,
  projectCover,
} from "@/lib/server/images";
import { newCaseStudy, newProject } from "../../support/content";

const png = (w: number, h: number) => {
  const b = Buffer.alloc(24);
  b.set([0x89, 0x50, 0x4e, 0x47]);
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
};
const gif = (w: number, h: number) => {
  const b = Buffer.from("GIF89a\0\0\0\0", "latin1");
  b.writeUInt16LE(w, 6);
  b.writeUInt16LE(h, 8);
  return b;
};
/** A JPEG with a stray byte, a standalone marker, an APP0 segment, fill bytes, then SOF2. */
const jpeg = (w: number, h: number) =>
  Buffer.from([
    0xff,
    0xd8,
    0x00,
    0xff,
    0xd0,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xff,
    0xc2,
    0x00,
    0x11,
    0x08,
    h >> 8,
    h & 255,
    w >> 8,
    w & 255,
  ]);

describe("image sizes", () => {
  it("reads PNG, GIF and JPEG headers", () => {
    files.set("/a.png", png(640, 480));
    files.set("/b.gif", gif(32, 16));
    files.set("/c.jpg", jpeg(1044, 1388));
    expect(getImageSize("/a.png")).toEqual({ width: 640, height: 480 });
    expect(getImageSize("/b.gif")).toEqual({ width: 32, height: 16 });
    expect(getImageSize("/c.jpg")).toEqual({ width: 1044, height: 1388 });
  });

  it("falls back to 4:3 for remote, missing, unsafe or unknown files", () => {
    files.set("/notes.txt", Buffer.from("not an image"));
    files.set("/broken.jpg", Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
    for (const path of [
      "https://cdn.prod.website-files.com/x.jpg",
      "/missing.jpg",
      "/../etc/passwd",
      "/notes.txt",
      "/broken.jpg",
    ])
      expect(getImageSize(path), path).toEqual({ width: 1200, height: 900 });
  });

  it("caches each path after the first read", () => {
    files.set("/cached.png", png(10, 10));
    expect(getImageSize("/cached.png")).toEqual({ width: 10, height: 10 });
    files.set("/cached.png", png(20, 20));
    expect(getImageSize("/cached.png")).toEqual({ width: 10, height: 10 });
  });
});

describe("public images by name", () => {
  it("finds the first existing extension", () => {
    files.set("/images/photo.webp", png(1, 1));
    files.set("/images/photo.png", png(1, 1));
    expect(findPublicImage("images/photo")).toBe("/images/photo.png");
    expect(findPublicImage("images/none")).toBeNull();
  });

  it("gives a card its case-study cover, or a dropped-in cover file", () => {
    expect(projectCover(newProject({ caseStudy: newCaseStudy() }))).toBe(
      "/images/projects/pitchpulse/cover.jpg",
    );
    expect(projectCover(newProject())).toBeNull();
    files.set("/images/projects/orbit-planner/cover.jpg", jpeg(1600, 1100));
    expect(projectCover(newProject())).toBe(
      "/images/projects/orbit-planner/cover.jpg",
    );
  });
});
