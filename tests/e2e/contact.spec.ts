// The contact popup (Formspree is mocked; nothing is ever sent).
import { test, expect } from "./fixtures";

test("the contact popup delivers through Formspree and confirms (network mocked)", async ({
  page,
}) => {
  let sent: unknown = null;
  await page.route("https://formspree.io/f/mwlvqyoe", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Say hello/ }).click();
  const dialog = page.getByRole("dialog", { name: "Tell me about it." });
  await dialog.getByLabel("name").fill("Test Person");
  await dialog.getByLabel("email").fill("test@example.com");
  await dialog
    .getByLabel("message")
    .fill("Synthetic end-to-end message; the network is mocked.");
  await dialog.getByRole("button", { name: /Send message/ }).click();
  await expect(dialog.getByRole("status")).toContainText("has been sent");
  expect(sent).toMatchObject({
    name: "Test Person",
    email: "test@example.com",
    topic: "Job opportunity",
    _subject: "Portfolio: Job opportunity from Test Person",
  });
});
