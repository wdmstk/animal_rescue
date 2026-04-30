import { expect, test } from "@playwright/test";

test("pet detail can navigate to public emergency page", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("link", { name: "緊急情報を確認" }).click();

  await expect(page).toHaveURL(/\/e\/00000000-0000-4000-8000-000000000001$/);
  await expect(page.getByRole("heading", { name: "モカ（E2E）" })).toBeVisible();
  await expect(page.getByText("僧帽弁閉鎖不全症（軽度）")).toBeVisible();
  await expect(page.getByText("直近の投薬")).toBeVisible();
  await expect(page.getByText("直近のワクチン")).toBeVisible();
  await expect(page.getByText("直近の医療記録")).toBeVisible();
  await expect(page.getByRole("link", { name: "緊急連絡先へ電話" })).toHaveAttribute("href", /tel:/);
  await expect(page.getByRole("link", { name: "病院へ電話" })).toHaveAttribute("href", /tel:/);
  await expect(page.getByRole("link", { name: "病院を地図で開く" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/search/
  );
});

test("public emergency page shows 404 for invalid token", async ({ page }) => {
  await page.goto("/e/not-a-uuid");
  await expect(page.getByText("404")).toBeVisible();
});

test("public emergency page shows 404 for unknown valid token", async ({ page }) => {
  await page.goto("/e/00000000-0000-4000-8000-000000000099");
  await expect(page.getByText("404")).toBeVisible();
});
