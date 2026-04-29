import { expect, test } from "@playwright/test";

test("logout from settings redirects to login", async ({ page }) => {
  let isLoggedOut = false;

  await page.route("**/api/auth/logout", async (route) => {
    isLoggedOut = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true })
    });
  });

  await page.route("**/api/households/members", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          household: {
            id: "h1",
            name: "Test Household",
            members: [
              { id: "m1", userId: "u1", role: "OWNER", createdAt: "2026-04-29T00:00:00.000Z" }
            ]
          },
          currentUserRole: "OWNER"
        }
      })
    });
  });

  await page.route("**/api/account", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          userId: "u1",
          email: "user@example.com",
          displayName: "User"
        }
      })
    });
  });

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "ログイン情報" })).toBeVisible();

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(isLoggedOut).toBe(true);
});
