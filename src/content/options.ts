/**
 * The fixed choices content can use. Each maps to an icon component or a
 * colour in the stylesheet, so a new value needs a matching icon or style.
 */

/** Icons content can name (see `components/ui/icons.tsx`). */
export const ICONS = [
  "apple",
  "award",
  "graduation",
  "briefcase",
  "people",
  "pin",
  "book",
  "spark",
] as const;

/** Chip colours. */
export const TONES = ["gold", "ink", "navy", "crimson"] as const;

/** Soft corner tints for story cards (the `--tint-*` colour tokens). */
export const TINTS = [
  "rose",
  "peach",
  "navy",
  "gold",
  "sky",
  "saffron",
] as const;

/** Social networks with a brand icon and colour. */
export const SOCIAL_NETWORKS = ["linkedin", "github", "leetcode"] as const;
