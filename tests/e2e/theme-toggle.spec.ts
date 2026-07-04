import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/pets");
  });

  test("should display theme toggle buttons on dashboard", async ({ page }) => {
    await expect(page.locator('button[aria-label="ライト"]')).toBeVisible();
    await expect(page.locator('button[aria-label="ダーク"]')).toBeVisible();
    await expect(page.locator('button[aria-label="自動"]')).toBeVisible();
  });

  test("should switch to dark mode when dark button is clicked", async ({ page }) => {
    await page.click('button[aria-label="ダーク"]');
    
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    
    const activeButton = page.locator('button[aria-label="ダーク"]');
    await expect(activeButton).toHaveClass(/bg-slate-900/);
  });

  test("should switch to light mode when light button is clicked", async ({ page }) => {
    await page.click('button[aria-label="ライト"]');
    
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    
    const activeButton = page.locator('button[aria-label="ライト"]');
    await expect(activeButton).toHaveClass(/bg-slate-900/);
  });

  test("should switch to system mode when auto button is clicked", async ({ page }) => {
    await page.click('button[aria-label="自動"]');
    
    const activeButton = page.locator('button[aria-label="自動"]');
    await expect(activeButton).toHaveClass(/bg-slate-900/);
  });

  test("should persist theme preference in localStorage", async ({ page }) => {
    await page.click('button[aria-label="ダーク"]');
    
    const storedTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(storedTheme).toBe("dark");
  });

  test("should restore theme preference from localStorage on page load", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    
    const activeButton = page.locator('button[aria-label="ダーク"]');
    await expect(activeButton).toHaveClass(/bg-slate-900/);
  });

  test("should apply dark mode styles to components", async ({ page }) => {
    await page.click('button[aria-label="ダーク"]');
    
    const header = page.locator("header");
    await expect(header).toHaveClass(/dark:bg-slate-900\/95/);
    
    const title = page.locator("h1");
    await expect(title).toHaveClass(/dark:text-slate-100/);
  });
});
