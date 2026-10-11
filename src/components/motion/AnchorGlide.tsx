"use client";
import { useEffect } from "react";
import { getAnchorTarget } from "@/lib/navigation";
import { scrollToSection } from "@/lib/smoothScroll";

/**
 * Same-page links (hero CTA, back to top, epoch dots) glide to their section
 * on every device: through Lenis on desktop, natively elsewhere, instantly
 * under reduced motion. Header links call scrollToSection themselves because
 * Next's Link handles their clicks first.
 */
export function AnchorGlide() {
  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const link =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const id = getAnchorTarget(link.href, location.href);
      if (id && scrollToSection(id)) e.preventDefault();
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
