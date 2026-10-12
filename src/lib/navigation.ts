/** The section id a link points at, if it is an anchor on this page. */
export function getAnchorTarget(href: string, current: string) {
  try {
    const url = new URL(href, current),
      here = new URL(current);
    if (
      url.origin !== here.origin ||
      url.pathname !== here.pathname ||
      url.search !== here.search ||
      !url.hash
    )
      return null;
    return decodeURIComponent(url.hash.slice(1));
  } catch {
    return null;
  }
}
/** Site paths, https URLs and mailto links only. */
export function isSafeLink(value: string) {
  return (
    /^\/(?!\/)/.test(value) ||
    /^https:\/\/[^\s]+$/.test(value) ||
    /^mailto:[^\s@]+@[^\s@]+$/.test(value)
  );
}
/** Wraps an index into 0…length-1 (for carousels and galleries). */
export function wrapIndex(index: number, length: number) {
  return length > 0 ? ((index % length) + length) % length : 0;
}
