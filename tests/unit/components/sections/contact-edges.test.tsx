import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";

const images = vi.hoisted(() => ({ portrait: true }));
vi.mock("@/lib/server/images", async (original) => {
  const real = await original<typeof import("@/lib/server/images")>();
  return {
    ...real,
    findPublicImage: (base: string) =>
      images.portrait ? real.findPublicImage(base) : null,
  };
});
vi.mock("next/dynamic", async () => {
  const { default: Dialog } =
    await import("@/components/sections/contact/ContactDialog");
  return { default: () => Dialog };
});

import { Contact } from "@/components/sections/contact/Contact";
import ContactDialog from "@/components/sections/contact/ContactDialog";
import { ContactForm } from "@/components/sections/contact/ContactForm";

const fill = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("name"), "Test Person");
  await user.type(screen.getByLabelText("email"), "test@example.com");
  await user.type(
    screen.getByLabelText("message"),
    "This is a synthetic test message.",
  );
};

afterEach(() => {
  images.portrait = true;
});

describe("contact section edges", () => {
  it("falls back to the About portrait without a contact photo", () => {
    images.portrait = false;
    render(<Contact />);
    expect(document.querySelector(".contact-avatar img")).toHaveAttribute(
      "src",
      localContent.profile.photo,
    );
  });

  it("returns focus to Say hello when the popup closes, and preloads on intent", async () => {
    render(<Contact />);
    const hello = screen.getByRole("button", { name: /Say hello/ });
    fireEvent.pointerEnter(hello);
    fireEvent.focus(hello);
    await userEvent.click(hello);
    await userEvent.click(
      screen.getByRole("button", { name: "Close contact form" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(hello).toHaveFocus();
  });
});

describe("contact dialog edges", () => {
  it("opens once under StrictMode and closes from the backdrop only", () => {
    const show = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const onClose = vi.fn();
    render(
      <StrictMode>
        <ContactDialog email="test@example.com" onClose={onClose} />
      </StrictMode>,
    );
    expect(show).toHaveBeenCalledOnce();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector(".contact-dialog-card")!);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("contact form edges", () => {
  it("opens the visitor's mail app by default when no form service is set", async () => {
    const location = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });
    try {
      render(<ContactForm email="me@example.com" />);
      expect(screen.getByText(/Sends through your email app/)).toBeVisible();
      await fill();
      await userEvent.click(
        screen.getByRole("button", { name: /Send message/ }),
      );
      expect(window.location.href).toMatch(/^mailto:me@example\.com\?subject=/);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: location,
      });
    }
  });

  it("copies the email address when the browser allows it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<ContactForm formId="abcdefgh" email="me@example.com" />);
    await userEvent.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith("me@example.com");
    expect(
      await screen.findByRole("button", { name: "Email copied" }),
    ).toBeVisible();
    Reflect.deleteProperty(navigator, "clipboard");
    // Without a clipboard the button simply does nothing.
    render(<ContactForm formId="abcdefgh" email="me@example.com" />);
    expect(() =>
      fireEvent.click(
        screen.getAllByRole("button", { name: "Copy email" }).at(-1)!,
      ),
    ).not.toThrow();
  });

  it("sends once even if submitted twice while sending", async () => {
    let resolve!: (v: Response) => void;
    const fetcher = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetcher);
    const { unmount } = render(
      <ContactForm formId="abcdefgh" email="me@example.com" />,
    );
    await fill();
    const form = document.querySelector("form")!;
    fireEvent.submit(form);
    await screen.findByRole("button", { name: /Sending/ });
    fireEvent.submit(form);
    expect(fetcher).toHaveBeenCalledOnce();
    // Leaving mid-send aborts the request instead of updating a gone form.
    const signal = (
      fetcher.mock.calls[0] as unknown as [string, RequestInit]
    )[1].signal!;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => resolve(new Response("{}")));
  });
});

describe("contact form timeouts and topics", () => {
  it("gives up on a send after 12 seconds and keeps the message", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) =>
            init.signal!.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            ),
          ),
      ),
    );
    render(<ContactForm formId="abcdefgh" email="me@example.com" />);
    await fill();
    fireEvent.submit(document.querySelector("form")!);
    await screen.findByRole("button", { name: /Sending/ });
    await act(async () => vi.advanceTimersByTime(12000));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "could not be sent",
    );
    expect(screen.getByLabelText("name")).toHaveValue("Test Person");
    vi.useRealTimers();
  });

  it("keeps the topic lens still if no topic is checked", () => {
    render(<ContactForm formId="abcdefgh" email="me@example.com" />);
    const options = document.querySelector<HTMLElement>(".topic-options")!;
    const before = options.style.getPropertyValue("--ix");
    options
      .querySelectorAll<HTMLInputElement>("input")
      .forEach((input) => (input.checked = false));
    fireEvent.pointerOver(screen.getByLabelText("Collaboration"), {
      pointerType: "mouse",
    });
    expect(options.style.getPropertyValue("--ix")).toBe(before);
  });
});
