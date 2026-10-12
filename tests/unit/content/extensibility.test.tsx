/**
 * Adding content is one entry in a content file: no component, style or
 * route code changes. Each test adds an entry to a copy of the real content
 * and checks it validates and shows up everywhere it should.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { homeSections } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { sectionComponents } from "@/components/sections";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { validateContent } from "@/lib/content/schema";
import { caseStudies, workProjects } from "@/lib/projects";
import { skillBubbles } from "@/lib/skills";
import {
  contentWith,
  newCaseStudy,
  newCertification,
  newDegree,
  newJob,
  newProject,
  newPublication,
  newTestimonial,
} from "../../support/content";

/** Validates against the routes the content itself would generate. */
const valid = (content: PortfolioContent) =>
  validateContent(
    content,
    caseStudies(content.projects).map((p) => p.slug),
  );

/** Renders the whole home page for this content. */
const renderHome = (content: PortfolioContent) =>
  render(
    <>
      {homeSections.map(({ id }) => {
        const Section = sectionComponents[id];
        return <Section key={id} content={content} />;
      })}
    </>,
  );

describe("adding a project", () => {
  it("adds a work card, a filter count and skill evidence", async () => {
    const content = valid(contentWith((c) => c.projects.push(newProject())));
    renderHome(content);
    const card = document.querySelector('[data-project="orbit-planner"]')!;
    expect(
      within(card as HTMLElement).getByText("Orbit Planner"),
    ).toBeVisible();
    // It is the last card, and the "All work" count includes it.
    expect(Array.from(document.querySelectorAll(".project-card")).at(-1)).toBe(
      card,
    );
    expect(screen.getByRole("button", { name: /All work/ })).toHaveTextContent(
      String(workProjects(content.projects).length),
    );
    await userEvent.click(screen.getByRole("button", { name: /^Web/ }));
    expect(card.closest(".project-slot")).not.toHaveAttribute("data-hidden");
    expect(
      skillBubbles(content).find((b) => b.name === "FastAPI")?.evidence,
    ).toContain("Orbit Planner");
  });

  it("gives a project with a case study its own page and route", () => {
    const content = valid(
      contentWith((c) =>
        c.projects.push(newProject({ caseStudy: newCaseStudy() })),
      ),
    );
    const project = content.projects.at(-1)!;
    expect(caseStudies(content.projects).map((p) => p.slug)).toContain(
      "orbit-planner",
    );
    renderHome(content);
    expect(screen.getByRole("link", { name: "Orbit Planner" })).toHaveAttribute(
      "href",
      "/projects/orbit-planner",
    );
    render(
      <CaseStudy
        project={project}
        caseStudy={project.caseStudy!}
        projects={content.projects}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Orbit Planner" }),
    ).toBeVisible();
  });

  it("links a follow-up chapter from the project it continues", () => {
    const content = valid(
      contentWith((c) =>
        c.projects.push(
          newProject({
            slug: "pitchpulse-pro",
            title: "PitchPulse Pro",
            caseStudy: newCaseStudy(),
            chapter: {
              of: "pitchpulse",
              badge: "Startup",
              label: "Startup: PitchPulse Pro",
              teaser: "PitchPulse, as a company",
              back: "Back to the hackathon build",
            },
          }),
        ),
      ),
    );
    renderHome(content);
    // No card of its own: it is reached from PitchPulse.
    expect(
      document.querySelector('[data-project="pitchpulse-pro"]'),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: "Startup: PitchPulse Pro" }),
    ).toHaveAttribute("href", "/projects/pitchpulse-pro");
  });
});

describe("adding experience and education", () => {
  it("adds a role to the timeline and to skill evidence", () => {
    const content = valid(contentWith((c) => c.experience.push(newJob())));
    renderHome(content);
    const roles = document.querySelectorAll(".timeline-item");
    expect(roles).toHaveLength(content.experience.length);
    expect(roles[roles.length - 1]).toHaveTextContent("Northwind Labs");
    expect(
      skillBubbles(content).find((b) => b.name === "PyTorch")?.evidence,
    ).toContain("Northwind Labs");
  });

  it("adds a degree card with its own badge and colours", () => {
    const content = valid(
      contentWith((c) =>
        c.education.push(
          newDegree({
            activities: [
              { icon: "spark", tone: "gold", text: "Robot league." },
            ],
          }),
        ),
      ),
    );
    renderHome(content);
    const card = Array.from(
      document.querySelectorAll<HTMLElement>(".education-card"),
    ).at(-1)!;
    expect(card).toHaveTextContent("Graduate Certificate in Robotics");
    expect(card.querySelector(".school-monogram")).toHaveTextContent("EIT");
    expect(card.style.getPropertyValue("--tint-from")).toBe("var(--tint-rose)");
    expect(within(card).getByText("Robot league.")).toBeVisible();
  });
});

describe("adding skills and credentials", () => {
  it("adds a skill to an area, and a whole new area", async () => {
    const content = valid(
      contentWith((c) => {
        c.skills[0].skills.push("JAX");
        c.skills.push({ category: "Robotics", skills: ["ROS 2"] });
      }),
    );
    renderHome(content);
    expect(screen.getByText("JAX")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /Robotics/ }));
    expect(
      Array.from(document.querySelectorAll(".skill-bubble[data-lit]")).map(
        (b) => b.firstChild?.textContent,
      ),
    ).toEqual(["ROS 2"]);
  });

  it("adds a certification and a publication", () => {
    const content = valid(
      contentWith((c) => {
        c.certifications.push(
          newCertification({ logo: "/images/brands/certs/stanford.png" }),
        );
        c.publications.push(newPublication());
      }),
    );
    renderHome(content);
    const cert = screen.getByText("Deep Reinforcement Learning").closest("a")!;
    expect(cert).toHaveAttribute("href", "https://example.com/verify/123");
    expect(cert.querySelector(".cert-mark img")).toHaveAttribute(
      "src",
      "/images/brands/certs/stanford.png",
    );
    expect(
      screen.getByText("Fast Planning with Learned Heuristics"),
    ).toBeVisible();
  });

  it("adds a recommendation", () => {
    const content = valid(
      contentWith((c) => c.testimonials.push(newTestimonial())),
    );
    renderHome(content);
    expect(screen.getByText("A thoughtful engineer who ships.")).toBeVisible();
  });
});

describe("removing content", () => {
  it("drops empty sections instead of leaving empty headings", () => {
    const content = valid(
      contentWith((c) => {
        c.testimonials = [];
        c.publications = [];
        c.certifications = [];
      }),
    );
    renderHome(content);
    expect(document.getElementById("testimonials")).toBeNull();
    expect(document.getElementById("credentials")).toBeNull();
    expect(document.getElementById("projects")).not.toBeNull();
  });
});

describe("everything at once", () => {
  it("validates and renders content with one new entry of every kind", () => {
    const content = valid(
      contentWith((c) => {
        c.projects.push(newProject({ caseStudy: newCaseStudy() }));
        c.experience.push(newJob());
        c.education.push(newDegree());
        c.skills.push({ category: "Robotics", skills: ["ROS 2"] });
        c.certifications.push(newCertification());
        c.publications.push(newPublication());
        c.testimonials.push(newTestimonial());
      }),
    );
    renderHome(content);
    for (const text of [
      "Orbit Planner",
      "Northwind Labs",
      "Graduate Certificate in Robotics",
      "ROS 2",
      "Deep Reinforcement Learning",
      "Fast Planning with Learned Heuristics",
      "A thoughtful engineer who ships.",
    ])
      expect(screen.getAllByText(text).length, text).toBeGreaterThan(0);
  });

  it("has a component for every home section", () => {
    expect(Object.keys(sectionComponents).sort()).toEqual(
      homeSections.map((s) => s.id).sort(),
    );
  });
});
