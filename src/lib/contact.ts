import * as z from "zod/mini";
export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, "Please enter your name."),
      z.maxLength(100, "Keep your name under 100 characters."),
    ),
  email: z.email("Please enter a valid email address.").check(z.maxLength(254)),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(10, "Please write at least 10 characters."),
      z.maxLength(5000, "Keep your message under 5,000 characters."),
    ),
});
/**
 * The portfolio's Formspree form. Not a secret: a form ID is visible in every
 * page that posts to it. `NEXT_PUBLIC_FORMSPREE_FORM_ID` can override it.
 */
export const FORMSPREE_FORM_ID = "mwlvqyoe";

/** Subject line of the email Formspree delivers. */
export function formSubject(name: string, topic?: string) {
  return `Portfolio: ${topic || "New message"} from ${name}`;
}

export function formEndpoint(id?: string) {
  return id && /^[a-zA-Z0-9]{6,32}$/.test(id)
    ? "https://formspree.io/f/" + id
    : null;
}

export const contactTopics = [
  "Job opportunity",
  "Collaboration",
  "Just saying hi",
] as const;

/** Without a form service, hand the drafted message to the visitor's mail app. */
export function mailtoHref(
  to: string,
  v: { name: string; email: string; message: string; topic?: string },
) {
  const subject = `${v.topic ? `${v.topic}: ` : ""}hello from ${v.name}`;
  const body = `${v.message}\n\n${v.name} (${v.email})`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
