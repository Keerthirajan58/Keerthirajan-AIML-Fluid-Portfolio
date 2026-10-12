"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { wrapIndex } from "@/lib/navigation";
import { columnWidth, galleryColumns, placeMasonry } from "@/lib/masonry";
import { ExpandIcon } from "@/components/ui/icons";
export type GalleryImage = { src: string; width: number; height: number };

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const GAP = 14;

/**
 * "A closer look": an adaptive masonry wall where every image keeps its own
 * shape (portrait phone shots stay portrait), in reading order across the
 * top; a short set shares one row. Any tile opens a full-size viewer; arrow keys step through it and
 * closing returns focus to the tile. Without JavaScript the wall falls back
 * to CSS columns.
 */
export function ProjectGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const wall = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement | null>(null);
  const [lightbox, setLightbox] = useState(0);
  const ratios = images.map((img) => img.width / img.height);
  // Columns on a full desktop wall (1208px): the no-JS fallback and `sizes`.
  const desktopColumns = galleryColumns(1208, ratios);

  const layout = useCallback(() => {
    const el = wall.current;
    if (!el) return;
    const width = el.clientWidth;
    if (!width) return;
    const shapes = images.map((img) => img.width / img.height);
    const cols = galleryColumns(width, shapes);
    const colW = columnWidth(width, cols, GAP);
    // Heights follow from each image's known shape: no measuring needed.
    const heights = shapes.map((r) => colW / r);
    const { placements, height } = placeMasonry(heights, cols, colW, GAP);
    (Array.from(el.children) as HTMLElement[]).forEach((tile, i) => {
      tile.style.width = `${colW}px`;
      tile.style.height = `${heights[i]}px`;
      tile.style.setProperty("--x", `${placements[i].x}px`);
      tile.style.setProperty("--y", `${placements[i].y}px`);
    });
    el.style.height = `${height}px`;
    el.dataset.masonry = "true";
  }, [images]);

  useIsoLayoutEffect(() => layout(), [layout]);

  useEffect(() => {
    const el = wall.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let frame = 0,
      width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [layout]);

  if (!images.length) return null;
  const current = images[lightbox];
  return (
    <div className="gallery" role="region" aria-label={title + " gallery"}>
      <div
        className="gallery-wall"
        ref={wall}
        style={{ "--cols": desktopColumns } as CSSProperties}
      >
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            className="gallery-tile"
            style={{ "--ratio": ratios[i].toFixed(4) } as CSSProperties}
            aria-label={`Open image ${i + 1} of ${images.length}`}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setLightbox(i);
              dialog.current?.showModal();
            }}
          >
            <Image
              src={img.src}
              alt={`${title}, image ${i + 1}`}
              width={img.width}
              height={img.height}
              sizes={`(max-width: 879px) 50vw, ${Math.ceil(1208 / desktopColumns)}px`}
              className="gallery-image"
            />
            <span className="gallery-zoom" aria-hidden="true">
              <ExpandIcon width={16} height={16} />
            </span>
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        aria-label={title + " image viewer"}
        onClose={() => opener.current?.focus()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            setLightbox((i) =>
              wrapIndex(i + (e.key === "ArrowRight" ? 1 : -1), images.length),
            );
          }
        }}
      >
        <div className="lightbox-toolbar">
          <span aria-live="polite">
            {lightbox + 1} / {images.length}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Close image viewer"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <Image
          src={current.src}
          alt={`${title}, image ${lightbox + 1}`}
          width={current.width}
          height={current.height}
          sizes="100vw"
          className="lightbox-image"
        />
        <div className="lightbox-controls">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous full image"
            onClick={() => setLightbox((i) => wrapIndex(i - 1, images.length))}
          >
            ←
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Next full image"
            onClick={() => setLightbox((i) => wrapIndex(i + 1, images.length))}
          >
            →
          </button>
        </div>
      </dialog>
    </div>
  );
}
