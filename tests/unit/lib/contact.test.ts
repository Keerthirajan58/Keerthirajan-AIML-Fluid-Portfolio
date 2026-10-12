import { describe, expect, it } from "vitest";
import {
  contactSchema,
  contactTopics,
  FORMSPREE_FORM_ID,
  formEndpoint,
  formSubject,
  mailtoHref,
} from "@/lib/contact";

describe("contact form rules", () => {
  it("trims and validates every field", () => {
    expect(
      contactSchema.parse({
        name: " Jane ",
        email: "jane@example.com",
        message: "  A genuine message.  ",
      }),
    ).toEqual({
      name: "Jane",
      email: "jane@example.com",
      message: "A genuine message.",
    });
    const result = contactSchema.safeParse({
      name: "x",
      email: "bad",
      message: "short",
    });
    expect(result.success).toBe(false);
    expect(
      contactSchema.safeParse({
        name: "x".repeat(101),
        email: "a@b.co",
        message: "long enough message",
      }).success,
    ).toBe(false);
  });

  it("posts only to a well-formed Formspree form", () => {
    expect(formEndpoint()).toBeNull();
    expect(formEndpoint("../oops")).toBeNull();
    expect(formEndpoint("https://evil.example.com")).toBeNull();
    expect(formEndpoint("abcdefgh")).toBe("https://formspree.io/f/abcdefgh");
    expect(formEndpoint(FORMSPREE_FORM_ID)).toBe(
      `https://formspree.io/f/${FORMSPREE_FORM_ID}`,
    );
  });

  it("labels each message for the inbox", () => {
    expect(formSubject("Ada", "Collaboration")).toBe(
      "Portfolio: Collaboration from Ada",
    );
    expect(formSubject("Ada")).toBe("Portfolio: New message from Ada");
    expect(contactTopics).toEqual([
      "Job opportunity",
      "Collaboration",
      "Just saying hi",
    ]);
  });

  it("drafts an email the visitor can send without a form service", () => {
    const fields = {
      name: "Ada",
      email: "ada@example.com",
      message: "Hello there",
    };
    const withTopic = decodeURIComponent(
      mailtoHref("me@example.com", { ...fields, topic: "Job opportunity" }),
    );
    expect(withTopic.startsWith("mailto:me@example.com?subject=")).toBe(true);
    expect(withTopic).toContain("Job opportunity: hello from Ada");
    expect(withTopic).toContain("Hello there\n\nAda (ada@example.com)");
    expect(decodeURIComponent(mailtoHref("me@example.com", fields))).toContain(
      "subject=hello from Ada",
    );
  });
});
