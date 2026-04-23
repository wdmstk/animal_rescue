import { expect, test } from "@playwright/test";

test("pet detail shows health tracking section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("heading", { name: "健康記録" })).toBeVisible();
});

test("pet detail shows parallel implementation sections", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("heading", { name: "ワクチン・予防歴" })).toBeVisible();
  await expect(page.getByRole("button", { name: "トークン再生成" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "記録を追加" })).toBeVisible();
});
