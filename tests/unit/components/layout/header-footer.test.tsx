import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import { navigation } from "@/content/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("navigation controls", () => {
  it("opens and closes the mobile dialog, restoring focus", async () => {
    render(<SiteHeader />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    await user.click(
      within(dialog).getByRole("button", { name: "Close menu" }),
    );
    expect(dialog).not.toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });
  it("updates active links immediately and closes the menu on selection", async () => {
    render(<SiteHeader />);
    await userEvent.click(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "About" },
      ),
    );
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "About" },
      ),
    ).toHaveAttribute("aria-current", "location");
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    await userEvent.click(
      within(screen.getByRole("navigation", { name: "Mobile" })).getByRole(
        "link",
        { name: "Work" },
      ),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("header links", () => {
  it("lists every section with a header link, plus the résumé", () => {
    render(<SiteHeader />);
    const primary = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(primary)
        .getAllByRole("link")
        .map((a) => [a.textContent, a.getAttribute("href")]),
    ).toEqual(navigation.map((n) => [n.label, "/#" + n.id]));
    expect(screen.getByRole("link", { name: /Résumé/ })).toHaveAttribute(
      "href",
      localContent.contact.resumeUrl,
    );
  });

  it("glides to a section instead of jumping, unless a modifier key is held", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<section id="skills" tabindex="-1"></section>',
    );
    const native = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<SiteHeader />);
    const skills = within(
      screen.getByRole("navigation", { name: "Primary" }),
    ).getByRole("link", { name: "Skills" });
    await userEvent.click(skills);
    expect(native).toHaveBeenCalledOnce();
    expect(location.hash).toBe("#skills");
    document.getElementById("skills")?.remove();
  });
});

describe("footer", () => {
  it("credits the owner for this year and offers a way back up", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} ${localContent.profile.name}. All rights reserved.`,
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /Back to top/ })).toHaveAttribute(
      "href",
      "#main",
    );
  });

  it("uses the name it is given", () => {
    render(
      <SiteFooter
        profile={{ ...localContent.profile, name: "Ada Lovelace" }}
      />,
    );
    expect(
      screen.getByText(/Ada Lovelace\. All rights reserved/),
    ).toBeVisible();
  });
});
