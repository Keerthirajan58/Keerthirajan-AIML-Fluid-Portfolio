import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { Skills } from "@/components/sections/skills/Skills";
import { SkillsCloud } from "@/components/sections/skills/SkillsCloud";
import { contentWith } from "../../../support/content";

describe("skills", () => {
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
  it("gives a sixth area the first colour again and shows its skills", async () => {
    const content = contentWith((c) =>
      c.skills.push({ category: "Robotics", skills: ["ROS 2", "PyTorch"] }),
    );
    render(<Skills content={content} />);
    const tab = screen.getByRole("button", { name: /Robotics/ });
    expect(tab).toHaveAttribute("data-tone", "1");
    expect(screen.getByText("ROS 2")).toBeVisible();
    await userEvent.click(tab);
    expect(document.querySelectorAll(".skill-bubble[data-lit]")).toHaveLength(
      2,
    );
  });

  it("works without a note or evidence", () => {
    render(
      <SkillsCloud
        categories={["Area"]}
        skills={[{ name: "Lonely skill", categories: ["Area"], evidence: [] }]}
      />,
    );
    expect(document.querySelector(".skills-note")).toBeNull();
    expect(document.querySelector(".skill-evidence")).toBeNull();
    expect(screen.getByText("Lonely skill")).toHaveAttribute("data-size", "0");
  });

  it("explains the bubbles under the panel", () => {
    render(<Skills />);
    expect(
      screen.getByText(
        /Bigger bubbles appear in more of my projects and roles/,
      ),
    ).toBeVisible();
  });
});
