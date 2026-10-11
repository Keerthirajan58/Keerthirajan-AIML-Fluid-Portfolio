"use client";
import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";

// The form (and its validation library) downloads only when someone opens it.
const loadDialog = () => import("./ContactDialog");
const ContactDialog = dynamic(loadDialog, { ssr: false });

/**
 * A real mailto link that, with JavaScript, opens the contact popup instead.
 * Modifier-clicks keep the plain mail link behaviour.
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
  const trigger = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <a
        ref={trigger}
        href={"mailto:" + email}
        className={className}
        aria-haspopup="dialog"
        onMouseEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
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
