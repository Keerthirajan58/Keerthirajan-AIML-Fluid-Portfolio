import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  availableProjectFilters,
  matchesProjectFilter,
  projectFilters,
} from "@/lib/projectFilters";
import { getFeaturedProjects, getGridProjects } from "@/lib/projects";
import { Projects } from "@/components/sections/Projects";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { Experience } from "@/components/sections/Experience";
import { ExperienceJourney } from "@/components/ExperienceJourney";
import { CompanyMark } from "@/components/ui/CompanyMark";
import { Contact } from "@/components/sections/Contact";
import { ContactForm } from "@/components/ContactForm";

// Contact lazy-loads its form; the only dynamic import rendered in this file.
vi.mock("next/dynamic", async () => {
  const { ContactForm } = await import("@/components/ContactForm");
  return { default: () => ContactForm };
});

const allWork = [...getFeaturedProjects(), ...getGridProjects()];
describe("project discovery", () => {
  it("derives non-empty filter counts from actual work, excluding credentials and NVC child", () => {
    const counts = availableProjectFilters(allWork);
    expect(Object.fromEntries(counts.map((f) => [f.id, f.count]))).toEqual({
      all: 11,
      aiml: 10,
      genai: 5,
      hackathon: 2,
      web: 4,
      mobile: 3,
      cv: 3,
    });
    expect(availableProjectFilters([])).toEqual([
      { id: "all", label: "All work", count: 0 },
    ]);
    expect(matchesProjectFilter([], "all")).toBe(true);
    expect(matchesProjectFilter([], "aiml")).toBe(false);
  });
  it("filters every category without changing order, losing projects, or leaving hidden links", async () => {
    render(<Projects />);
    const user = userEvent.setup();
    const filters = screen.getByRole("group", { name: "Filter projects" });
    for (const filter of [...projectFilters, projectFilters[0]]) {
      const button = within(filters).getByRole("button", {
        name: filter.label,
      });
      await user.click(button);
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute("aria-pressed", "true");
      const expected = allWork.filter((p) =>
        matchesProjectFilter(p.filters, filter.id),
      );
      // Filtered-out cards stay mounted (so they can animate out) but are
      // inert and hidden from assistive tech.
      expect(
        Array.from(
          document.querySelectorAll(
            ".project-slot:not([data-hidden]) .project-card",
          ),
        ).map((el) => el.getAttribute("data-project")),
      ).toEqual(expected.map((p) => p.slug));
      document
        .querySelectorAll(".project-slot[data-hidden]")
        .forEach((slot) => {
          expect(slot).toHaveAttribute("inert");
          expect(slot).toHaveAttribute("aria-hidden", "true");
        });
      expect(screen.getByRole("status")).toHaveTextContent(
        `${expected.length} projects`,
      );
      expect(document.querySelector("a a")).toBeNull();
      expect(
        document.querySelector('a[href="portfolio-details.html"]'),
      ).toBeNull();
    }
  });
  it("supports keyboard activation and safely handles empty or singular sources", async () => {
    const { rerender } = render(<ProjectExplorer items={[]} />);
    expect(screen.getByText("No projects in this category yet.")).toBeVisible();
    rerender(
      <ProjectExplorer
        items={[{ slug: "one", filters: ["web"], card: <p>One project</p> }]}
      />,
    );
    const button = screen.getByRole("button", { name: "Web" });
    button.focus();
    await userEvent.keyboard(" ");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("1 project");
  });
  it("lines cards up in standard rows and re-flows them after filtering", async () => {
    // jsdom has no layout: a 1000px grid and fixed natural card heights.
    const natural: Record<string, number> = { a: 300, b: 420, c: 360, d: 280 };
    vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(
      function (this: Element) {
        return this.classList.contains("project-grid") ? 1000 : 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        return natural[this.dataset.slug ?? ""] ?? 0;
      },
    );
    render(
      <ProjectExplorer
        items={["a", "b", "c", "d"].map((slug) => ({
          slug,
          filters: slug === "b" ? ["web"] : ["aiml"],
          card: <p>{slug}</p>,
        }))}
      />,
    );
    const grid = document.querySelector<HTMLElement>(".project-grid")!;
    const slot = (slug: string) =>
      document.querySelector<HTMLElement>(
        `.project-slot[data-slug="${slug}"]`,
      )!;
    // Three columns of (1000 - 2 × 18) / 3px; row one takes b's 420px.
    expect(grid).toHaveAttribute("data-masonry", "true");
    for (const slug of ["a", "b", "c"]) {
      expect(slot(slug).style.height).toBe("420px");
      expect(slot(slug).style.getPropertyValue("--y")).toBe("0px");
    }
    expect(slot("b").style.getPropertyValue("--x")).toBe(
      `${(1000 - 36) / 3 + 18}px`,
    );
    expect(slot("d").style.height).toBe("280px");
    expect(slot("d").style.getPropertyValue("--y")).toBe("438px");
    expect(grid.style.height).toBe("718px");

    await userEvent.click(screen.getByRole("button", { name: /AIML/ }));
    // b leaves; a, c and d close ranks in one row as tall as c.
    expect(slot("b")).toHaveAttribute("data-hidden", "true");
    expect(slot("d").style.getPropertyValue("--y")).toBe("0px");
    expect(slot("d").style.getPropertyValue("--x")).toBe(
      `${((1000 - 36) / 3 + 18) * 2}px`,
    );
    expect(slot("a").style.height).toBe("360px");
    expect(grid.style.height).toBe("360px");
  });
  it("keeps confidential project notes accessible without linking a dead legacy route", async () => {
    render(<Projects />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Project notes: Twitter Sentiment Analysis",
      }),
    );
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Due to confidentiality agreements with TCS",
    );
  });
});
describe("experience tracker", () => {
  it("marks the role at the reading line, fills the progress line, and cleans up", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        callbacks.push(callback);
        return callbacks.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<Experience />);
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(".timeline-item"),
    );
    const place = (active: number) =>
      items.forEach((item, i) => {
        const top = active === i ? 100 : i < active ? -1000 : 2000;
        item.getBoundingClientRect = () =>
          ({ top, bottom: top + 300, height: 300 }) as DOMRect;
      });
    const journey = document.querySelector<HTMLElement>(".experience-journey")!;
    journey.getBoundingClientRect = () =>
      ({ top: -200, bottom: 1000, height: 1200 }) as DOMRect;
    place(1);
    act(() => callbacks.shift()?.(0));
    expect(items[1]).toHaveAttribute("data-active");
    expect(items[0]).toHaveAttribute("data-reached");
    expect(items[2]).not.toHaveAttribute("data-reached");
    expect(
      Number(journey.style.getPropertyValue("--progress")),
    ).toBeGreaterThan(0);
    place(2);
    fireEvent.scroll(window);
    act(() => callbacks.shift()?.(0));
    expect(items[2]).toHaveAttribute("data-active");
    expect(items[1]).not.toHaveAttribute("data-active");
    fireEvent.resize(window);
    act(() => callbacks.shift()?.(0));
    expect(items[2]).toHaveAttribute("data-active");
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
  it("bolds known tools inside role bullets without changing the text", () => {
    render(<Experience />);
    const bullet = screen.getByText(/Built and evaluated AIML pipelines/);
    expect(within(bullet).getByText("PyTorch").tagName).toBe("STRONG");
    expect(bullet).toHaveTextContent(
      "Built and evaluated AIML pipelines using PyTorch, Hugging Face Transformers, LoRA/PEFT",
    );
  });
  it("supports a new company mark and an empty timeline without exceptions", () => {
    render(
      <>
        <ExperienceJourney>No roles</ExperienceJourney>
        <CompanyMark company="New company" />
      </>,
    );
    expect(screen.getByText("No roles")).toBeVisible();
    expect(document.querySelector(".company-mark svg")).not.toBeNull();
  });
});
describe("contact availability", () => {
  it("opens the contact form from Say hello, posting to Formspree when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_FORM_ID", "abcdefgh");
    render(<Contact />);
    expect(document.querySelector("form")).toBeNull();
    const hello = screen.getByRole("link", { name: /Say hello/ });
    expect(hello).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    await userEvent.click(hello);
    expect(screen.getByRole("button", { name: /Send message/ })).toBeVisible();
    expect(document.querySelector("form")).toHaveAttribute(
      "action",
      "https://formspree.io/f/abcdefgh",
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
