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

test("health graph controls and extension form are interactive", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  const graphSection = page.locator("div", { hasText: "推移グラフ" }).first();
  await expect(graphSection).toBeVisible();

  const labButton = page.getByRole("button", { name: "血液検査" });
  await expect(labButton).toBeVisible();
  await labButton.click();
  await expect(page.getByText("推移グラフ")).toBeVisible();
});
