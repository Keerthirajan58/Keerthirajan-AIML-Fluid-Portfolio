import { type ReactNode } from "react";

/** Small pill used for tech tags and skills. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink/10 bg-paper px-3 py-1 text-sm text-ink-muted">
      {children}
    </span>
  );
}
