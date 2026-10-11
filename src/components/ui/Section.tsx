import type { ReactNode } from "react";
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
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby={title && id ? id + "-heading" : undefined}
      className={"section shell " + className}
    >
      {(eyebrow || title) && (
        <header className="section-heading">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 id={id ? id + "-heading" : undefined}>{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}
