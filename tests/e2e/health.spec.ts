import { expect, test } from "@playwright/test";

test("pet detail shows health tracking section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  await expect(page.getByRole("heading", { name: "健康記録・検査データ" })).toBeVisible();
});

test("pet detail shows parallel implementation sections", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await expect(page.getByRole("heading", { name: "モカのカルテ情報", exact: true })).toBeVisible();
  
  // 「基本情報」サブタブ「サブ写真」の確認
  await page.getByRole("button", { name: "🖼️ サブ写真" }).click();
  await expect(page.getByRole("heading", { name: "サブ写真" })).toBeVisible();
  await expect(page.getByRole("button", { name: "写真を追加" })).toBeVisible();

  // 「緊急」タブを表示して緊急情報・QR共有関連を検証
  await page.getByRole("tab", { name: "緊急" }).click();
  await page.getByRole("button", { name: "📱 QR共有" }).click();
  await expect(page.getByRole("heading", { name: "QR共有" })).toBeVisible();
  await expect(page.getByRole("link", { name: "公開画面を確認" })).toBeVisible();
  await expect(page.getByRole("button", { name: "トークン再生成" })).toBeVisible();

  // 「医療」タブを表示して医療関連を検証
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "💊 投薬管理" }).click();
  await expect(page.getByRole("heading", { name: "投薬カレンダー（7日）" })).toBeVisible();
  const medicationSection = page.locator("section", { hasText: "投薬カレンダー（7日）" });
  await expect(medicationSection.getByText("ピモベンダン").first()).toBeVisible();

  await page.getByRole("button", { name: "💉 ワクチン・予防歴" }).click();
  await expect(page.getByRole("heading", { name: "ワクチン・予防歴" })).toBeVisible();

  await page.getByRole("button", { name: "📋 医療記録・書類" }).click();
  await expect(page.getByRole("heading", { name: "記録を追加" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "医療記録タイムライン" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "定期健診" })).toBeVisible();

  await page.getByRole("button", { name: "🖨️ 提出サマリー・出力" }).click();
  await expect(page.getByRole("heading", { name: "🖨️ 通院・救急提出用サマリー（全項目統合シート）" })).toBeVisible();
});

test("pet detail section nav jumps to target section", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  await expect(page.getByRole("heading", { name: "健康記録・検査データ" })).toBeVisible();
});

test("health graph controls and extension form are interactive", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  const graphSection = page.locator("div", { hasText: "推移グラフ" }).first();
  await expect(graphSection).toBeVisible();

  const labButton = graphSection.getByRole("button", { name: "血液検査" }).first();
  await expect(labButton).toBeVisible();
  await labButton.click();
  await expect(page.getByText("推移グラフ")).toBeVisible();
});

test("health panel shows input, history and graph sections", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  await expect(page.getByText("共通コアを記録")).toBeVisible();
  await expect(page.getByText("血液検査を記録")).toBeVisible();
  await expect(page.getByRole("button", { name: "尿検査" })).toBeVisible();
  await expect(page.getByRole("button", { name: "内分泌検査" })).toBeVisible();
  await expect(page.getByText("推移グラフ")).toBeVisible();
  await expect(page.getByText("共通コア履歴")).toBeVisible();
});

test("urine category can select staged urine markers", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  await page.getByRole("button", { name: "尿検査" }).click();
  const markerSelect = page.locator("form").filter({ hasText: "尿検査を記録" }).locator("select").first();
  await markerSelect.selectOption("UPCR");
  await expect(markerSelect).toHaveValue("UPCR");
});

test("extension toggle shows infusion input form", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  await page.getByText("拡張項目の入力フォームを表示").click();
  await expect(page.getByText("🧪 拡張項目フォーム（複数可）")).toBeVisible();
});

test("health graph period selector can be changed", async ({ page }) => {
  await page.goto("/pets/demo-pet");
  await page.getByRole("tab", { name: "医療" }).click();
  await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
  const periodSelect = page.locator("select").filter({ has: page.locator("option", { hasText: "全期間" }) }).first();
  await periodSelect.selectOption("all");
  await expect(periodSelect).toHaveValue("all");
});
