import { test, expect } from "@playwright/test";

test.describe("ペット削除", () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/pets");
  });

  test("ペット詳細画面から削除できる", async ({ page }) => {
    // ペット一覧から詳細へ
    await page.click("text=モカ");
    await page.waitForURL(/\/pets\/[a-f0-9-]+/);

    // 削除セクションへスクロール
    await page.locator('a[href="#delete"]').click();
    await page.waitForTimeout(500);

    // 削除ボタンをクリック
    await page.click("text=削除する");
    await page.waitForTimeout(500);

    // 確認ダイアログで削除実行
    await page.click("text=削除する", { state: "visible" });

    // ペット一覧へリダイレクト
    await page.waitForURL("/pets");
    expect(page.url()).toBe("/pets");
  });

  test("削除キャンセルでペットが残る", async ({ page }) => {
    // ペット一覧から詳細へ
    await page.click("text=モカ");
    await page.waitForURL(/\/pets\/[a-f0-9-]+/);

    // 削除セクションへスクロール
    await page.locator('a[href="#delete"]').click();
    await page.waitForTimeout(500);

    // 削除ボタンをクリック
    await page.click("text=削除する");
    await page.waitForTimeout(500);

    // キャンセルをクリック
    await page.click("text=キャンセル");

    // まだ詳細画面にいる
    expect(page.url()).toMatch(/\/pets\/[a-f0-9-]+/);
  });

  test("未認証時は削除できない", async ({ page, context }) => {
    // ログアウト
    await context.clearCookies();
    await page.goto("/pets/sample-pet");

    // 削除セクションが表示されないか、APIエラーになる
    await page.waitForURL("/login");
    expect(page.url()).toBe("/login");
  });
});
