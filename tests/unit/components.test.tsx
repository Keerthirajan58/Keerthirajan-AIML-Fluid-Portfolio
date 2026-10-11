import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Credentials } from "@/components/sections/Credentials";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ContactForm } from "@/components/ContactForm";
import { localContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
describe("readable portfolio content", () => {
  it("renders the name first and real contact/work destinations", () => {
    render(<Hero />);
    // A real space keeps screen readers from reading the name as one word.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Keerthirajan Senthilkumar",
    );
    expect(
      screen.getByRole("link", { name: /Explore my work/ }),
    ).toHaveAttribute("href", "#projects");
    expect(screen.getByText("Apple AIML Intern")).toBeVisible();
    expect(screen.getByText("San Francisco, CA")).toBeVisible();
    expect(screen.getByText(/AIML \+ Software Engineering/)).toBeVisible();
    expect(screen.getByRole("link", { name: "LeetCode" })).toHaveAttribute(
      "href",
      localContent.contact.social.leetcode,
    );
  });
  it("links each highlight to the case study that proves it", () => {
    render(<Highlights />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/projects/siri-core-modeling",
      "/projects/barterbrain",
      "/projects/barterbrain-nvc",
    ]);
    expect(screen.getByText("Siri Core Modeling")).toBeVisible();
    expect(screen.getByText("Hackathon winner")).toBeVisible();
    expect(screen.getByText("Top 5 finalist")).toBeVisible();
  });
  it("keeps education exclusively in About with visible achievements", () => {
    render(
      <>
        <About />
        <Experience />
      </>,
    );
    expect(screen.getAllByText(localContent.education[0].degree)).toHaveLength(
      1,
    );
    expect(screen.getAllByText(localContent.education[1].degree)).toHaveLength(
      1,
    );
    expect(screen.getByText("Machine Learning Intern")).toBeVisible();
    expect(screen.getByText(/50% tuition/)).toBeVisible();
    expect(document.querySelectorAll(".award-row")).toHaveLength(1);
    expect(screen.getByText(/Completed 3 internships/)).toBeVisible();
    expect(
      screen.getByText(/Volleyball captain and Youth Red Cross volunteer/),
    ).toBeVisible();
    expect(screen.getByText("One throughline: keep learning.")).toBeVisible();
  });
  it("keeps leadership in matching project notes without enlarging cards", async () => {
    render(
      <>
        <Experience />
        <Projects />
      </>,
    );
    expect(document.querySelector("#experience details")).toBeNull();
    expect(
      screen.getByRole("navigation", { name: "Experience timeline" }),
    ).toBeVisible();
    const opener = screen.getByRole("button", {
      name: "Project notes: MoodBites",
    });
    await userEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "MoodBites" });
    const close = within(dialog).getByRole("button", {
      name: "Close project notes",
    });
    close.focus();
    await userEvent.keyboard("{Tab}");
    expect(close).toHaveFocus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    expect(close).toHaveFocus();
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(
      localContent.leadership[0].bullets.length,
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close project notes" }),
    );
    expect(opener).toHaveFocus();
  });
  it("renders eleven unified project cards and an independent related startup link", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project-card")).toHaveLength(11);
    expect(document.querySelectorAll(".project-placeholder")).toHaveLength(5);
    expect(document.querySelector(".more-projects")).toBeNull();
    expect(document.querySelector("a a")).toBeNull();
    expect(
      screen.getByRole("link", { name: /From hackathon to startup/ }),
    ).toHaveAttribute("href", "/projects/barterbrain-nvc");
    expect(screen.getByText("Technica winner")).toBeVisible();
    expect(
      screen.getByText("Technica winner").closest(".project-image"),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("link", { name: /From hackathon to startup/ })
        .closest(".project-card"),
    ).not.toBeNull();
  });
  it("provides a controllable marquee and all skill groups", async () => {
    render(<Skills />);
    for (const group of localContent.skills)
      expect(
        screen.getByRole("heading", { name: group.category }),
      ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: /Pause technology/ }),
    );
    expect(
      screen.getByRole("button", { name: /Play technology/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("renders credential cards with safe external targets", () => {
    render(<Credentials />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(9);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
  it("renders authentic recommendation portraits and manual controls", async () => {
    render(<Testimonials />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    await userEvent.click(
      screen.getByRole("button", { name: "Next recommendation" }),
    );
    expect(screen.getByText("2 / 2")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Previous recommendation" }),
    );
    expect(screen.getByText("1 / 2")).toBeVisible();
    fireEvent.keyDown(screen.getByRole("region", { name: "Recommendations" }), {
      key: "ArrowLeft",
    });
    expect(screen.getByText("2 / 2")).toBeVisible();
  });
  it("keeps footer copyright, resume, and email without telephone links", () => {
    render(
      <>
        <Contact />
        <SiteFooter />
      </>,
    );
    expect(screen.getByText(/All rights reserved/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Send an email/ })).toHaveAttribute(
      "href",
      "mailto:" + localContent.contact.emails[0],
    );
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(screen.queryByText(/form is not connected/)).toBeNull();
    expect(document.querySelector("form")).toBeNull();
  });
  it("supports section wrappers without labels", () => {
    render(<Section>Content</Section>);
    expect(screen.getByText("Content")).toBeVisible();
  });
});
describe("navigation controls", () => {
  it("opens and closes the mobile dialog, restoring focus", async () => {
    render(<SiteHeader />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    await user.click(
      within(dialog).getByRole("button", { name: "Close menu" }),
    );
    expect(dialog).not.toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });
  it("updates active links immediately and closes the menu on selection", async () => {
    render(<SiteHeader />);
    await userEvent.click(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "About" },
      ),
    );
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "About" },
      ),
    ).toHaveAttribute("aria-current", "location");
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    await userEvent.click(
      within(screen.getByRole("navigation", { name: "Mobile" })).getByRole(
        "link",
        { name: "Work" },
      ),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
describe("ordered gallery", () => {
  const images = ["/images/a.jpg", "/images/b.jpg", "/images/c.jpg"];
  it("preserves DOM order, handles next/previous/keyboard and thumbnails", async () => {
    render(<ProjectGallery images={images} title="Demo" />);
    const slides = document.querySelectorAll(".gallery-slide img");
    expect(Array.from(slides).map((el) => el.getAttribute("src"))).toEqual(
      images,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(
      screen.getByRole("button", { name: "Show image 2" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      screen.getByRole("button", { name: "Previous image" }),
    );
    fireEvent.keyDown(screen.getByLabelText("Project images"), {
      key: "ArrowLeft",
    });
    expect(
      screen.getByRole("button", { name: "Show image 3" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Show image 1" }));
    expect(
      screen.getByRole("button", { name: "Show image 1" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  it("opens the chosen image and restores focus after lightbox navigation", async () => {
    render(<ProjectGallery images={images} title="Demo" />);
    const opener = screen.getByRole("button", { name: "Open image 2" });
    await userEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[1]);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Next full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[2]);
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Previous full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", images[0]);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close image viewer" }),
    );
    expect(opener).toHaveFocus();
  });
  it("renders no controls for empty media", () => {
    const { container } = render(<ProjectGallery images={[]} title="Empty" />);
    expect(container).toBeEmptyDOMElement();
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
    resolve(new Response("{}", { status: 200 }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("has been sent"),
    );
    expect(fetcher).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("name")).toHaveValue("");
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
