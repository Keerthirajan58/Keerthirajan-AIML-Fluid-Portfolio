"use client";
import { useEffect, useRef } from "react";
import { ContactForm } from "./ContactForm";

/**
 * The "Say hello" popup: a card over a blurred page. A deep wine gradient
 * band carries the title; the form sits on the solid body below.
 */
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
            <p className="contact-dialog-note">
              Your message lands straight in my inbox.
            </p>
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
        <div className="contact-dialog-body">
          <ContactForm formId={formId} email={email} />
        </div>
      </div>
    </dialog>
  );
}
