import { expect, test } from "@playwright/test";

test("invite join page renders form", async ({ page }) => {
  await page.goto("/invite/join");
  await expect(page.getByRole("heading", { name: "家族として参加" })).toBeVisible();
  await expect(page.getByPlaceholder("招待コード")).toBeVisible();
  await expect(page.getByRole("button", { name: "参加する" })).toBeVisible();
});

test("pets page links to pet detail", async ({ page }) => {
  await page.goto("/pets");
  await page.getByRole("link", { name: "モカ 犬 / トイプードル" }).click();
  await expect(page).toHaveURL(/\/pets\/sample-pet$/);
  await expect(page.getByRole("heading", { name: "モカ" })).toBeVisible();
});
