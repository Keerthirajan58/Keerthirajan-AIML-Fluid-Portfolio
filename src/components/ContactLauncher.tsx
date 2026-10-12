"use client";
import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";

// The form (and its validation library) downloads only when someone opens it.
const loadDialog = () => import("./ContactDialog");
const ContactDialog = dynamic(loadDialog, { ssr: false });

/**
 * "Say hello": a button that opens the contact popup (the form card over a
 * blurred page). Without JavaScript a plain email link stands in for it.
 */
export function ContactLauncher({
  email,
  formId,
  className,
  children,
}: {
  email: string;
  formId?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <noscript>
        <style>{".contact-launch{display:none}"}</style>
        <a href={"mailto:" + email} className={className}>
          {children}
        </a>
      </noscript>
      <button
        ref={trigger}
        type="button"
        className={`contact-launch ${className ?? ""}`}
        aria-haspopup="dialog"
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {open && (
        <ContactDialog
          email={email}
          formId={formId}
          onClose={() => {
            setOpen(false);
            trigger.current?.focus();
          }}
        />
      )}
    </>
  );
}
