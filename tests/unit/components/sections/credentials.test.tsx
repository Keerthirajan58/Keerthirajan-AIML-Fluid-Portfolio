import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { Credentials } from "@/components/sections/credentials/Credentials";
import {
  contentWith,
  newCertification,
  newPublication,
} from "../../../support/content";

describe("credentials", () => {
  it("renders credential cards with safe external targets", () => {
    render(<Credentials />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(localContent.certifications.length);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("shows each issuer's logo, sized from the file and grouped by shape", () => {
    render(<Credentials />);
    const marks = Array.from(document.querySelectorAll(".cert-mark"));
    expect(marks).toHaveLength(localContent.certifications.length);
    for (const mark of marks) {
      expect(["mark", "compact", "wordmark"]).toContain(
        mark.getAttribute("data-logo"),
      );
      const img = mark.querySelector("img")!;
      expect(Number(img.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(img.getAttribute("height"))).toBeGreaterThan(0);
    }
    expect(screen.getByText("GUVI AI event")).toHaveClass("cert-issuer");
  });

  it("lists publications with their venue, date and year", () => {
    render(<Credentials />);
    const first = localContent.publications[0];
    const card = screen.getByText(first.title).closest("article")!;
    expect(within(card as HTMLElement).getByText(first.venue)).toBeVisible();
    expect(card).toHaveTextContent("Conference paper · May 2023");
    expect(card.querySelector(".paper-year")).toHaveTextContent("2023");
  });

  it("adds new entries, with initials when an issuer has no logo", () => {
    const content = contentWith((c) => {
      c.certifications.push(newCertification());
      c.publications.push(newPublication({ date: "" }));
    });
    render(<Credentials content={content} />);
    const card = screen.getByText("Deep Reinforcement Learning").closest("a")!;
    expect(card).toHaveAttribute("href", "https://example.com/verify/123");
    expect(card.querySelector(".cert-mark")).not.toHaveAttribute("data-logo");
    expect(card.querySelector(".cert-mark")).toHaveTextContent("EA");
    const paper = screen
      .getByText("Fast Planning with Learned Heuristics")
      .closest("article")!;
    expect(paper.querySelector(".publication-kicker")).toHaveTextContent(
      /^Conference paper$/,
    );
  });

  it("hides empty groups, and the whole section when both are empty", () => {
    const { container, rerender } = render(
      <Credentials content={contentWith((c) => (c.publications = []))} />,
    );
    expect(screen.queryByText("Publications")).toBeNull();
    expect(screen.getByText("Certifications")).toBeVisible();
    rerender(
      <Credentials content={contentWith((c) => (c.certifications = []))} />,
    );
    expect(screen.queryByText("Certifications")).toBeNull();
    expect(screen.getByText("Publications")).toBeVisible();
    rerender(
      <Credentials
        content={contentWith((c) => {
          c.certifications = [];
          c.publications = [];
        })}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
