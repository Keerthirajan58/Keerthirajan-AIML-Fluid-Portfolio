import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import { Contact } from "@/components/sections/contact/Contact";
import ContactDialog from "@/components/sections/contact/ContactDialog";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Contact lazy-loads its form; render the real form in its place.
vi.mock("next/dynamic", async () => {
  const { default: Dialog } =
    await import("@/components/sections/contact/ContactDialog");
  return { default: () => Dialog };
});

describe("contact section", () => {
  it("keeps footer copyright, resume, and email without telephone links", () => {
    render(
      <>
        <Contact />
        <SiteFooter />
      </>,
    );
    expect(screen.getByText(/All rights reserved/)).toBeVisible();
    // The KS mark lives in the header only.
    expect(document.querySelector(".site-footer .wordmark")).toBeNull();
    // "Say hello" is a real button that opens the popup, not a mail link.
    const hello = screen.getByRole("button", { name: /Say hello/ });
    expect(hello).toHaveAttribute("aria-haspopup", "dialog");
    expect(hello).not.toHaveAttribute("href");
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(screen.queryByText(/form is not connected/)).toBeNull();
    expect(document.querySelector("form")).toBeNull();
  });
  it("shows the pitch, the email and every social link", () => {
    render(<Contact />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Have a role in mind\? Let's talk\./,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "I'm looking for AIML and software engineering roles. Based in San Francisco, CA, open to relocation.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: localContent.contact.emails[0] }),
    ).toHaveAttribute("href", "mailto:" + localContent.contact.emails[0]);
    expect(
      document.querySelectorAll(".contact-card .social-link"),
    ).toHaveLength(localContent.contact.socials.length);
    // The dedicated contact portrait wins over the About photo.
    expect(document.querySelector(".contact-avatar img")).toHaveAttribute(
      "src",
      "/images/contact-profile.jpg",
    );
  });
});

describe("contact popup", () => {
  it("opens the contact form from Say hello, posting to Formspree when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_FORM_ID", "abcdefgh");
    render(<Contact />);
    expect(document.querySelector("form")).toBeNull();
    const hello = screen.getByRole("button", { name: /Say hello/ });
    await userEvent.click(hello);
    expect(screen.getByRole("button", { name: /Send message/ })).toBeVisible();
    expect(document.querySelector("form")).toHaveAttribute(
      "action",
      "https://formspree.io/f/abcdefgh",
    );
  });
  it("shows the form card with its band, focuses the name and closes", async () => {
    const onClose = vi.fn();
    render(
      <ContactDialog
        email="test@example.com"
        formId="abcdefgh"
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Tell me about it." });
    expect(dialog).toHaveAttribute("open");
    expect(dialog.querySelector(".contact-dialog-head")).toHaveTextContent(
      "Your message lands straight in my inbox.",
    );
    expect(within(dialog).getByLabelText("name")).toHaveFocus();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close contact form" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("posts to the portfolio's own Formspree form by default", async () => {
    render(<Contact />);
    await userEvent.click(screen.getByRole("button", { name: /Say hello/ }));
    expect(document.querySelector("form")).toHaveAttribute(
      "action",
      "https://formspree.io/f/mwlvqyoe",
    );
  });
  it("hands the drafted message to the mail app when no form service is set", async () => {
    const openMail = vi.fn();
    render(<ContactForm email="test@example.com" openMail={openMail} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Collaboration"));
    await user.type(screen.getByLabelText("name"), "Test Person");
    await user.type(screen.getByLabelText("email"), "test@example.com");
    await user.type(
      screen.getByLabelText("message"),
      "This is a synthetic test message.",
    );
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    expect(openMail).toHaveBeenCalledOnce();
    const href = openMail.mock.calls[0][0] as string;
    expect(href).toMatch(/^mailto:test@example\.com\?subject=/);
    expect(decodeURIComponent(href)).toContain(
      "Collaboration: hello from Test Person",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "email app should open",
    );
  });
});

describe("contact delivery states", () => {
  const fill = async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("name"), "Test Person");
    await user.type(screen.getByLabelText("email"), "test@example.com");
    await user.type(
      screen.getByLabelText("message"),
      "This is a synthetic test message.",
    );
  };
  it("validates locally before any request", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<ContactForm formId="abcdefgh" email="test@example.com" />);
    await userEvent.click(screen.getByRole("button", { name: /Send message/ }));
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your name.")).toBeVisible();
    expect(screen.getByLabelText("name")).toHaveFocus();
  });
  it("sends synthetic data, disables double submits and announces success", async () => {
    let resolve!: (v: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((r) => {
          resolve = r;
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    render(<ContactForm formId="abcdefgh" email="test@example.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: /Send message/ }));
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled();
    // While sending, the plane flies and a shimmer sweeps the button.
    expect(screen.getByRole("button", { name: /Sending/ })).toHaveAttribute(
      "data-sending",
      "true",
    );
    resolve(new Response("{}", { status: 200 }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("has been sent"),
    );
    expect(fetcher).toHaveBeenCalledOnce();
    // Formspree gets the fields plus a clear subject line for the inbox.
    const [url, init] = fetcher.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://formspree.io/f/abcdefgh");
    expect(JSON.parse(String(init.body))).toMatchObject({
      name: "Test Person",
      email: "test@example.com",
      topic: "Job opportunity",
      _subject: "Portfolio: Job opportunity from Test Person",
    });
    // The sent state replaces the form with a confirmation.
    expect(document.querySelector("form")).toBeNull();
  });
  it.each([false, true])(
    "retains entered text on delivery error (network=%s)",
    async (network) => {
      vi.stubGlobal(
        "fetch",
        network
          ? vi.fn().mockRejectedValue(new Error("Offline"))
          : vi.fn().mockResolvedValue(new Response("", { status: 422 })),
      );
      render(<ContactForm formId="abcdefgh" email="test@example.com" />);
      await fill();
      await userEvent.click(
        screen.getByRole("button", { name: /Send message/ }),
      );
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
          "could not be sent",
        ),
      );
      expect(screen.getByLabelText("name")).toHaveValue("Test Person");
    },
  );
  it("moves a glass lens over topics and ripples from where Send is pressed", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
      function (this: HTMLElement) {
        const labels = [...document.querySelectorAll(".topic-options > label")];
        return Math.max(0, labels.indexOf(this)) * 100;
      },
    );
    render(<ContactForm formId="abcdefgh" email="test@example.com" />);
    const options = document.querySelector<HTMLElement>(".topic-options")!;
    const marks = () => [
      options.style.getPropertyValue("--ix"),
      options.style.getPropertyValue("--lx"),
    ];
    // The first topic is chosen; the lens rests on it.
    expect(marks()).toEqual(["0px", "0px"]);
    const over = new Event("pointerover", { bubbles: true });
    Object.assign(over, { pointerType: "mouse" });
    fireEvent(screen.getByLabelText("Just saying hi"), over);
    expect(marks()).toEqual(["0px", "200px"]);
    await userEvent.click(screen.getByLabelText("Collaboration"));
    expect(screen.getByLabelText("Collaboration")).toBeChecked();
    expect(marks()).toEqual(["100px", "100px"]);
    // Pressing Send starts a ripple at the press point.
    const send = screen.getByRole("button", { name: /Send message/ });
    send.getBoundingClientRect = () =>
      ({ left: 10, top: 20, width: 180, height: 52 }) as DOMRect;
    const down = new Event("pointerdown", { bubbles: true });
    Object.assign(down, { clientX: 40, clientY: 46 });
    fireEvent(send, down);
    expect(send).toHaveAttribute("data-pressed");
    expect(send.style.getPropertyValue("--px")).toBe("30px");
    expect(send.style.getPropertyValue("--py")).toBe("26px");
  });
  it("never submits honeypot traffic", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<ContactForm formId="abcdefgh" email="test@example.com" />);
    fireEvent.change(screen.getByLabelText("Leave empty"), {
      target: { value: "bot" },
    });
    fireEvent.submit(document.querySelector("form")!);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
