import { test, expect } from "@playwright/test";

test("signup page can be opened", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "新規登録" })).toBeVisible();
});

test("login page has signup link", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "新規登録" }).click();
  await expect(page).toHaveURL(/\/signup$/);
});

test("signup page has login link", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("link", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
