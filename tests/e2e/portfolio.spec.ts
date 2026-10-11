import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { caseStudySlugs } from "../../src/lib/projects";
import { getFeaturedProjects, getGridProjects } from "../../src/lib/projects";
import {
  projectFilters,
  matchesProjectFilter,
} from "../../src/lib/projectFilters";

test("project filters preserve ordered, equally sized cards and usable actions", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#projects");
  const filters = page.getByRole("group", { name: "Filter projects" });
  const allWork = [...getFeaturedProjects(), ...getGridProjects()];
  for (const filter of [...projectFilters, projectFilters[0]]) {
    const button = filters.getByRole("button", {
      name: filter.label,
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const expected = allWork.filter((p) =>
      matchesProjectFilter(p.filters, filter.id),
    );
    await expect(page.locator(".project-card")).toHaveCount(expected.length);
    expect(
      await page
        .locator(".project-card")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-project"))),
    ).toEqual(expected.map((p) => p.slug));
    const sizes = await page
      .locator(".project-card")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThan(2);
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

test("navigation remains transparent and the experience rail follows the role in view", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator(".site-header")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgba(0, 0, 0, 0)");
  const timeline = page.getByRole("navigation", {
    name: "Experience timeline",
  });
  await timeline.getByRole("link", { name: /TCS/ }).click();
  await expect(timeline.getByRole("link", { name: /TCS/ })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator("#role-1")).toBeInViewport();
  await page
    .locator("#role-2")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(
    timeline.getByRole("link", { name: /The Sparks Foundation/ }),
  ).toHaveAttribute("aria-current", "step");
  const social = page
    .getByRole("link", { name: "LeetCode", exact: true })
    .first();
  expect(await social.evaluate((el) => getComputedStyle(el).borderRadius)).toBe(
    "50%",
  );
});
test("home retains identity, one education section and copyright", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Keerthirajan",
  );
  await expect(
    page.getByText("Master's in Computer Science, AIML & SWE Specialization", {
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(page.locator("footer")).toContainText("All rights reserved");
  await expect(page.locator(".project-card")).toHaveCount(11);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", { name: /Say hello — Send an email/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("revised art direction keeps credentials visible and project actions integrated", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-facts")).toBeInViewport({ ratio: 1 });
  await expect(page.locator(".hero-facts")).toContainText("San Francisco, CA");
  await expect(page.locator(".hero-intro")).toContainText(
    "AIML + Software Engineering",
  );
  await expect(page.locator(".cursor-halo")).toHaveCount(0);
  await expect(page.locator(".experience-index,.leadership-list")).toHaveCount(
    0,
  );
  await expect(page.locator(".education-card .award-row")).toHaveCount(1);
  await expect(page.locator(".more-projects")).toHaveCount(0);
  await expect(page.locator(".project-placeholder")).toHaveCount(5);
  await expect(
    page.getByRole("navigation", { name: "Experience timeline" }),
  ).toBeVisible();
  await expect(
    page.locator(".project-image .project-achievement"),
  ).toContainText("Technica winner");
  await expect(
    page.locator(".project-card .project-next-chapter"),
  ).toHaveAttribute("href", "/projects/barterbrain-nvc");
  if (!isMobile) {
    const positions = await page
      .locator(".project-card")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(positions[0]).toBe(positions[2]);
    expect(positions[3]).toBeGreaterThan(positions[0]);
  }
  for (const section of [
    "hero",
    "about",
    "experience",
    "projects",
    "skills",
    "credentials",
    "testimonials",
    "contact",
  ]) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    await page.locator(`#${section} img`).evaluateAll((imgs) =>
      imgs.forEach((img) => {
        if (img instanceof HTMLImageElement) img.loading = "eager";
      }),
    );
    await expect
      .poll(() =>
        page
          .locator(`#${section} img`)
          .evaluateAll((imgs) =>
            imgs.every(
              (img) =>
                img instanceof HTMLImageElement &&
                img.complete &&
                img.naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await page.locator(`#${section}`).screenshot({
      path: testInfo.outputPath(`${section}.png`),
      animations: "disabled",
    });
  }
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
for (const slug of caseStudySlugs) {
  test("direct case study: " + slug, async ({ page }) => {
    const response = await page.goto("/projects/" + slug);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".gallery-slide").first()).toBeAttached();
    await page.getByRole("link", { name: "Back to work" }).first().click();
    await expect(page).toHaveURL(/\/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp("/projects/" + slug + "$"));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
test("gallery maintains image order and supports an accessible lightbox", async ({
  page,
}) => {
  await page.goto("/projects/siri-core-modeling");
  const src = await page
    .locator(".gallery-slide img")
    .evaluateAll((imgs) =>
      imgs.map((el) => decodeURIComponent(el.getAttribute("src") ?? "")),
    );
  expect(src[1]).toContain("slide-1");
  expect(src[2]).toContain("slide-2");
  await page.getByRole("button", { name: "Show image 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show image 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Open image 2", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog")).toContainText("3 / 4");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open image 2", exact: true }),
  ).toBeFocused();
});
test("direct anchors remain visible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["about", "experience", "projects", "skills", "contact"]) {
    await page.goto("/#" + id);
    await expect(page.locator("#" + id)).toBeInViewport();
    await expect(page.locator("#" + id + " h2")).toBeVisible();
  }
  await expect(page.locator(".cursor-halo")).toHaveCount(0);
  await expect(page.locator(".atmosphere canvas")).toHaveCount(0);
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
  await expect(page.locator(".project-card")).toHaveCount(11);
  const notes = page.locator('[data-project="moodbites"] details');
  await notes.locator("summary").click();
  await expect(notes).toHaveAttribute("open", "");
  await page.goto(baseURL + "/projects/barterbrain-nvc");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".gallery-slide img")).toHaveCount(4);
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

test("live scene is optional, context loss recovers, and route transitions fail open", async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".atmosphere canvas")).toBeVisible({
    timeout: 15000,
  });
  await page.mouse.move(650, 350);
  await page.screenshot({
    path: testInfo.outputPath("hero-live.png"),
    animations: "disabled",
  });
  await expect(page.locator(".cursor-halo")).toHaveCount(0);
  await page
    .locator(".atmosphere canvas")
    .evaluate((canvas) => canvas.dispatchEvent(new Event("webglcontextlost")));
  await expect(page.locator(".atmosphere canvas")).toHaveCount(0);
  await expect(page.locator(".atmosphere-fallback")).toBeVisible();
  await page.evaluate(() => {
    HTMLElement.prototype.animate = () => {
      throw new Error("Synthetic animation failure");
    };
  });
  await page.locator('.project-image[href="/projects/pitchpulse"]').click();
  await expect(page).toHaveURL(/\/projects\/pitchpulse$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "PitchPulse" }),
  ).toBeVisible();
});
test("WCAG automated scan on homepage and project", async ({ page }) => {
  for (const path of ["/", "/projects/barterbrain-nvc"]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .options({ rules: { "label-content-name-mismatch": { enabled: true } } })
      .analyze();
    expect(result.violations).toEqual([]);
  }
});

test("portrait and headings remain in view at the About anchor", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#about");
  await expect(page.locator("#about-heading")).toBeInViewport();
  await expect(page.locator(".portrait")).toBeInViewport();
  await expect
    .poll(() =>
      page
        .locator(".portrait img")
        .evaluate(
          (el) =>
            el instanceof HTMLImageElement &&
            el.complete &&
            el.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("about-anchor.png"),
    animations: "disabled",
  });
  await testInfo.attach("portrait-layout", {
    body: JSON.stringify(
      await page.locator(".portrait").evaluate((el) => ({
        rect: el.getBoundingClientRect().toJSON(),
        style: getComputedStyle(el).cssText,
        scrollY: window.scrollY,
      })),
    ),
    contentType: "application/json",
  });
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
