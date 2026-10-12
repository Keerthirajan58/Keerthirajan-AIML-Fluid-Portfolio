// Navigation, routing and graceful degradation.
import { test, expect } from "./fixtures";
import { work, galleryOf } from "./data";

test("header floats over content, nav glides to sections, and the timeline follows the role in view", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator(".site-header")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgba(0, 0, 0, 0)");
  if (!isMobile) {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Experience" })
      .click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.locator("#experience h2")).toBeInViewport();
  }
  await page
    .locator("#role-2")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(page.locator("#role-2")).toHaveAttribute("data-active", "");
  await expect(page.locator("#role-0")).toHaveAttribute("data-reached", "");
  // Puts the middle of an element on the reading line (the viewport's
  // middle, which the pin tracks); scrollIntoView would honour the header's
  // scroll padding instead.
  const toReadingLine = (selector: string) =>
    page.evaluate((sel) => {
      const box = document.querySelector(sel)!.getBoundingClientRect();
      window.scrollTo(
        0,
        box.top + window.scrollY + box.height / 2 - window.innerHeight / 2,
      );
    }, selector);
  // Between badges the pin rides the tip of the filling crimson line …
  const pin = page.locator(".timeline-cursor");
  await toReadingLine("#role-1 .timeline-card");
  await expect(pin).not.toHaveAttribute("data-docked");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const journey = document.querySelector<HTMLElement>(
          ".experience-journey",
        )!;
        const box = journey.getBoundingClientRect();
        const progress = Number(journey.style.getPropertyValue("--progress"));
        const tip = box.top + 10 + progress * (box.height - 20);
        const marker = document.querySelector(".timeline-cursor")!;
        return (
          Number(getComputedStyle(marker).opacity) === 1 &&
          Math.abs(marker.getBoundingClientRect().top - tip) < 2
        );
      }),
    )
    .toBe(true);
  // … and at a company badge it docks at the rim with an impact ripple,
  // never over the logo.
  const badge = page.locator("#role-2 .timeline-node");
  await toReadingLine("#role-2 .timeline-node");
  await expect(pin).toHaveAttribute("data-docked", "");
  await expect(badge).toHaveAttribute("data-impact", "");
  expect(
    await page.evaluate(() => {
      const tip = document
        .querySelector(".timeline-cursor > span")!
        .getBoundingClientRect().bottom;
      const logo = document
        .querySelector("#role-2 .timeline-node")!
        .getBoundingClientRect().top;
      return tip <= logo;
    }),
  ).toBe(true);
  const social = page
    .getByRole("link", { name: "LeetCode", exact: true })
    .first();
  expect(await social.evaluate((el) => getComputedStyle(el).borderRadius)).toBe(
    "50%",
  );
});

test("every internal destination exists without redirects", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const links = await page
    .locator("a[href]")
    .evaluateAll((els) =>
      els
        .map((el) => el.getAttribute("href")!)
        .filter((href) => href.startsWith("/") || href.startsWith("#")),
    );
  for (const href of new Set(links)) {
    const url = new URL(href, "http://127.0.0.1:3100");
    if (url.pathname === "/" && url.hash) {
      await expect(
        page.locator('[id="' + decodeURIComponent(url.hash.slice(1)) + '"]'),
      ).toHaveCount(1);
    } else {
      const response = await request.get(url.pathname, { maxRedirects: 0 });
      expect(response.status(), href).toBe(200);
    }
  }
});

test("direct anchors remain visible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["about", "experience", "projects", "skills", "contact"]) {
    await page.goto("/#" + id);
    await expect(page.locator("#" + id)).toBeInViewport();
    await expect(page.locator("#" + id + " h2")).toBeVisible();
  }
  await expect(page.locator(".cursor-halo")).toHaveCount(0);
  await expect(page.locator(".atmosphere")).not.toHaveAttribute("data-live");
});

test("no-JavaScript content, links and gallery remain usable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + "/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto(baseURL + "/#projects");
  await expect(page.locator("#projects h2")).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(work.length);
  const notes = page.locator('[data-project="moodbites"] details');
  await notes.locator("summary").click();
  await expect(notes).toHaveAttribute("open", "");
  await page.goto(baseURL + "/projects/barterbrain-nvc");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".gallery-tile img")).toHaveCount(
    galleryOf("barterbrain-nvc").length,
  );
  await context.close();
});

test("mobile menu supports Escape and anchor selection", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile);
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open menu" });
  await open.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole("navigation", { name: "Mobile" })
    .getByRole("link", { name: /Work/ })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#projects")).toBeInViewport();
});

test("unknown routes fail safely without a broken redirect", async ({
  page,
}) => {
  const response = await page.goto("/projects/not-a-project");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
