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
      expect(
        Array.from(document.querySelectorAll(".project-card")).map((el) =>
          el.getAttribute("data-project"),
        ),
      ).toEqual(expected.map((p) => p.slug));
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
  it("tracks the nearest role on scroll/resize, responds instantly to selection, and cleans up", async () => {
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
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".experience-card"),
    );
    cards.forEach((card, i) => {
      card.getBoundingClientRect = () =>
        ({ top: i === 1 ? 100 : 2000, height: 300 }) as DOMRect;
    });
    act(() => callbacks.shift()?.(0));
    const nav = screen.getByRole("navigation", { name: "Experience timeline" });
    expect(within(nav).getByRole("link", { name: /TCS/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    await userEvent.click(within(nav).getByRole("link", { name: /Apple/ }));
    expect(within(nav).getByRole("link", { name: /Apple/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    fireEvent.scroll(window);
    act(() => callbacks.shift()?.(0));
    expect(within(nav).getByRole("link", { name: /TCS/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    fireEvent.resize(window);
    act(() => callbacks.shift()?.(0));
    expect(within(nav).getByRole("link", { name: /TCS/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
  it("supports a new company mark and an empty timeline without exceptions", () => {
    render(
      <>
        <ExperienceJourney steps={[]}>No roles</ExperienceJourney>
        <CompanyMark company="New company" />
      </>,
    );
    expect(screen.getByText("No roles")).toBeVisible();
    expect(document.querySelector(".company-mark svg")).not.toBeNull();
  });
});
describe("contact availability", () => {
  it("only renders a message form when a valid endpoint is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_FORMSPREE_FORM_ID", "abcdefgh");
    render(<Contact />);
    expect(screen.getByRole("button", { name: /Send message/ })).toBeVisible();
    expect(document.querySelector("form")).toHaveAttribute(
      "action",
      "https://formspree.io/f/abcdefgh",
    );
  });
  it("keeps the standalone form's email fallback safe", () => {
    render(<ContactForm email="test@example.com" />);
    expect(screen.getByRole("link", { name: /Send an email/ })).toHaveAttribute(
      "href",
      "mailto:test@example.com",
    );
  });
});
