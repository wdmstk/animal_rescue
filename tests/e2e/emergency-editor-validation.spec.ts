import { expect, test } from "@playwright/test";

test("emergency editor shows phone format hints", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("link", { name: "緊急情報" }).click();
  await page.getByRole("button", { name: "緊急情報を編集" }).click();

  const vetPhoneInput = page.getByLabel("かかりつけ病院電話番号");
  await expect(vetPhoneInput).toHaveAttribute("pattern", "[0-9+()\\-\\s]+");
  await expect(vetPhoneInput).toHaveAttribute("placeholder", "例: 03-1234-5678");

  const emergencyPhoneInput = page.getByLabel("緊急連絡先電話番号").first();
  await expect(emergencyPhoneInput).toHaveAttribute("pattern", "[0-9+()\\-\\s]+");
  await expect(emergencyPhoneInput).toHaveAttribute("placeholder", "例: 090-1234-5678");
});
