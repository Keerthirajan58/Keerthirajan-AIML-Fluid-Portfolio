// Home page: identity, hero, About and Skills.
import { test, expect } from "./fixtures";
import { content, work, projectCover } from "./data";

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
  // The KS mark lives in the header only.
  await expect(page.locator(".site-footer .wordmark")).toHaveCount(0);
  await expect(page.locator(".project-card")).toHaveCount(work.length);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  // The copyright sits in the centre of the footer.
  expect(
    await page.locator(".footer-inner").evaluate((footer) => {
      const box = footer.getBoundingClientRect();
      const text = footer.querySelector("p")!.getBoundingClientRect();
      return Math.abs(text.left + text.width / 2 - (box.left + box.width / 2));
    }),
  ).toBeLessThan(2);
  const hello = page.getByRole("button", { name: /Say hello/ });
  await expect(hello).toBeVisible();
  await hello.click();
  const dialog = page.getByRole("dialog", { name: "Tell me about it." });
  await expect(dialog).toBeVisible();
  // The form card: a wine gradient band over a blurred page.
  expect(
    await dialog.evaluate((el) => ({
      band: getComputedStyle(el.querySelector(".contact-dialog-head")!)
        .backgroundImage,
      backdrop: getComputedStyle(el, "::backdrop").backdropFilter,
    })),
  ).toEqual({
    band: expect.stringContaining("linear-gradient"),
    backdrop: expect.stringContaining("blur"),
  });
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
  await expect(page.locator(".education-card .award-row")).toHaveCount(
    content.education.filter((e) => e.award).length,
  );
  await expect(page.locator(".more-projects")).toHaveCount(0);
  await expect(page.locator(".project-placeholder")).toHaveCount(
    work.filter((p) => !projectCover(p)).length,
  );
  await expect(page.locator(".timeline-item")).toHaveCount(
    content.experience.length,
  );
  await expect(
    page.getByRole("heading", { level: 2, name: "AIML / Software Engineer" }),
  ).toBeVisible();
  // The San Francisco pill stays compact.
  expect(
    await page
      .locator(".location-pill")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThan(46);
  // Every issuer shows its real logo (GUVI and API Academy from the owner).
  await expect(page.locator(".cert-mark[data-logo] img")).toHaveCount(
    content.certifications.filter((c) => c.logo).length,
  );
  await expect(page.locator(".cert-mark:not([data-logo])")).toHaveCount(
    content.certifications.filter((c) => !c.logo).length,
  );
  // The contact photo is the owner's own crop: never zoomed by CSS, shown
  // from its top (hair to chest).
  expect(
    await page
      .locator(".contact-avatar img")
      .evaluate((el) => [
        getComputedStyle(el).transform,
        getComputedStyle(el).objectPosition,
      ]),
  ).toEqual(["none", "50% 0%"]);
  // The NVC button sits at the card's top right, between the category line
  // and the title, and never touches the title text.
  expect(
    await page.locator('[data-project="barterbrain"]').evaluate((card) => {
      const nvc = card
        .querySelector(".project-next-chapter")!
        .getBoundingClientRect();
      const label = card
        .querySelector(".project-category")!
        .getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(card.querySelector("h3")!);
      const title = range.getBoundingClientRect();
      const centre = nvc.top + nvc.height / 2;
      return {
        betweenLines:
          centre > label.top + label.height / 2 && centre < title.bottom,
        clearOfTitle: nvc.left > title.right,
      };
    }),
  ).toEqual({ betweenLines: true, clearOfTitle: true });
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
  // GW rests for a short beat (120–200px of scrolling, never a long wait):
  // halfway through it, GW hasn't moved and is still uncovered.
  const beat = await page.evaluate(() =>
    parseFloat(
      getComputedStyle(document.querySelectorAll(".education-slot")[1])
        .marginTop,
    ),
  );
  expect(beat).toBeGreaterThanOrEqual(120);
  expect(beat).toBeLessThanOrEqual(200);
  await page.evaluate((px) => window.scrollBy(0, px), beat / 2);
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

test("the About portrait slowly zooms while it is pinned", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const scaleAt = (fraction: number) =>
    page.evaluate(
      (f) =>
        new Promise<number>((resolve) => {
          const layout = document.querySelector<HTMLElement>(".about-layout")!;
          const top = layout.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(
            0,
            top + f * (layout.offsetHeight - window.innerHeight),
          );
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              resolve(
                Number(
                  getComputedStyle(document.querySelector(".portrait img")!)
                    .scale,
                ),
              ),
            ),
          );
        }),
      fraction,
    );
  const early = await scaleAt(0.1);
  const late = await scaleAt(0.9);
  expect(late - early).toBeGreaterThan(0.1);
});

test("each skill area's tab is filled with its colour; a click moves the ink pill", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#skills");
  const tabs = page.getByRole("group", { name: "Highlight skills by area" });
  const genai = tabs.getByRole("button", { name: /GenAI & LLMs/ });
  expect(
    await genai.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(106, 63, 209)");
  await genai.click();
  const left = await genai.evaluate(
    (el) => `${(el as HTMLElement).offsetLeft}px`,
  );
  await expect
    .poll(() => tabs.evaluate((el) => el.style.getPropertyValue("--ix")))
    .toBe(left);
  expect(
    await tabs
      .locator(".chip-ink")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(15, 16, 19)");
  await expect(page.locator(".skill-bubble[data-lit]").first()).toBeVisible();
});

test("buttons get the glass lens only on hover, and it glides between them", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "hover is a fine-pointer interaction");
  await page.goto("/");
  await expect(page).toHaveTitle("Keerthirajan · AI, end to end");
  const lens = page.locator(".hero-inner > .hover-lens");
  await expect(lens).not.toHaveAttribute("data-on");
  await expect(lens).toHaveCSS("opacity", "0");
  const resume = page.locator(".hero-actions .button-secondary");
  await resume.hover();
  await expect(lens).toHaveAttribute("data-on", "");
  await expect(lens).toHaveCSS("opacity", "1");
  const around = async (target: typeof resume) => {
    const [l, t] = [await lens.boundingBox(), await target.boundingBox()];
    return (
      !!l &&
      !!t &&
      Math.abs(l.x - t.x) < 1 &&
      Math.abs(l.y - t.y) < 1 &&
      Math.abs(l.width - t.width) < 1 &&
      Math.abs(l.height - t.height) < 1
    );
  };
  await expect.poll(() => around(resume)).toBe(true);
  // Edge to edge like the filters' lens, with the words magnified a little.
  await expect(resume).toHaveAttribute("data-lensed", "");
  await expect(resume.locator(".lens-content")).toHaveCSS("scale", "1.05");
  const github = page.locator(".hero-actions .social-link").nth(1);
  await github.hover();
  await expect.poll(() => around(github)).toBe(true);
  await expect(resume).not.toHaveAttribute("data-lensed");
  await page.mouse.move(4, 600);
  await expect(lens).not.toHaveAttribute("data-on");
  await expect(github).not.toHaveAttribute("data-lensed");
  // The About card and the contact band have their own lens.
  await expect(page.locator(".about-story > .hover-lens")).toHaveCount(1);
  await expect(page.locator(".contact-inner > .hover-lens")).toHaveCount(1);
});

test("the hero line types itself out with the caret right behind it", async ({
  page,
}) => {
  await page.goto("/");
  const chars = await page
    .locator(".token-stream .tok-char")
    .evaluateAll((els) =>
      els.map((el) => {
        const seconds = (v: string) =>
          parseFloat(v) * (v.endsWith("ms") ? 0.001 : 1);
        const char = getComputedStyle(el);
        const caret = getComputedStyle(el, "::after");
        return {
          text: el.textContent,
          lastInWord: !el.nextElementSibling,
          typed: seconds(char.animationDelay),
          caret: seconds(caret.animationDelay),
          caretFor: seconds(caret.animationDuration),
          name: caret.animationName,
        };
      }),
    );
  const sentence = await page.locator(".token-stream .sr-only").textContent();
  // Every visible character of the sentence is typed, in order.
  expect(chars.map((c) => c.text).join("")).toBe(sentence!.replace(/ /g, ""));
  const gaps = chars.slice(1).map((c, i) => c.typed - chars[i].typed);
  gaps.forEach((gap) => expect(gap).toBeGreaterThan(0));
  // The caret appears with each character (never ahead of the text), lingers
  // a step longer where a space follows, and only the last one blinks.
  const step = Math.min(...gaps);
  chars.slice(0, -1).forEach((c) => {
    expect(c.name).toBe("tok-cursor");
    expect(c.caret).toBeCloseTo(c.typed, 5);
    expect(c.caretFor).toBeCloseTo(c.lastInWord ? 2 * step : step, 5);
  });
  const last = chars[chars.length - 1];
  expect(last.name).toBe("caret-blink");
  expect(last.caret).toBeCloseTo(last.typed, 5);
});
