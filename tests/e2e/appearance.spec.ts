// Theme, responsive layout and automated accessibility scans.
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

test("theme: light by default, dark on request, remembered, and cards stay solid", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  const background = () =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await background()).toBe("rgb(241, 242, 244)");
  const toggle = page.getByRole("button", { name: "Dark theme" }).first();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect.poll(background).toBe("rgb(13, 12, 16)");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#0D0C10",
  );
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Dark theme" }).first(),
  ).toHaveAttribute("aria-pressed", "true");
  // Cards are opaque in both themes (no see-through glass).
  for (const card of [
    ".about-story",
    ".education-card",
    ".timeline-card",
    ".project-card",
  ]) {
    const fill = await page
      .locator(card)
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return style.backgroundImage + " " + style.backgroundColor;
      });
    expect(fill, card).toContain("linear-gradient");
    expect(fill, card).not.toMatch(/rgba\([^)]*, 0\.\d+\)/);
  }
  await page.getByRole("button", { name: "Dark theme" }).first().click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  // Rapid clicks all register: nothing locks the switch while colours fade.
  const quick = page.getByRole("button", { name: "Dark theme" }).first();
  for (let i = 0; i < 3; i++) await quick.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect.poll(background).toBe("rgb(13, 12, 16)");
});

test("WCAG automated scan on homepage and project, in both themes", async ({
  page,
}) => {
  for (const [path, theme] of [
    ["/", "light"],
    ["/projects/barterbrain-nvc", "light"],
    ["/", "dark"],
    ["/projects/barterbrain-nvc", "dark"],
  ]) {
    await page.addInitScript(
      (mode) => localStorage.setItem("ks-theme", mode),
      theme,
    );
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.waitForTimeout(2500);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .options({ rules: { "label-content-name-mismatch": { enabled: true } } })
      .analyze();
    expect(result.violations).toEqual([]);
  }
});

test("layout evidence at required widths with no horizontal overflow", async ({
  page,
}, testInfo) => {
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.locator("img").evaluateAll((images) =>
      images.forEach((img) => {
        if (img instanceof HTMLImageElement) img.loading = "eager";
      }),
    );
    await expect
      .poll(
        () =>
          page
            .locator("img")
            .evaluateAll((images) =>
              images.every(
                (img) =>
                  img instanceof HTMLImageElement &&
                  img.complete &&
                  img.naturalWidth > 0,
              ),
            ),
        { timeout: 15000 },
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      String(width),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("home-" + width + ".png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath("about-" + width + ".png"),
      animations: "disabled",
    });
  }
});
