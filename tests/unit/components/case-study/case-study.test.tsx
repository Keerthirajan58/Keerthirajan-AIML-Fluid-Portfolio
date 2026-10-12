import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import type { Project } from "@/content/types";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { newCaseStudy, newProject } from "../../../support/content";

const { projects } = localContent;
const study = (slug: string, all: readonly Project[] = projects) => {
  const project = all.find((p) => p.slug === slug)!;
  return render(
    <CaseStudy
      project={project}
      caseStudy={project.caseStudy!}
      projects={all}
    />,
  );
};

describe("case study page", () => {
  it("shows the header, real link buttons and the story", () => {
    study("pitchpulse");
    expect(
      screen.getByRole("heading", { level: 1, name: "PitchPulse" }),
    ).toBeVisible();
    const meta = document.querySelector(".case-meta")!;
    expect(meta).toHaveTextContent("FocusAI Sports Science / Hackathon");
    expect(meta).toHaveTextContent("TimelineFeb 2026");
    expect(
      Array.from(document.querySelectorAll(".case-action")).map((a) => [
        a.getAttribute("data-kind"),
        a.textContent,
      ]),
    ).toEqual([
      ["github", "View on GitHub"],
      ["devpost", "View on Devpost"],
    ]);
    for (const a of document.querySelectorAll(".case-action")) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(
      Array.from(document.querySelectorAll(".case-body h2")).map(
        (h) => h.textContent,
      ),
    ).toEqual(["Overview", "Problem", "How I built it", "Impact"]);
    // The tech list replaces the card tags.
    expect(screen.getByText("Presage SDK")).toBeVisible();
    expect(screen.getAllByRole("link", { name: /Back to work/ })).toHaveLength(
      2,
    );
  });

  it("links a project and its follow-up chapter both ways", () => {
    const { unmount } = study("barterbrain");
    expect(
      screen.getByRole("link", { name: /The next chapter/ }),
    ).toHaveAttribute("href", "/projects/barterbrain-nvc");
    expect(
      screen.getByText(
        "Technica winner · Best Hack for Social Good · Sustainability",
      ),
    ).toBeVisible();
    unmount();
    study("barterbrain-nvc");
    expect(
      screen.getByRole("link", {
        name: "Explore the original hackathon product",
      }),
    ).toHaveAttribute("href", "/projects/barterbrain");
    // Metrics, bodies and the write-up link render from the sections.
    const metrics = document.querySelector(".case-metrics")!;
    expect(within(metrics as HTMLElement).getByText("215")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Read the write-up/ }),
    ).toBeVisible();
  });

  it("shows the Apple bullets on Siri's page and its card tags", () => {
    study("siri-core-modeling");
    expect(
      screen.getByRole("heading", { level: 2, name: "At Apple" }),
    ).toBeVisible();
    expect(document.querySelector(".case-actions")).toBeNull();
    expect(screen.getByText("LLM Evaluation")).toBeVisible();
  });

  it("renders a new case study, section media included", () => {
    const fresh = newProject({
      caseStudy: newCaseStudy({
        sections: [
          {
            heading: "Results",
            body: "It works.",
            media: {
              src: "/images/projects/pitchpulse/cover.jpg",
              alt: "Dashboard",
            },
          },
        ],
      }),
    });
    study("orbit-planner", [...projects, fresh]);
    expect(
      screen.getByRole("heading", { level: 1, name: "Orbit Planner" }),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: "Dashboard" })).toBeVisible();
    expect(document.querySelectorAll(".gallery-tile")).toHaveLength(2);
    expect(document.querySelector(".related-mini")).toBeNull();
    expect(document.querySelector(".achievement")).toBeNull();
  });
});
