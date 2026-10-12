import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { About } from "@/components/sections/about/About";
import { EducationCard } from "@/components/sections/about/EducationCard";
import { Experience } from "@/components/sections/experience/Experience";
import { newDegree } from "../../../support/content";

describe("about", () => {
  it("keeps education exclusively in About with visible achievements", () => {
    render(
      <>
        <About />
        <Experience />
      </>,
    );
    for (const e of localContent.education)
      expect(screen.getAllByText(e.degree)).toHaveLength(1);
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

  it("shows the story, highlight chips in their tones and the location pill", () => {
    render(<About />);
    for (const paragraph of localContent.profile.bio)
      expect(screen.getByText(paragraph)).toBeVisible();
    expect(
      Array.from(document.querySelectorAll(".achievement-list .chip-icon")).map(
        (chip) => chip.getAttribute("data-tone"),
      ),
    ).toEqual(["gold", "ink", "navy"]);
    const pill = document.querySelector<HTMLElement>(".location-pill")!;
    expect(pill).toHaveTextContent("San Francisco, CA");
    expect(pill).toHaveTextContent("Open to relocation");
    expect(
      screen.getByRole("img", { name: localContent.profile.name }),
    ).toHaveAttribute("src", localContent.profile.photo);
  });

  it("builds each education card from its data", () => {
    render(<About />);
    const cards = document.querySelectorAll<HTMLElement>(".education-card");
    expect(cards).toHaveLength(localContent.education.length);
    const [gw, svce] = cards;
    expect(gw.style.getPropertyValue("--tint-from")).toBe("var(--tint-navy)");
    expect(gw.style.getPropertyValue("--tint-to")).toBe("var(--tint-gold)");
    expect(gw.querySelector(".school-monogram")).toHaveTextContent("GW");
    expect(gw.querySelector(".school-monogram")).toHaveAttribute(
      "data-tone",
      "navy",
    );
    expect(within(gw).getByText("Graduate")).toBeVisible();
    expect(
      within(svce).getByRole("img", { name: "SVCE, Sriperumbudur emblem" }),
    ).toBeVisible();
    expect(
      Array.from(svce.querySelectorAll(".education-activity-icon")).map((i) =>
        i.getAttribute("data-tone"),
      ),
    ).toEqual(["navy", "crimson"]);
    expect(
      within(svce).getByText(/^Relevant Coursework: Data Structures, Natural/),
    ).toBeVisible();
  });

  it("renders a minimal new degree without empty rows", () => {
    render(<EducationCard entry={newDegree()} />);
    expect(screen.getByText("Graduate Certificate in Robotics")).toBeVisible();
    expect(document.querySelector(".school-monogram")).not.toHaveAttribute(
      "data-tone",
    );
    expect(document.querySelectorAll(".education-card li")).toHaveLength(0);
  });

  it("renders notes and coursework rows for a richer degree", () => {
    render(
      <EducationCard
        entry={newDegree({
          logo: { src: "/images/brands/svce.jpg", alt: "Emblem" },
          notes: ["Thesis on motion planning."],
          coursework: ["Robotics", "Control"],
          award: { title: "Best Thesis", detail: "Awarded in 2028." },
        })}
      />,
    );
    expect(screen.getByRole("img", { name: "Emblem" })).toBeVisible();
    expect(screen.getByText("Thesis on motion planning.")).toBeVisible();
    expect(
      screen.getByText("Relevant Coursework: Robotics, Control."),
    ).toBeVisible();
    expect(screen.getByText("Best Thesis").tagName).toBe("STRONG");
  });
});
