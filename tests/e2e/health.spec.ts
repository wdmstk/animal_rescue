import { expect, test } from "@playwright/test";

test("pet detail shows health tracking section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("heading", { name: "健康記録" })).toBeVisible();
});

test("pet detail shows parallel implementation sections", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("navigation", { name: "詳細セクションナビ" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "モカ" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "通院提出用サマリー（印刷/PDF）" })).toBeVisible();
  await expect(page.getByRole("button", { name: "印刷/PDF出力" })).toBeVisible();
  await expect(page.getByText("犬 / トイプードル", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "サブ写真" })).toBeVisible();
  await expect(page.getByRole("button", { name: "写真を追加" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "緊急情報", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "QR共有" })).toBeVisible();
  await expect(page.getByRole("link", { name: "公開画面を確認" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ワクチン・予防歴" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "投薬カレンダー（7日）" })).toBeVisible();
  const medicationSection = page.locator("section", { hasText: "投薬カレンダー（7日）" });
  await expect(medicationSection.getByText("ピモベンダン").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "トークン再生成" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "記録を追加" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "医療記録タイムライン" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "定期健診" })).toBeVisible();
});

test("pet detail section nav jumps to target section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("link", { name: "健康記録" }).click();
  await expect(page).toHaveURL(/#health$/);
  await expect(page.getByRole("heading", { name: "健康記録" })).toBeVisible();
});

test("health graph controls and extension form are interactive", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  const graphSection = page.locator("div", { hasText: "推移グラフ" }).first();
  await expect(graphSection).toBeVisible();

  const labButton = graphSection.getByRole("button", { name: "血液検査" }).first();
  await expect(labButton).toBeVisible();
  await labButton.click();
  await expect(page.getByText("推移グラフ")).toBeVisible();
});

test("health panel shows input, history and graph sections", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByText("共通コアを記録")).toBeVisible();
  await expect(page.getByText("血液検査を記録")).toBeVisible();
  await expect(page.getByRole("button", { name: "尿検査" })).toBeVisible();
  await expect(page.getByRole("button", { name: "内分泌検査" })).toBeVisible();
  await expect(page.getByText("推移グラフ")).toBeVisible();
  await expect(page.getByText("共通コア履歴")).toBeVisible();
});

test("urine category can select staged urine markers", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("button", { name: "尿検査" }).click();
  const markerSelect = page.locator("form").filter({ hasText: "尿検査を記録" }).locator("select").first();
  await markerSelect.selectOption("UPCR");
  await expect(markerSelect).toHaveValue("UPCR");
});

test("extension toggle shows infusion input form", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  const extensionToggle = page.locator("label:has-text('拡張項目（例: 点滴量）') input[type='checkbox']");
  await expect(extensionToggle).not.toBeChecked();
  await extensionToggle.check();
  await expect(extensionToggle).toBeChecked();
});

test("health graph period selector can be changed", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  const periodSelect = page.locator("select").filter({ has: page.locator("option", { hasText: "全期間" }) }).first();
  await periodSelect.selectOption("all");
  await expect(periodSelect).toHaveValue("all");
});
