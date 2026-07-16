import { test, expect } from "@playwright/test";

test.describe("ペット削除", () => {
  test("削除導線が表示される", async ({ page }) => {
    // E2Eモードでペット詳細ページへ
    await page.goto("/pets/demo-pet");
    await page.getByRole("link", { name: "削除" }).click();

    // 削除セクションが存在する
    await expect(page.locator('section#delete')).toBeVisible();
    await expect(page.locator("text=ペット削除")).toBeVisible();
  });

  test("削除ボタンで確認ダイアログが表示される", async ({ page }) => {
    await page.goto("/pets/demo-pet");
    await page.getByRole("link", { name: "削除" }).click();

    // 削除ボタンをクリック
    await page.click("text=削除する");

    // 確認ダイアログが表示される
    await expect(page.locator("text=削除の確認")).toBeVisible();
    await expect(page.locator("text=この操作は取り消せません")).toBeVisible();
  });

  test("キャンセルで確認ダイアログが閉じる", async ({ page }) => {
    await page.goto("/pets/demo-pet");
    await page.getByRole("link", { name: "削除" }).click();

    // 削除ボタンをクリック
    await page.click("text=削除する");

    // キャンセルをクリック
    await page.click("text=キャンセル");

    // 確認ダイアログが閉じる
    await expect(page.locator("text=削除の確認")).not.toBeVisible();
  });
});
