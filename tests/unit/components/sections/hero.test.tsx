import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { socialNetworks } from "@/components/ui/SocialLinks";
import { heroSentence } from "@/content/heroTokens";
import { Hero } from "@/components/sections/hero/Hero";
import { contentWith } from "../../../support/content";

describe("hero", () => {
  it("renders the name first and real contact/work destinations", () => {
    render(<Hero />);
    // A real space keeps screen readers from reading the name as one word.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Keerthirajan Senthilkumar",
    );
    expect(
      screen.getByRole("link", { name: /Explore my work/ }),
    ).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: /View résumé/ })).toHaveAttribute(
      "href",
      localContent.contact.resumeUrl,
    );
    expect(screen.getByText("Apple AIML Intern")).toBeVisible();
    expect(screen.getByText("San Francisco, CA")).toBeVisible();
    expect(screen.getByText(/AIML \+ Software Engineering/)).toBeVisible();
    for (const social of localContent.contact.socials)
      expect(
        screen.getByRole("link", {
          name: socialNetworks[social.network].label,
        }),
      ).toHaveAttribute("href", social.href);
  });

  it("colours each fact's icon from its data", () => {
    render(<Hero />);
    const icons = Array.from(
      document.querySelectorAll(".hero-facts .fact-icon"),
    );
    expect(icons.map((i) => i.className)).toEqual([
      "fact-icon",
      "fact-icon fact-school",
      "fact-icon fact-place",
    ]);
    icons.forEach((icon) => expect(icon.querySelector("svg")).not.toBeNull());
  });

  it("types the line out character by character; screen readers get one sentence", () => {
    render(<Hero />);
    expect(screen.getByText(heroSentence)).toHaveClass("sr-only");
    const tokens = document.querySelectorAll(".token-stream .tok");
    expect(tokens.length).toBeGreaterThan(5);
    tokens.forEach((t) => expect(t).toHaveAttribute("aria-hidden", "true"));
    // The characters spell the sentence; each step skips one per space.
    const chars = Array.from(
      document.querySelectorAll<HTMLElement>(".token-stream .tok-char"),
    );
    expect(chars.map((c) => c.textContent).join("")).toBe(
      heroSentence.replace(/ /g, ""),
    );
    const steps = chars.map((c) => Number(c.style.getPropertyValue("--c")));
    expect(steps[0]).toBe(0);
    expect(steps.at(-1)).toBe(heroSentence.length - 1);
    expect(document.querySelector(".tok-probs-note")).toHaveTextContent(
      "Illustrative",
    );
    expect(document.querySelectorAll(".tok-row[data-pick]")).toHaveLength(
      tokens.length,
    );
  });

  it("renders whatever the hero content says", () => {
    const content = contentWith((c) => {
      c.profile.name = "Ada Lovelace";
      c.profile.hero.availability = "Open to research roles";
      c.profile.hero.facts = [{ icon: "book", text: "Analytical Engine" }];
      c.contact.socials = [c.contact.socials[1]];
    });
    render(<Hero content={content} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Ada Lovelace",
    );
    expect(screen.getByText("Open to research roles")).toBeVisible();
    expect(document.querySelectorAll(".hero-facts li")).toHaveLength(1);
    expect(
      screen.getAllByRole("link", { name: /GitHub|LinkedIn|LeetCode/ }),
    ).toHaveLength(1);
  });
});
