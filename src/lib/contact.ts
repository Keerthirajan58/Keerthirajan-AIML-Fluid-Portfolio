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
export function formEndpoint(id?: string) {
  return id && /^[a-zA-Z0-9]{6,32}$/.test(id)
    ? "https://formspree.io/f/" + id
    : null;
}
