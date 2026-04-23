import { expect, test } from "@playwright/test";

test("pet detail shows health tracking section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("heading", { name: "健康記録" })).toBeVisible();
});
