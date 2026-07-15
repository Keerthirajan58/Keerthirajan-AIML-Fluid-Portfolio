import { type ReactNode } from "react";

/**
 * Consistent section wrapper: centered max-width column, standard vertical
 * rhythm, scroll offset for the sticky header, and an accessible labelled
 * heading (eyebrow + h2) when a title is provided.
 */
export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={`mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 ${className}`}
    >
      {(eyebrow || title) && (
        <header data-reveal className="mb-10 sm:mb-14">
          {eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-crimson">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              id={headingId}
              className="max-w-3xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-ink sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
