import { test, expect } from "@playwright/test";

test("login page can be opened", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("home redirects to pets", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/pets$/);
});

test("login page shows registration notice", async ({ page }) => {
  await page.goto("/login?registered=1");
  await expect(page.getByText("確認メールを送信しました。メール内のリンクを開いてからログインしてください。")).toBeVisible();
});
