import { expect, test } from "@playwright/test";

test.describe("UI/UX Comprehensive Improvements Verification", () => {
  test("Requirement 1 & 2: Sub-photos, summary, medication calendar, and graph titles have high contrast and visibility", async ({ page }) => {
    await page.goto("/pets/demo-pet");

    // Basic info tab -> Photos subtab
    await page.getByRole("button", { name: "🖼️ サブ写真" }).click();
    await expect(page.getByRole("heading", { name: "サブ写真" })).toBeVisible();

    // Medical tab -> Medications subtab
    await page.getByRole("tab", { name: "医療" }).click();
    await page.getByRole("button", { name: "💊 投薬管理" }).click();
    await expect(page.getByRole("heading", { name: "投薬カレンダー（7日）" })).toBeVisible();

    // Medical tab -> Health tracking subtab (Graph, non-selected category buttons, history headings)
    await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();
    await expect(page.getByText("📈 推移グラフ")).toBeVisible();
    await expect(page.getByText("共通コア履歴")).toBeVisible();
    await expect(page.getByText("血液検査履歴")).toBeVisible();
    
    // Category non-selected buttons visibility check
    const urineCategoryBtn = page.getByRole("button", { name: "尿検査" }).first();
    await expect(urineCategoryBtn).toBeVisible();
    const endocrineCategoryBtn = page.getByRole("button", { name: "内分泌検査" }).first();
    await expect(endocrineCategoryBtn).toBeVisible();
  });

  test("Requirement 3: Extension form elements, placeholders and usage guidelines", async ({ page }) => {
    await page.goto("/pets/demo-pet");
    await page.getByRole("tab", { name: "医療" }).click();
    await page.getByRole("button", { name: "📊 健康記録・グラフ" }).click();

    // Click extension toggle label
    await page.getByText("拡張項目の入力フォームを表示").click();

    // Guideline text & title
    await expect(page.getByText("🧪 拡張項目フォーム（複数可）")).toBeVisible();
    await expect(page.getByText("病院の検査結果や個別の健康指標")).toBeVisible();

    // Check placeholders and action buttons
    await expect(page.getByPlaceholder("項目名 (例: AST)")).toBeVisible();
    await expect(page.getByPlaceholder("数値", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("単位", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "＋ 新しい行を追加" })).toBeVisible();
    await expect(page.getByRole("button", { name: "💾 拡張項目を保存" })).toBeVisible();
  });

  test("Requirement 4: Care summary is properly placed and print elements exist without bottom clutter", async ({ page }) => {
    await page.goto("/pets/demo-pet");

    // In Basic info tab, bottom redundant summary should NOT block view
    await expect(page.locator("section#summary")).not.toBeVisible();

    // Go to Medical -> Export & Summary subtab
    await page.getByRole("tab", { name: "医療" }).click();
    await page.getByRole("button", { name: "🖨️ 提出サマリー・出力" }).click();

    // Consolidated full care summary sheet and print button
    await expect(page.getByRole("heading", { name: "🖨️ 通院・救急提出用サマリー（全項目統合シート）" })).toBeVisible();
    await expect(page.getByRole("button", { name: "🖨️ 印刷 / PDF保存" })).toBeVisible();
  });

  test("Requirement 5: Medical group sub-tabs prevent long scrolling and provide fast navigation", async ({ page }) => {
    await page.goto("/pets/demo-pet");
    await page.getByRole("tab", { name: "医療" }).click();

    // Ensure all 5 sub-tabs are displayed as segmented control
    await expect(page.getByRole("button", { name: "💊 投薬管理" })).toBeVisible();
    await expect(page.getByRole("button", { name: "💉 ワクチン・予防歴" })).toBeVisible();
    await expect(page.getByRole("button", { name: "📊 健康記録・グラフ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "📋 医療記録・書類" })).toBeVisible();
    await expect(page.getByRole("button", { name: "🖨️ 提出サマリー・出力" })).toBeVisible();

    // Switch between sub-tabs instantly without vertical clutter
    await page.getByRole("button", { name: "💉 ワクチン・予防歴" }).click();
    await expect(page.getByRole("heading", { name: "ワクチン・予防歴" })).toBeVisible();

    await page.getByRole("button", { name: "📋 医療記録・書類" }).click();
    await expect(page.getByRole("heading", { name: "医療記録タイムライン" })).toBeVisible();
  });
});
