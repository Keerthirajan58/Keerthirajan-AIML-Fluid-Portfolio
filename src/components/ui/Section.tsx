import type { ReactNode } from "react";
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby={title && id ? id + "-heading" : undefined}
      className={"section shell " + className}
    >
      {(eyebrow || title) && (
        <header className="section-heading reveal">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 id={id ? id + "-heading" : undefined}>{title}</h2>}
          {lede && <p className="section-lede">{lede}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
