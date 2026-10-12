// Work: filters, standard rows and project notes.
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { work, availableFilters, matchesFilter } from "./data";

test("project filters keep order, re-flow into standard rows, and keep actions usable", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#projects");
  const filters = page.getByRole("group", { name: "Filter projects" });
  const filters_ = availableFilters(work);
  for (const filter of [...filters_, filters_[0]]) {
    const button = filters.getByRole("button", {
      name: filter.label,
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const expected = work.filter((p) => matchesFilter(p.filters, filter.id));
    const visible = page.locator(
      ".project-slot:not([data-hidden]) .project-card",
    );
    await expect(visible).toHaveCount(expected.length);
    expect(
      await visible.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-project")),
      ),
    ).toEqual(expected.map((p) => p.slug));
    // Standard rows: once settled no cards overlap, every card in a row
    // shares its top and height, and every cover uses the same frame.
    await expect
      .poll(() =>
        visible.evaluateAll((els) => {
          const boxes = els.map((el) => el.getBoundingClientRect());
          // Every card sits inside the grid (positions applied exactly once).
          const grid = els[0]
            ?.closest(".project-grid")
            ?.getBoundingClientRect();
          if (
            grid &&
            boxes.some(
              (b) => b.left < grid.left - 1 || b.right > grid.right + 1,
            )
          )
            return "outside the grid";
          for (let i = 0; i < boxes.length; i++)
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i],
                b = boxes[j];
              if (
                Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
              )
                return `${i} overlaps ${j}`;
              if (
                Math.abs(a.top - b.top) < 1 &&
                Math.abs(a.height - b.height) > 1
              )
                return `${i} and ${j} share a row but not a height`;
            }
          const frames = els.map((el) => {
            const r = el
              .querySelector(".project-image")!
              .getBoundingClientRect();
            return (r.width / r.height).toFixed(2);
          });
          return new Set(frames).size === 1 ? "clear" : `frames ${frames}`;
        }),
      )
      .toBe("clear");
    // The ink pill sits on the chosen chip with the glass lens resting on it,
    // and the pill's white copy of the labels lines up with the real chips.
    const chosen = await button.evaluate(
      (el) => `${(el as HTMLElement).offsetLeft}px`,
    );
    expect(
      await filters.evaluate((bar) => [
        bar.style.getPropertyValue("--ix"),
        bar.style.getPropertyValue("--lx"),
      ]),
    ).toEqual([chosen, chosen]);
    expect(
      await filters.evaluate((bar) => {
        const chips = [...bar.querySelectorAll(":scope > button")];
        const copies = [...bar.querySelectorAll(".chip-ink > .chip")];
        return chips.every((chip, i) => {
          const a = chip.getBoundingClientRect(),
            b = copies[i].getBoundingClientRect();
          return (
            Math.abs(a.left - b.left) < 1 &&
            Math.abs(a.top - b.top) < 1 &&
            Math.abs(a.width - b.width) < 1
          );
        });
      }),
    ).toBe(true);
    const boundaries = await page.evaluate(() => ({
      work: document.getElementById("projects")!.getBoundingClientRect().bottom,
      skills: document.getElementById("skills")!.getBoundingClientRect().top,
    }));
    expect(boundaries.skills).toBeGreaterThanOrEqual(boundaries.work);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  if (!isMobile) {
    // Hover moves only the glass lens; the ink pill waits for a click.
    const genai = filters.getByRole("button", { name: "GenAI", exact: true });
    await genai.hover();
    const left = await genai.evaluate(
      (el) => `${(el as HTMLElement).offsetLeft}px`,
    );
    await expect
      .poll(() => filters.evaluate((bar) => bar.style.getPropertyValue("--lx")))
      .toBe(left);
    expect(
      await filters.evaluate((bar) => bar.style.getPropertyValue("--ix")),
    ).not.toBe(left);
  }
  await filters
    .getByRole("button", { name: "Hackathons", exact: true })
    .click();
  await page.locator("#projects").screenshot({
    path: testInfo.outputPath("work-filtered.png"),
    animations: "disabled",
  });
  await page.getByRole("link", { name: /NVC finalist: BarterBrAIn/ }).click();
  await expect(page).toHaveURL(/\/projects\/barterbrain-nvc$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("project notes trap focus, close with Escape, and restore the initiating control", async ({
  page,
}) => {
  await page.goto("/#projects");
  const trigger = page.getByRole("button", {
    name: "Project notes: MoodBites",
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "MoodBites" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Team Lead");
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
