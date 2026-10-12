import { describe, it, expect, vi } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Hero } from "@/components/sections/Hero";
import { heroSentence } from "@/content/heroTokens";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { projectCover } from "@/lib/imageSize";
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
  it("decodes the hero line as tokens while screen readers get one sentence", () => {
    render(<Hero />);
    expect(screen.getByText(heroSentence)).toHaveClass("sr-only");
    const tokens = document.querySelectorAll(".token-stream .tok");
    expect(tokens.length).toBeGreaterThan(5);
    tokens.forEach((t) => expect(t).toHaveAttribute("aria-hidden", "true"));
    expect(document.querySelector(".tok-probs-note")).toHaveTextContent(
      "Illustrative",
    );
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
    // Owner's wording: one "Engineer", not two.
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "AIML / Software Engineer",
      }),
    ).toBeVisible();
  });
  it("keeps leadership in matching project notes without enlarging cards", async () => {
    render(
      <>
        <Experience />
        <Projects />
      </>,
    );
    expect(document.querySelector("#experience details")).toBeNull();
    expect(document.querySelectorAll(".timeline-item")).toHaveLength(
      localContent.experience.length,
    );
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
    // Placeholders stand in only until a cover screenshot is dropped in.
    const waiting = [
      ...getFeaturedProjects(localContent.projects),
      ...getGridProjects(localContent.projects),
    ].filter((p) => !projectCover(p));
    expect(waiting.length).toBeLessThanOrEqual(5);
    expect(document.querySelectorAll(".project-placeholder")).toHaveLength(
      waiting.length,
    );
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
  it("lists every skill and lets each area bring its own skills forward", async () => {
    render(<Skills />);
    const total = new Set(localContent.skills.flatMap((g) => g.skills)).size;
    expect(document.querySelectorAll(".skill-bubble")).toHaveLength(total);
    const group = localContent.skills[1];
    await userEvent.click(
      screen.getByRole("button", { name: new RegExp(group.category) }),
    );
    expect(
      screen.getByRole("button", { name: new RegExp(group.category) }),
    ).toHaveAttribute("aria-pressed", "true");
    const lit = Array.from(
      document.querySelectorAll(".skill-bubble:not([data-dim])"),
    ).map((el) => el.firstChild?.textContent);
    expect(lit).toEqual(group.skills);
    // Each area's tab is filled with its own colour, and so are the area's
    // bubbles when it is chosen (every bubble carries its area's dot).
    const tabs = screen.getByRole("group", {
      name: "Highlight skills by area",
    });
    expect(
      Array.from(tabs.querySelectorAll(":scope > button")).map((b) =>
        b.getAttribute("data-tone"),
      ),
    ).toEqual([null, "1", "2", "3", "4", "5"]);
    // No dots on the tabs any more: the fill is the colour.
    expect(tabs.querySelector(".tone-dot")).toBeNull();
    const litBubbles = document.querySelectorAll(".skill-bubble[data-lit]");
    expect(litBubbles).toHaveLength(group.skills.length);
    litBubbles.forEach((el) => expect(el).toHaveAttribute("data-tone", "2"));
    expect(
      document.querySelector(".skill-bubble")?.getAttribute("data-tone"),
    ).toBe("1");
    // Every switch replays the pop across the chosen bubbles.
    const cloud = document.getElementById("skill-cloud")!;
    expect(cloud).toHaveAttribute("data-wave", "a");
    await userEvent.click(screen.getByRole("button", { name: /^All/ }));
    expect(cloud).toHaveAttribute("data-wave", "b");
    expect(document.querySelectorAll(".skill-bubble[data-lit]")).toHaveLength(
      0,
    );
    // Evidence comes from real stacks: PyTorch appears in Apple and project tags.
    const evidence = screen.getAllByText(/used in .*Apple/);
    expect(evidence.length).toBeGreaterThan(0);
    evidence.forEach((el) => expect(el).toHaveClass("sr-only"));
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
describe("case-study gallery", () => {
  const images = [
    { src: "/images/a.jpg", width: 1600, height: 1000 },
    { src: "/images/b.jpg", width: 900, height: 1200 },
    { src: "/images/c.jpg", width: 1200, height: 1200 },
  ];
  /** jsdom has no layout: give the wall a width the test controls. */
  const wallWidth = (width: () => number) =>
    vi
      .spyOn(Element.prototype, "clientWidth", "get")
      .mockImplementation(function (this: Element) {
        return this.classList.contains("gallery-wall") ? width() : 0;
      });

  it("lays the images out in justified rows, each at its own shape", () => {
    let width = 1000;
    wallWidth(() => width);
    const resize: { callback?: () => void } = {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize.callback = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      frames.push(cb),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<ProjectGallery images={images} title="Demo" />);
    const wall = document.querySelector<HTMLElement>(".gallery-wall")!;
    const tiles = Array.from(
      wall.querySelectorAll<HTMLElement>(".gallery-tile"),
    );
    expect(
      tiles.map((t) => t.querySelector("img")!.getAttribute("src")),
    ).toEqual(images.map((i) => i.src));
    // Portrait stays portrait: each tile carries its image's own shape.
    expect(tiles.map((t) => t.style.getPropertyValue("--ratio"))).toEqual([
      "1.6000",
      "0.7500",
      "1.0000",
    ]);
    expect(wall).toHaveAttribute("data-justified", "true");
    const size = (t: HTMLElement) => ({
      x: parseFloat(t.style.getPropertyValue("--x")),
      y: parseFloat(t.style.getPropertyValue("--y")),
      w: parseFloat(t.style.width),
      h: parseFloat(t.style.height),
    });
    // 1000px wide: one row, one height, edge to edge.
    const row = (1000 - 2 * 14) / 3.35;
    tiles.map(size).forEach((t, i) => {
      expect(t.y).toBe(0);
      expect(t.h).toBeCloseTo(row);
      expect(t.w / t.h).toBeCloseTo([1.6, 0.75, 1][i]);
    });
    expect(size(tiles[0]).x).toBe(0);
    expect(size(tiles[2]).x + size(tiles[2]).w).toBeCloseTo(1000);
    expect(parseFloat(wall.style.height)).toBeCloseTo(row);
    // On a phone-width wall the rows re-balance for the new width.
    width = 500;
    resize.callback?.();
    act(() => frames.splice(0).forEach((frame) => frame(0)));
    tiles
      .map(size)
      .forEach((t) => expect(t.h).toBeCloseTo((500 - 2 * 10) / 3.35));
    expect(size(tiles[2]).x + size(tiles[2]).w).toBeCloseTo(500);
  });

  it("gives each image a size hint from its own shape", () => {
    render(<ProjectGallery images={images.slice(0, 2)} title="Pair" />);
    expect(
      Array.from(document.querySelectorAll(".gallery-tile img")).map((img) =>
        img.getAttribute("sizes"),
      ),
    ).toEqual([
      "(max-width: 879px) 60vw, 576px",
      "(max-width: 879px) 60vw, 270px",
    ]);
  });

  it("opens the chosen image and restores focus after lightbox navigation", async () => {
    render(<ProjectGallery images={images} title="Demo" />);
    const opener = screen.getByRole("button", { name: "Open image 2 of 3" });
    await userEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[1].src,
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "alt",
      "Demo, image 2",
    );
    expect(dialog).toHaveTextContent("2 / 3");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Next full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[2].src,
    );
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[0].src,
    );
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Previous full image" }),
    );
    expect(within(dialog).getByRole("img")).toHaveAttribute(
      "src",
      images[1].src,
    );
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
