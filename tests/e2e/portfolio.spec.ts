import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { caseStudySlugs } from "../../src/lib/projects";
import { getFeaturedProjects, getGridProjects } from "../../src/lib/projects";
import {
  projectFilters,
  matchesProjectFilter,
} from "../../src/lib/projectFilters";

test("project filters keep order, re-flow into standard rows, and keep actions usable", async ({
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
    // The glass lens rides on top of the chosen chip.
    const lens = filters.locator(".filter-lens");
    expect(
      await lens.evaluate(
        (el) =>
          el === el.parentElement!.lastElementChild &&
          getComputedStyle(el).zIndex,
      ),
    ).toBe("2");
    await expect
      .poll(async () => {
        const [a, b] = [await lens.boundingBox(), await button.boundingBox()];
        return a && b ? Math.abs(a.x - b.x) + Math.abs(a.width - b.width) : 99;
      })
      .toBeLessThan(1.5);
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
  // The pin rides the tip of the filling crimson line.
  const pin = page.locator(".timeline-cursor");
  await expect
    .poll(() => pin.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(1);
  const gap = await page.evaluate(() => {
    const journey = document.querySelector<HTMLElement>(".experience-journey")!;
    const box = journey.getBoundingClientRect();
    const progress = Number(journey.style.getPropertyValue("--progress"));
    const tip = box.top + 10 + progress * (box.height - 20);
    const pin = document
      .querySelector(".timeline-cursor")!
      .getBoundingClientRect();
    return Math.abs(pin.top - tip);
  });
  expect(gap).toBeLessThan(2);
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
  const hello = page.getByRole("link", { name: /Say hello/ });
  await expect(hello).toBeVisible();
  await hello.click();
  const dialog = page.getByRole("dialog", { name: "Tell me about it." });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("name")).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: /Send message/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(hello).toBeFocused();
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
  await expect(page.locator(".timeline-item")).toHaveCount(3);
  // Real issuer logos; only API Academy (no logo anywhere) keeps initials.
  await expect(page.locator(".cert-mark[data-logo] img")).toHaveCount(8);
  await expect(page.locator(".cert-mark:not([data-logo])")).toHaveText("AA");
  // The contact photo is cropped in the file itself, never zoomed by CSS.
  expect(
    await page
      .locator(".contact-avatar img")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
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
    await expect(page.locator(".gallery-tile").first()).toBeAttached();
    await page.getByRole("link", { name: "Back to work" }).first().click();
    await expect(page).toHaveURL(/\/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp("/projects/" + slug + "$"));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
test("gallery keeps image order in an adaptive masonry and supports an accessible lightbox", async ({
  page,
}) => {
  await page.goto("/projects/siri-core-modeling");
  const tiles = page.locator(".gallery-tile");
  const src = await tiles
    .locator("img")
    .evaluateAll((imgs) =>
      imgs.map((el) => decodeURIComponent(el.getAttribute("src") ?? "")),
    );
  expect(src[1]).toContain("slide-1");
  expect(src[2]).toContain("slide-2");
  await expect(page.locator(".gallery-wall")).toHaveAttribute(
    "data-masonry",
    "true",
  );
  // Tiles keep each image's own shape and never overlap.
  const layout = await tiles.evaluateAll((els) => {
    const boxes = els.map((el) => el.getBoundingClientRect());
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          return `${i} overlaps ${j}`;
      }
    return els
      .map((el, i) => {
        const img = el.querySelector("img")!;
        const shape =
          Number(img.getAttribute("width")) /
          Number(img.getAttribute("height"));
        return Math.abs(boxes[i].width / boxes[i].height - shape) < 0.02;
      })
      .every(Boolean)
      ? "true to shape"
      : "distorted";
  });
  expect(layout).toBe("true to shape");
  const opener = page.getByRole("button", {
    name: "Open image 2 of 4",
    exact: true,
  });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog")).toContainText("3 / 4");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(opener).toBeFocused();
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
  await expect(page.locator(".project-card")).toHaveCount(11);
  const notes = page.locator('[data-project="moodbites"] details');
  await notes.locator("summary").click();
  await expect(notes).toHaveAttribute("open", "");
  await page.goto(baseURL + "/projects/barterbrain-nvc");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".gallery-tile img")).toHaveCount(4);
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
});
test("education: GW lands and stays readable before SVCE slides over it", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const boxes = () =>
    page.locator(".education-slot").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
      }),
    );
  // Bring GW to its resting line.
  await page.evaluate(() => {
    const stack = document.querySelector(".education-stack")!;
    window.scrollTo(
      0,
      stack.getBoundingClientRect().top + window.scrollY - 118,
    );
  });
  let [gw, svce] = await boxes();
  expect(gw.top).toBe(118);
  expect(svce.top).toBeGreaterThan(gw.bottom);
  // A third of a screen later GW hasn't moved and is still uncovered.
  await page.evaluate(() => window.scrollBy(0, window.innerHeight / 3));
  [gw, svce] = await boxes();
  expect(gw.top).toBe(118);
  expect(svce.top).toBeGreaterThan(gw.bottom);
  // Then SVCE slides up and rests just below GW's top edge, both pinned.
  await page.evaluate(() => {
    const next = document.querySelectorAll(".education-slot")[1];
    window.scrollBy(0, next.getBoundingClientRect().top - 144 + 40);
  });
  [gw, svce] = await boxes();
  expect(gw.top).toBe(118);
  expect(svce.top).toBe(144);
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
