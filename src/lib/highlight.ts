/**
 * Splits text around known terms (case-insensitive, whole words only) so
 * results can bold the tools a recruiter scans for. Never alters the text.
 */
export function splitByTerms(text: string, terms: string[]) {
  const unique = [...new Set(terms.map((t) => t.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!unique.length) return [{ text, hit: false }];
  // Spacing is flexible, so "LoRA / PEFT" also matches "LoRA/PEFT".
  const escaped = unique.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*"),
  );
  const pattern = new RegExp(
    `(?<![\\w-])(${escaped.join("|")})(?![\\w-])`,
    "gi",
  );
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index;
    if (start > last) parts.push({ text: text.slice(last, start), hit: false });
    parts.push({ text: match[0], hit: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}
