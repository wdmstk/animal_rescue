import { expect, test } from "@playwright/test";

test("tooltip triggers are visible on forms", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("button", { name: "緊急情報" }).click();

  // 緊急情報を編集ボタンをクリック
  await page.getByRole("button", { name: "緊急情報を編集" }).click();

  // 持病のtooltipトリガーが表示されることを確認
  const diseaseTooltip = page.locator("label:has-text('持病') div.cursor-help").first();
  await expect(diseaseTooltip).toBeVisible();

  // 服薬のtooltipトリガーが表示されることを確認
  const medicationTooltip = page.locator("label:has-text('服薬') div.cursor-help").first();
  await expect(medicationTooltip).toBeVisible();

  // アレルギーのtooltipトリガーが表示されることを確認
  const allergyTooltip = page.locator("label:has-text('アレルギー') div.cursor-help").first();
  await expect(allergyTooltip).toBeVisible();
});

test("tooltip triggers have correct accessibility attributes", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("button", { name: "緊急情報" }).click();

  // 緊急情報を編集ボタンをクリック
  await page.getByRole("button", { name: "緊急情報を編集" }).click();

  // 持病のtooltipトリガー（親のdivをターゲット）
  const tooltipTrigger = page.locator("label:has-text('持病') div.cursor-help").first();

  // アクセシビリティ属性を確認
  await expect(tooltipTrigger).toHaveAttribute("tabindex", "0");
  await expect(tooltipTrigger).toHaveAttribute("role", "button");
  await expect(tooltipTrigger).toHaveAttribute("aria-label", "詳細情報を表示");
});