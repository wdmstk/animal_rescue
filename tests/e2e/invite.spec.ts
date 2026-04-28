import { expect, test } from "@playwright/test";

test("invite join page renders form", async ({ page }) => {
  await page.goto("/invite/join");
  await expect(page.getByRole("heading", { name: "家族として参加" })).toBeVisible();
  await expect(page.getByPlaceholder("招待コード")).toBeVisible();
  await expect(page.getByRole("button", { name: "参加する" })).toBeVisible();
});

test("invite join keeps input value and shows API error", async ({ page }) => {
  await page.route("**/api/households/join", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "招待コードが無効です" })
    });
  });

  await page.goto("/invite/join");
  const inviteCodeInput = page.getByPlaceholder("招待コード");
  await inviteCodeInput.fill("ABC123");
  await page.getByRole("button", { name: "参加する" }).click();

  await expect(page.getByText("招待コードが無効です")).toBeVisible();
  await expect(inviteCodeInput).toHaveValue("ABC123");
});

test("pets page links to pet detail", async ({ page }) => {
  await page.goto("/pets");
  await page.getByRole("link", { name: "モカ 犬 / トイプードル" }).click();
  await expect(page).toHaveURL(/\/pets\/sample-pet$/);
  await expect(page.getByRole("heading", { name: "モカ" })).toBeVisible();
});

test("pets page can issue invite code", async ({ page }) => {
  await page.route("**/api/households/invite-codes", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          code: "ABCDEF",
          expiresAt: "2026-05-01T00:00:00.000Z"
        }
      })
    });
  });

  await page.goto("/pets");
  await page.getByRole("button", { name: "発行" }).click();

  await expect(page.getByText("発行済みコード")).toBeVisible();
  await expect(page.getByText("ABCDEF", { exact: true })).toBeVisible();
});
