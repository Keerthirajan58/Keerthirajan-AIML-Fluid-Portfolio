import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ICONS } from "@/content/options";
import { localContent } from "@/content";
import { Section } from "@/components/ui/Section";
import { SocialLinks, socialNetworks } from "@/components/ui/SocialLinks";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/icons";

describe("section wrapper", () => {
  it("labels a section by its heading", () => {
    render(
      <Section id="demo" eyebrow="Demo" title="A title" lede="A lede.">
        Body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "A title" });
    expect(region).toHaveAttribute("id", "demo");
    expect(region).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Demo")).toHaveClass("eyebrow");
    expect(screen.getByText("A lede.")).toHaveClass("section-lede");
  });

  it("supports a section without a heading", () => {
    render(<Section>Content</Section>);
    expect(screen.getByText("Content")).toBeVisible();
    expect(document.querySelector(".section-heading")).toBeNull();
    expect(document.querySelector("section")).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("shows an eyebrow alone", () => {
    render(<Section eyebrow="Only an eyebrow">Body</Section>);
    expect(screen.getByText("Only an eyebrow")).toBeVisible();
    expect(document.querySelector("h2")).toBeNull();
  });
});

describe("social links", () => {
  it("opens each network safely in a new tab, in content order", () => {
    render(<SocialLinks />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("aria-label"))).toEqual(
      localContent.contact.socials.map((s) => socialNetworks[s.network].label),
    );
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.querySelector("svg")).not.toBeNull();
    }
    expect(links[0]).toHaveClass("social-link", "social-linkedin");
  });
});

describe("icons", () => {
  it("has an icon for every name content can use", () => {
    for (const name of ICONS) {
      const { container, unmount } = render(<Icon name={name} />);
      const svg = container.querySelector("svg")!;
      expect(svg, name).toHaveAttribute("aria-hidden", "true");
      unmount();
    }
  });

  it("passes size and class through", () => {
    const { container } = render(<Icon name="pin" width={12} className="x" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "12");
    expect(container.querySelector("svg")).toHaveClass("x");
  });
});

describe("brand mark", () => {
  it("draws the KS ligature with unique gradient ids", () => {
    const { container } = render(
      <>
        <BrandMark idPrefix="a" />
        <BrandMark idPrefix="b" />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
