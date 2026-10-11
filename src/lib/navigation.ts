export const navigation = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
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
export function isSafeLink(value: string) {
  return (
    /^\/(?!\/)/.test(value) ||
    /^https:\/\/[^\s]+$/.test(value) ||
    /^mailto:[^\s@]+@[^\s@]+$/.test(value)
  );
}
export function wrapIndex(index: number, length: number) {
  return length > 0 ? ((index % length) + length) % length : 0;
}
