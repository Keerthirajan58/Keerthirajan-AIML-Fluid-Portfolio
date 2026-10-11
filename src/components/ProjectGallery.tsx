"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { wrapIndex } from "@/lib/navigation";
export function ProjectGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const rail = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState(0),
    [lightbox, setLightbox] = useState(0);
  const select = (index: number) => {
    const next = wrapIndex(index, images.length);
    setActive(next);
    const el = rail.current?.children[next] as HTMLElement | undefined;
    if (el && rail.current)
      rail.current.scrollTo({
        left: el.offsetLeft,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  if (!images.length) return null;
  return (
    <div className="gallery" role="region" aria-label={title + " gallery"}>
      <div className="gallery-toolbar">
        <p>
          <span aria-live="polite">{active + 1}</span> / {images.length}
        </p>
        <div>
          <button
            className="icon-button"
            aria-label="Previous image"
            onClick={() => select(active - 1)}
          >
            ←
          </button>
          <button
            className="icon-button"
            aria-label="Next image"
            onClick={() => select(active + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="gallery-rail"
        ref={rail}
        tabIndex={0}
        aria-label="Project images"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            select(active + (e.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onScroll={() => {
          const el = rail.current;
          if (!el) return;
          const children = Array.from(el.children) as HTMLElement[];
          const index = children.reduce(
            (best, item, i) =>
              Math.abs(item.offsetLeft - el.scrollLeft) <
              Math.abs(children[best].offsetLeft - el.scrollLeft)
                ? i
                : best,
            0,
          );
          setActive(index);
        }}
      >
        {images.map((src, i) => (
          <figure className="gallery-slide" key={src}>
            <button
              aria-label={"Open image " + (i + 1)}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setLightbox(i);
                dialog.current?.showModal();
              }}
            >
              <Image
                src={src}
                alt={title + " — image " + (i + 1)}
                width={1600}
                height={1000}
                sizes="(max-width: 767px) 100vw, 80vw"
                className="gallery-image"
              />
            </button>
            <figcaption>{i === 0 ? "Overview" : "Image " + i}</figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-thumbs" aria-label="Choose image">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => select(i)}
            aria-label={"Show image " + (i + 1)}
            aria-pressed={active === i}
          >
            <Image src={src} alt="" width={96} height={64} />
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
            className="icon-button"
            aria-label="Close image viewer"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <Image
          src={images[lightbox]}
          alt={title + " — image " + (lightbox + 1)}
          width={1600}
          height={1000}
          sizes="100vw"
          className="lightbox-image"
        />
        <div className="lightbox-controls">
          <button
            className="icon-button"
            aria-label="Previous full image"
            onClick={() => setLightbox((i) => wrapIndex(i - 1, images.length))}
          >
            ←
          </button>
          <button
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
