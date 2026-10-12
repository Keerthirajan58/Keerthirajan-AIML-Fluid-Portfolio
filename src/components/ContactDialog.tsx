"use client";
import { useEffect, useRef } from "react";
import { ContactForm } from "./ContactForm";

/** The "Say hello" popup: a solid card over a blurred page. */
export default function ContactDialog({
  email,
  formId,
  onClose,
}: {
  email: string;
  formId?: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el || el.open) return;
    el.showModal();
    // Start typing straight away (showModal alone would focus the close button).
    el.querySelector<HTMLInputElement>("#contact-name")?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="contact-dialog"
      aria-labelledby="contact-dialog-title"
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="contact-dialog-card">
        <div className="contact-dialog-head">
          <div>
            <p className="eyebrow">Say hello</p>
            <h2 id="contact-dialog-title">Tell me about it.</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close contact form"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <ContactForm formId={formId} email={email} />
      </div>
    </dialog>
  );
}
