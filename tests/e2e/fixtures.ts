import { test as base, expect } from "@playwright/test";

/**
 * Owner rule: the suite never sends a real contact message. Every request
 * to Formspree is stopped unless a test answers it itself.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route("https://formspree.io/**", (route) => route.abort());
    await provide(page);
  },
});

export { expect };
