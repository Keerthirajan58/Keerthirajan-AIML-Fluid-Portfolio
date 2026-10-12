// The living background and route transitions.
import { test, expect } from "./fixtures";

test("living background re-lights each section, follows the pointer, can be paused, and route transitions fail open", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const field = page.locator(".atmosphere");
  await expect(field).toHaveAttribute("data-live", "true");
  await expect(field).toHaveAttribute("data-scene", "hero");
  // Pure CSS light: no canvas, no WebGL.
  await expect(page.locator(".atmosphere canvas")).toHaveCount(0);
  const drift = () =>
    page.locator(".glow-a").evaluate((el) => {
      const style = getComputedStyle(el);
      return `${style.animationName} ${style.animationPlayState}`;
    });
  expect(await drift()).toBe("drift-a running");
  const glow = page.locator(".glow-pointer");
  const before = await glow.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(120, 160);
  await page.mouse.move(160, 200);
  await expect
    .poll(() => glow.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  // Plain words, no optimiser jargon.
  const monitor = page.getByRole("complementary", { name: "Training monitor" });
  await expect(monitor).toBeVisible();
  await expect(monitor).toContainText("Epoch 1 of 8");
  await expect(monitor).toContainText("and falling");
  await expect(monitor).not.toContainText(
    /rosenbrock|camel|himmelblau|landscape/i,
  );
  await page
    .locator("#experience")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(field).toHaveAttribute("data-scene", "experience");
  await expect(monitor).toContainText("Epoch 3 of 8");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(field).toHaveAttribute("data-scene", "contact");
  await expect(monitor).toContainText("Converged. Let's talk.");
  await monitor
    .getByRole("button", { name: "Pause background motion" })
    .click();
  await expect(
    monitor.getByRole("button", { name: "Resume background motion" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await drift()).toBe("drift-a paused");
  await page.screenshot({
    path: testInfo.outputPath("contact-live.png"),
    animations: "disabled",
  });
  await expect(page.locator(".cursor-halo")).toHaveCount(0);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    HTMLElement.prototype.animate = () => {
      throw new Error("Synthetic animation failure");
    };
  });
  await page.locator('.project-image[href="/projects/pitchpulse"]').click();
  await expect(page).toHaveURL(/\/projects\/pitchpulse$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "PitchPulse" }),
  ).toBeVisible();
  await expect(field).toHaveAttribute("data-scene", "page");
});
