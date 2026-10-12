import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { skillBubbles } from "@/lib/skills";
import { contentWith, newJob, newProject } from "../../support/content";

describe("skill bubbles", () => {
  it("makes one bubble per distinct skill, in content order", () => {
    const bubbles = skillBubbles(localContent);
    const names = localContent.skills.flatMap((g) => g.skills);
    expect(bubbles.map((b) => b.name)).toEqual([...new Set(names)]);
  });

  it("finds evidence in role bullets and project stacks", () => {
    const pytorch = skillBubbles(localContent).find(
      (b) => b.name === "PyTorch",
    )!;
    expect(pytorch.evidence).toContain("Apple");
    expect(pytorch.evidence).toContain("Siri Core Modeling");
    // Chapters are not cards, so they never count as evidence.
    expect(pytorch.evidence).not.toContain(
      "BarterBrAIn — From Hackathon to Startup",
    );
  });

  it("collects every area a shared skill belongs to", () => {
    const content = contentWith((c) => {
      c.skills[1].skills.push("PyTorch");
    });
    expect(
      skillBubbles(content).find((b) => b.name === "PyTorch")?.categories,
    ).toEqual(["AI / ML", "GenAI & LLMs"]);
  });

  it("picks up evidence from new roles and projects", () => {
    const content = contentWith((c) => {
      c.experience.push(newJob());
      c.projects.push(newProject());
    });
    const fastapi = skillBubbles(content).find((b) => b.name === "FastAPI")!;
    expect(fastapi.evidence).toEqual(
      expect.arrayContaining(["Northwind Labs", "Orbit Planner"]),
    );
  });
});
