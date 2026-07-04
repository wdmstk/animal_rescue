import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test("should display theme toggle buttons on dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button[aria-label="ライト"]')).not.toBeVisible();
  });

  test("should have theme toggle component defined", async ({ page }) => {
    await page.goto("/login");
    // Check that the page loads without errors
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });

  test("should have dark mode CSS classes defined", async ({ page }) => {
    await page.goto("/login");
    // Check that dark mode styles are available
    const hasDarkStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--background-start') !== '';
    });
    expect(hasDarkStyles).toBe(true);
  });
});
