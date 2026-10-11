"use client";
import { useId, useRef, type ReactNode } from "react";
import { ArrowUpRightIcon } from "./ui/icons";

export function ProjectNotes({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="project-notes-trigger"
        aria-haspopup="dialog"
        aria-controls={id}
        aria-label={`Project notes: ${title}`}
        onClick={() => dialog.current?.showModal()}
      >
        Project notes <ArrowUpRightIcon />
      </button>
      <dialog
        ref={dialog}
        id={id}
        className="project-notes-dialog"
        aria-labelledby={`${id}-heading`}
        data-lenis-prevent
        onClose={() => trigger.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
          );
          const first = focusable[0],
            last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="notes-heading">
          <span className="eyebrow">Behind the project</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close project notes"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <h3 id={`${id}-heading`}>{title}</h3>
        {children}
      </dialog>
      <noscript>
        <details className="project-notes-static">
          <summary>Project notes</summary>
          {children}
        </details>
      </noscript>
    </>
  );
}
