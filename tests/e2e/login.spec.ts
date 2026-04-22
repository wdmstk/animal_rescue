import { test, expect } from "@playwright/test";

test("login page can be opened", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});
