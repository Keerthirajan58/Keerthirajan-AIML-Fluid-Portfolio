// Case studies: direct routes, gallery and link buttons.
import { test, expect } from "./fixtures";
import { caseStudyRoutes } from "./data";

for (const slug of caseStudyRoutes) {
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

test("gallery keeps image order in aligned justified rows and supports an accessible lightbox", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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
    "data-justified",
    "true",
  );
  // Rows line up: one height per row, edge to edge across the wall.
  expect(
    await page.locator(".gallery-wall").evaluate((wall) => {
      const edge = wall.getBoundingClientRect();
      const rows = new Map<number, DOMRect[]>();
      wall.querySelectorAll(".gallery-tile").forEach((tile) => {
        const box = tile.getBoundingClientRect();
        const key = Math.round(box.top);
        rows.set(key, [...(rows.get(key) ?? []), box]);
      });
      for (const row of rows.values()) {
        if (row.some((box) => Math.abs(box.height - row[0].height) > 1))
          return "uneven row";
        const left = Math.min(...row.map((b) => b.left)),
          right = Math.max(...row.map((b) => b.right));
        if (
          row.length > 1 &&
          (Math.abs(left - edge.left) > 1.5 ||
            Math.abs(right - edge.right) > 1.5)
        )
          return "ragged row";
      }
      return "aligned";
    }),
  ).toBe("aligned");
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

test("case studies offer GitHub and Devpost as real buttons", async ({
  page,
}) => {
  await page.goto("/projects/pitchpulse");
  const github = page.getByRole("link", { name: "View on GitHub" });
  const devpost = page.getByRole("link", { name: "View on Devpost" });
  await expect(github).toBeVisible();
  await expect(devpost).toBeVisible();
  await expect(github).toHaveAttribute("target", "_blank");
  expect(
    await github.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(15, 16, 19)");
  expect(
    await devpost.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(0, 62, 84)");
  // Focus and timeline stay as quiet facts beside them.
  await expect(page.locator(".case-meta > div")).toHaveCount(2);
});
