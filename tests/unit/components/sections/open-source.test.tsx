import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import { OpenSource } from "@/components/sections/open-source/OpenSource";
import { contentWith, newContribution } from "../../../support/content";

const { contributions } = localContent.openSource;

describe("open source section", () => {
  it("leads with the project I maintain and links its page, code and package", () => {
    render(<OpenSource />);
    const lead = document.querySelector(".oss-maintained") as HTMLElement;
    expect(within(lead).getByText("Maintainer")).toBeVisible();
    expect(within(lead).getByRole("link", { name: "bugbout" })).toHaveAttribute(
      "href",
      "/projects/bugbout",
    );
    expect(
      within(lead).getByRole("link", { name: /Read case study/ }),
    ).toHaveAttribute("href", "/projects/bugbout");
    expect(within(lead).getByRole("link", { name: /Source/ })).toHaveAttribute(
      "href",
      "https://github.com/Keerthirajan58/bugbout",
    );
    expect(within(lead).getByRole("link", { name: /PyPI/ })).toHaveAttribute(
      "href",
      "https://pypi.org/project/bugbout/",
    );
  });

  it("lists every pull request, merged first, with its status in words", () => {
    render(<OpenSource />);
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".oss-card"),
    );
    expect(cards).toHaveLength(contributions.length);
    const statuses = cards.map((c) => c.querySelector(".oss-status")!);
    const merged = contributions.filter((c) => c.status === "merged").length;
    statuses.forEach((s, i) => {
      expect(s.textContent).toMatch(
        i < merged ? /^Merged · / : /^In review · /,
      );
    });
    for (const card of cards) {
      expect(card.getAttribute("href")).toMatch(
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/,
      );
      expect(card).toHaveAttribute("target", "_blank");
      expect(card).toHaveAttribute("rel", "noopener noreferrer");
    }
    const repos = new Set(contributions.map((c) => c.repo)).size;
    expect(
      screen.getByText(
        `${merged} merged · ${contributions.length - merged} in review · ${repos} repositories`,
      ),
    ).toBeVisible();
  });

  it("shows a prize as a gold pill only on the contribution that won it", () => {
    const content = contentWith((c) => {
      c.openSource.contributions = [
        newContribution({ award: "$100 prize" }),
        newContribution({
          url: "https://github.com/example-org/example-lib/pull/43",
        }),
      ];
    });
    render(<OpenSource content={content} />);
    const [won, plain] = Array.from(
      document.querySelectorAll<HTMLElement>(".oss-card"),
    );
    expect(won.querySelector(".oss-award")).toHaveTextContent("$100 prize");
    expect(plain.querySelector(".oss-award")).toBeNull();
  });

  it("counts a single repository in the singular", () => {
    const content = contentWith((c) => {
      c.openSource.contributions = [
        newContribution(),
        newContribution({
          url: "https://github.com/example-org/example-lib/pull/43",
          status: "open",
        }),
      ];
    });
    render(<OpenSource content={content} />);
    expect(
      screen.getByText("1 merged · 1 in review · 1 repository"),
    ).toBeVisible();
  });

  it("shows a maintained project without a page, code or package as plain text", () => {
    const content = contentWith((c) => {
      const p = c.projects.find((x) => x.slug === "bugbout")!;
      delete p.caseStudy;
      delete p.links;
      c.openSource.contributions = [];
    });
    render(<OpenSource content={content} />);
    const lead = document.querySelector(".oss-maintained") as HTMLElement;
    expect(
      within(lead).getByRole("heading", { name: "bugbout" }),
    ).toBeVisible();
    expect(within(lead).queryAllByRole("link")).toEqual([]);
    expect(document.querySelector(".oss-contributions")).toBeNull();
  });

  it("shows contributions alone when nothing listed is maintained", () => {
    const content = contentWith((c) => {
      c.openSource.maintained = ["no-such-project"];
    });
    render(<OpenSource content={content} />);
    expect(document.querySelector(".oss-maintained")).toBeNull();
    expect(document.querySelectorAll(".oss-card")).toHaveLength(
      contributions.length,
    );
  });

  it("is left out when there is no open-source work", () => {
    const content = contentWith((c) => {
      c.openSource = { maintained: [], contributions: [] };
    });
    const { container } = render(<OpenSource content={content} />);
    expect(container).toBeEmptyDOMElement();
  });
});
