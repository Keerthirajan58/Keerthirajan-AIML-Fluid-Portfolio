"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  contactSchema,
  contactTopics,
  formEndpoint,
  formSubject,
  mailtoHref,
} from "@/lib/contact";
import { ArrowUpRightIcon, CopyIcon, SendIcon } from "./ui/icons";

type Status = "idle" | "sending" | "success" | "error" | "handoff";

export function ContactForm({
  formId,
  email,
  openMail = (href: string) => {
    window.location.href = href;
  },
}: {
  formId?: string;
  email: string;
  /** How the no-service fallback opens the visitor's mail app (injectable for tests). */
  openMail?: (href: string) => void;
}) {
  const endpoint = formEndpoint(formId),
    abort = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<Status>("idle"),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [copied, setCopied] = useState(false);
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
    const topic = String(values.get("topic") ?? "");
    if (!endpoint) {
      // No form service configured: draft the email instead of failing.
      openMail(mailtoHref(email, { ...parsed.data, topic }));
      setStatus("handoff");
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
        body: JSON.stringify({
          ...parsed.data,
          topic,
          _subject: formSubject(parsed.data.name, topic),
        }),
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
  if (status === "success")
    return (
      <div className="contact-done" role="status">
        <span className="done-check" aria-hidden="true" />
        <p>Thanks, your message has been sent.</p>
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
      <fieldset className="topic-picker">
        <legend>What&apos;s it about?</legend>
        {contactTopics.map((t, i) => (
          <label key={t}>
            <input
              type="radio"
              name="topic"
              value={t}
              defaultChecked={i === 0}
            />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>
      <div className="form-row">
        {(["name", "email"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={"contact-" + field}>
              {field}
              <input
                id={"contact-" + field}
                name={field}
                type={field === "email" ? "email" : "text"}
                autoComplete={field}
                maxLength={field === "name" ? 100 : 254}
                placeholder={field === "name" ? "Your name" : "you@company.com"}
                required
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? field + "-error" : undefined}
              />
            </label>
            {errors[field] && (
              <p className="form-error" id={field + "-error"}>
                {errors[field]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="contact-message">
          message
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            maxLength={5000}
            placeholder="A little about the role or idea…"
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
        </label>
        {errors.message && (
          <p className="form-error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="form-honeypot" aria-hidden="true">
        <label>
          Leave empty
          <input name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-actions">
        <button
          type="submit"
          className="button button-primary"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send message"}
          <SendIcon />
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(email)
              .then(() => setCopied(true));
          }}
        >
          <CopyIcon />
          {copied ? "Email copied" : "Copy email"}
        </button>
      </div>
      <p
        role="status"
        className={status === "error" ? "form-error" : "form-note"}
      >
        {status === "error"
          ? "Your message could not be sent. Please try again or use email."
          : status === "handoff"
            ? `Your email app should open with the message ready to send. If it didn't, write to ${email}.`
            : ""}
      </p>
      <noscript>
        <p className="form-note">
          You can also email <a href={"mailto:" + email}>{email}</a>.
        </p>
      </noscript>
      {!endpoint && status === "idle" && (
        <p className="form-note subtle">
          Sends through your email app.{" "}
          <a href={"mailto:" + email}>
            Or write directly <ArrowUpRightIcon width={13} height={13} />
          </a>
        </p>
      )}
    </form>
  );
}
