// Security headers on real responses, and a page the policy doesn't break.
import { securityHeaders } from "../../src/lib/security";
import { test, expect } from "./fixtures";
import { caseStudyRoutes } from "./data";

test("every route is served with the security headers", async ({ request }) => {
  for (const path of [
    "/",
    `/projects/${caseStudyRoutes[0]}`,
    "/sitemap.xml",
    "/robots.txt",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const headers = response.headers();
    for (const { key, value } of securityHeaders)
      expect(headers[key.toLowerCase()], `${path} ${key}`).toBe(value);
    expect(headers["x-powered-by"], path).toBeUndefined();
  }
});

test("the content policy blocks nothing the site uses", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text()))
      violations.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Say hello/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goto(`/projects/${caseStudyRoutes[0]}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(violations).toEqual([]);
});
