import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import { Projects } from "@/components/sections/projects/Projects";
import { ProjectCard } from "@/components/sections/projects/ProjectCard";
import { ProjectExplorer } from "@/components/sections/projects/ProjectExplorer";
import { availableFilters, matchesFilter } from "@/lib/filters";
import { workProjects } from "@/lib/projects";
import { projectCover } from "@/lib/server/images";
import {
  contentWith,
  newCaseStudy,
  newProject,
} from "../../../support/content";

const work = workProjects(localContent.projects);

describe("work cards", () => {
  it("keeps leadership in matching project notes without enlarging cards", async () => {
    render(<Projects />);
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
    const moodbites = localContent.projects.find(
      (p) => p.slug === "moodbites",
    )!;
    const bullets = moodbites.notes!.find((b) => "bullets" in b) as {
      bullets: string[];
    };
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(
      bullets.bullets.length,
    );
    expect(
      within(dialog).getByText("Team Lead · Sep 2024 - Nov 2024"),
    ).toHaveClass("notes-meta");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close project notes" }),
    );
    expect(opener).toHaveFocus();
  });
  it("renders one card per work project and links the startup chapter from its original", () => {
    render(<Projects />);
    expect(document.querySelectorAll(".project-card")).toHaveLength(
      work.length,
    );
    // Placeholders stand in only until a cover screenshot is dropped in.
    const waiting = work.filter((p) => !projectCover(p));
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
  it("renders notes blocks in order: text, meta, list", async () => {
    render(
      <ProjectCard
        index={0}
        project={newProject({
          notes: [
            { text: "First paragraph." },
            { meta: "Python · 2027" },
            { bullets: ["One", "Two"] },
          ],
        })}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Project notes: Orbit Planner" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Orbit Planner" });
    const blocks = Array.from(
      dialog.querySelectorAll(":scope > p, :scope > ul"),
    );
    expect(blocks.map((b) => b.textContent)).toEqual([
      "First paragraph.",
      "Python · 2027",
      "OneTwo",
    ]);
  });

  it("links a card's title to its case study, its GitHub, or nothing", () => {
    const { rerender } = render(
      <ProjectCard
        index={0}
        project={newProject({ caseStudy: newCaseStudy() })}
      />,
    );
    expect(screen.getByRole("link", { name: "Orbit Planner" })).toHaveAttribute(
      "href",
      "/projects/orbit-planner",
    );
    expect(screen.getByRole("link", { name: /Read case study/ })).toBeVisible();
    expect(screen.getByText("Case study")).toBeVisible();
    rerender(
      <ProjectCard
        index={1}
        project={newProject({ links: { github: "https://github.com/x/y" } })}
      />,
    );
    expect(screen.getByRole("link", { name: "Orbit Planner" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(
      screen.getByRole("link", { name: /View on GitHub/ }),
    ).toHaveAttribute("rel", "noopener noreferrer");
    rerender(<ProjectCard index={2} project={newProject()} />);
    expect(screen.queryByRole("link")).toBeNull();
    // No screenshot yet: the real stack stands in, coloured by position.
    expect(document.querySelector(".project-placeholder")).toHaveClass(
      "placeholder-2",
    );
    expect(screen.getByText("Screenshot coming soon")).toBeVisible();
  });

  it("skips chapter links for projects that aren't chapters", () => {
    render(
      <ProjectCard
        index={0}
        project={newProject()}
        chapters={[newProject({ slug: "x" })]}
      />,
    );
    expect(document.querySelector(".project-next-chapter")).toBeNull();
  });
});

describe("project discovery", () => {
  it("filters every category without changing order, losing projects, or leaving hidden links", async () => {
    render(<Projects />);
    const user = userEvent.setup();
    const filters = screen.getByRole("group", { name: "Filter projects" });
    const choices = availableFilters(work);
    for (const filter of [...choices, choices[0]]) {
      const button = within(filters).getByRole("button", {
        name: filter.label,
      });
      await user.click(button);
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute("aria-pressed", "true");
      const expected = work.filter((p) => matchesFilter(p.filters, filter.id));
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
    // Cards that travel get the lift and a place in the cascade; a card that
    // stays put does not.
    expect(slot("c")).toHaveAttribute("data-moving");
    expect(slot("d")).toHaveAttribute("data-moving");
    expect(slot("a")).not.toHaveAttribute("data-moving");
    expect(
      ["a", "c", "d"].map((k) => slot(k).style.getPropertyValue("--order")),
    ).toEqual(["0", "1", "2"]);
  });
  it("slides the ink pill only on click while the glass lens follows the pointer", async () => {
    const chips = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(".project-filters > button"),
      );
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
      function (this: HTMLElement) {
        return Math.max(0, chips().indexOf(this)) * 100;
      },
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(90);
    render(
      <ProjectExplorer
        items={[
          { slug: "a", filters: ["aiml"], card: <p>a</p> },
          { slug: "b", filters: ["web"], card: <p>b</p> },
        ]}
      />,
    );
    const bar = screen.getByRole("group", { name: "Filter projects" });
    const marks = () => ({
      ink: bar.style.getPropertyValue("--ix"),
      lens: bar.style.getPropertyValue("--lx"),
    });
    const pointer = (type: string, el: Element, pointerType = "mouse") => {
      const event = new Event(type, { bubbles: type !== "pointerleave" });
      Object.assign(event, { pointerType });
      fireEvent(el, event);
    };
    // "All work" is chosen: both marks rest on it.
    expect(marks()).toEqual({ ink: "0px", lens: "0px" });
    // Hovering another chip moves only the glass lens …
    const web = screen.getByRole("button", { name: "Web" });
    pointer("pointerover", web);
    expect(marks()).toEqual({ ink: "0px", lens: "200px" });
    // … which returns to the choice when the pointer leaves.
    pointer("pointerleave", bar);
    expect(marks()).toEqual({ ink: "0px", lens: "0px" });
    // A click moves the ink pill.
    await userEvent.click(web);
    expect(marks()).toEqual({ ink: "200px", lens: "200px" });
    // Touch never drags the lens around.
    pointer(
      "pointerover",
      screen.getByRole("button", { name: "AIML" }),
      "touch",
    );
    expect(marks().lens).toBe("200px");
    // The white label under the pill is a decorative copy.
    expect(bar.querySelector(".chip-ink")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(bar.querySelector(".chip-ink")).toHaveTextContent("Web");
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
  it("adds a new project's card and its filter chip", async () => {
    const content = contentWith((c) =>
      c.projects.push(newProject({ filters: ["startup"] })),
    );
    render(<Projects content={content} />);
    expect(document.querySelectorAll(".project-card")).toHaveLength(
      work.length + 1,
    );
    await userEvent.click(screen.getByRole("button", { name: /Startups/ }));
    expect(
      Array.from(
        document.querySelectorAll(
          ".project-slot:not([data-hidden]) .project-card",
        ),
      ).map((el) => el.getAttribute("data-project")),
    ).toEqual(["orbit-planner"]);
  });
});
