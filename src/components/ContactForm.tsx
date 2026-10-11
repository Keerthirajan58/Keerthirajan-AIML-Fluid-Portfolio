"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactSchema, formEndpoint } from "@/lib/contact";
import { ArrowUpRightIcon } from "./ui/icons";
export function ContactForm({
  formId,
  email,
}: {
  formId?: string;
  email: string;
}) {
  const endpoint = formEndpoint(formId),
    abort = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<
      "idle" | "sending" | "success" | "error"
    >("idle"),
    [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => () => abort.current?.abort(), []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget,
      values = new FormData(form);
    if (values.get("_gotcha")) return;
    const parsed = contactSchema.safeParse(Object.fromEntries(values));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      form
        .querySelector<HTMLInputElement>(
          '[name="' + Object.keys(next)[0] + '"]',
        )
        ?.focus();
      return;
    }
    setErrors({});
    if (!endpoint) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    abort.current = new AbortController();
    const timer = setTimeout(() => abort.current?.abort(), 12000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
        signal: abort.current.signal,
      });
      if (!response.ok) throw new Error("Delivery failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }
  if (!endpoint)
    return (
      <div className="contact-form email-fallback">
        <p className="eyebrow">A direct line</p>
        <p>Have something in mind? Tell me a little about it.</p>
        <a className="button button-primary" href={"mailto:" + email}>
          Send an email <ArrowUpRightIcon />
        </a>
        <p className="form-note">
          The message form is not connected yet. Please use email to get in
          touch.
        </p>
      </div>
    );
  return (
    <form
      className="contact-form"
      method="POST"
      action={endpoint ?? undefined}
      onSubmit={submit}
      noValidate
    >
      {(["name", "email", "message"] as const).map((field) => (
        <div key={field}>
          <label htmlFor={"contact-" + field}>
            {field}
            {field === "message" ? (
              <textarea
                id={"contact-" + field}
                name={field}
                rows={3}
                maxLength={5000}
                required
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? field + "-error" : undefined}
              />
            ) : (
              <input
                id={"contact-" + field}
                name={field}
                type={field === "email" ? "email" : "text"}
                autoComplete={field}
                maxLength={field === "name" ? 100 : 254}
                required
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? field + "-error" : undefined}
              />
            )}
          </label>
          {errors[field] && (
            <p className="form-error" id={field + "-error"}>
              {errors[field]}
            </p>
          )}
        </div>
      ))}
      <div className="form-honeypot" aria-hidden="true">
        <label>
          Leave empty
          <input name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        className="button button-primary"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send message"}
        <ArrowUpRightIcon />
      </button>
      <p
        role="status"
        className={status === "error" ? "form-error" : "form-note"}
      >
        {status === "success"
          ? "Thanks — your message has been sent."
          : status === "error"
            ? "Your message could not be sent. Please try again or use email."
            : ""}
      </p>
      <noscript>
        <p className="form-note">
          You can also email <a href={"mailto:" + email}>{email}</a>.
        </p>
      </noscript>
    </form>
  );
}
