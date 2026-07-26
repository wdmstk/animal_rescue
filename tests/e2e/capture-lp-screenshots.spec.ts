import { test } from "@playwright/test";
import path from "path";

test.use({ baseURL: "http://localhost:3000" });

test.describe("Capture Real App Screenshots for LP", () => {
  test("capture real dashboard screenshot", async ({ page }) => {
    // Set viewport for crisp dashboard view
    await page.setViewportSize({ width: 1280, height: 960 });

    // Navigate to pets dashboard page
    const response = await page.goto("/pets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log(`[DEBUG] /pets status: ${response?.status()}, URL: ${page.url()}`);

    // Save real screenshot to public/lp-dashboard.jpg
    const dashboardPath = path.join(process.cwd(), "public", "lp-dashboard.jpg");
    await page.screenshot({ path: dashboardPath, fullPage: false, type: "jpeg", quality: 90 });
    console.log(`Captured real app dashboard screenshot: ${dashboardPath}`);
  });

  test("capture real emergency QR screen screenshot", async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to Pochi's public emergency token page
    const token = "80000000-0000-4100-a000-000000000001";
    const response = await page.goto(`/e/${token}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    console.log(`[DEBUG] /e/${token} status: ${response?.status()}, URL: ${page.url()}`);

    // Save real screenshot to public/lp-hero-qr.jpg
    const heroQrPath = path.join(process.cwd(), "public", "lp-hero-qr.jpg");
    await page.screenshot({ path: heroQrPath, fullPage: false, type: "jpeg", quality: 90 });
    console.log(`Captured real app emergency QR screenshot: ${heroQrPath}`);
  });
});
