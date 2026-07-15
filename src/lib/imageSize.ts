import { readFileSync } from "node:fs";
import path from "node:path";

export type ImageDimensions = { width: number; height: number };

const cache = new Map<string, ImageDimensions>();

/**
 * Reads intrinsic width/height for an image under /public by parsing the file
 * header (JPEG/PNG/GIF) — no native dependency, so it works the same at build
 * time on Vercel's Linux runners as it does locally. Used by ProjectGallery to
 * render screenshots at their true aspect ratio (no cropping) while still
 * giving next/image the dimensions it needs.
 */
export function getImageSize(publicPath: string): ImageDimensions {
  const cached = cache.get(publicPath);
  if (cached) return cached;
  const abs = path.join(process.cwd(), "public", publicPath);
  const dims = parse(readFileSync(abs));
  cache.set(publicPath, dims);
  return dims;
}

function parse(buf: Buffer): ImageDimensions {
  // PNG: 8-byte signature, then IHDR with width@16, height@20 (big-endian).
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF: "GIF" then logical screen width/height (little-endian) at 6/8.
  if (buf.length >= 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // JPEG: scan segments for a Start-Of-Frame marker carrying dimensions.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 1 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      let marker = buf[offset + 1];
      while (marker === 0xff && offset + 1 < buf.length) {
        offset++;
        marker = buf[offset + 1];
      }
      // Standalone markers (no length payload).
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        offset += 2;
        continue;
      }
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSOF) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
  }
  // Fallback for anything unrecognized (keeps the layout sane).
  return { width: 1200, height: 900 };
}
