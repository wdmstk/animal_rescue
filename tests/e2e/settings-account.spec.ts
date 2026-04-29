import { expect, test } from "@playwright/test";

test("settings account update shows message when nothing changed", async ({ page }) => {
  let patchCallCount = 0;

  await page.route("**/api/households/members", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          household: {
            id: "h1",
            name: "Test Household",
            members: [{ id: "m1", userId: "u1", role: "OWNER", createdAt: "2026-04-29T00:00:00.000Z" }]
          },
          currentUserRole: "OWNER"
        }
      })
    });
  });

  await page.route("**/api/account", async (route) => {
    if (route.request().method() === "PATCH") {
      patchCallCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true })
      });
      return;
    }

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

  await page.route("**/api/billing/subscription", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          status: "INCOMPLETE",
          isActive: false,
          currentPeriodEnd: null
        }
      })
    });
  });

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "ログイン情報" })).toBeVisible();

  await page.getByRole("button", { name: "更新する" }).click();

  await expect(page.getByText("更新する項目がありません。")).toBeVisible();
  expect(patchCallCount).toBe(0);
});
