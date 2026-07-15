import Image from "next/image";
import { getImageSize } from "@/lib/imageSize";

/**
 * Static masonry gallery — every screenshot at its true aspect ratio (no
 * cropping), optimized via next/image. Phase 4 will layer a lightbox/carousel
 * on top; for now it's a plain responsive column flow.
 */
export function ProjectGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 [&>*]:mb-4">
      {images.map((src, i) => {
        const { width, height } = getImageSize(src);
        return (
          <div
            key={src}
            data-reveal
            className="overflow-hidden rounded-xl border border-ink/10 bg-surface"
          >
            <Image
              src={src}
              alt={`${title} — screenshot ${i + 1}`}
              width={width}
              height={height}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="h-auto w-full"
            />
          </div>
        );
      })}
    </div>
  );
}
