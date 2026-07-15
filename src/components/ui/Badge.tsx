import { type ReactNode } from "react";

/** Small crimson category label used on project cards and case-study headers. */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-wine">
      {children}
    </span>
  );
}
