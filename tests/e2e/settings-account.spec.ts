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
          planTier: "free",
          subscriptionStatus: "INCOMPLETE",
          status: "INCOMPLETE",
          isActive: false,
          trialEndsAt: null,
          currentPeriodEnd: null
        }
      })
    });
  });

  await page.route("**/api/pets", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{ id: "pet-1", name: "モカ" }]
      })
    });
  });

  await page.route("**/api/settings/display", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          ownerUserId: "u1",
          showMedicationCard: true,
          showVaccinationCard: true,
          showHealthCard: true,
          showMedicalRecordCard: true,
          showEmergencyMedicationSummary: true,
          showEmergencyVaccinationSummary: true,
          showEmergencyMedicalRecordSummary: true
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

test("settings can toggle pet display setting", async ({ page }) => {
  let displayPatchCalled = false;

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
          planTier: "free",
          subscriptionStatus: "INCOMPLETE",
          status: "INCOMPLETE",
          isActive: false,
          trialEndsAt: null,
          currentPeriodEnd: null
        }
      })
    });
  });

  await page.route("**/api/pets", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{ id: "pet-1", name: "モカ" }]
      })
    });
  });

  await page.route("**/api/settings/display", async (route) => {
    if (route.request().method() === "PATCH") {
      displayPatchCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            ownerUserId: "u1",
            showMedicationCard: false,
            showVaccinationCard: true,
            showHealthCard: true,
            showMedicalRecordCard: true,
            showEmergencyMedicationSummary: true,
            showEmergencyVaccinationSummary: true,
            showEmergencyMedicalRecordSummary: true
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          ownerUserId: "u1",
          showMedicationCard: true,
          showVaccinationCard: true,
          showHealthCard: true,
          showMedicalRecordCard: true,
          showEmergencyMedicationSummary: true,
          showEmergencyVaccinationSummary: true,
          showEmergencyMedicalRecordSummary: true
        }
      })
    });
  });

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "ペット表示設定" })).toBeVisible();

  const toggle = page.getByLabel("詳細: 投薬カード");
  await toggle.click();
  await expect(page.getByText("表示設定を更新しました。")).toBeVisible();
  expect(displayPatchCalled).toBe(true);
});

test("settings shows checkout CTA for inactive subscription and calls checkout endpoint", async ({ page }) => {
  let checkoutCalled = false;

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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { userId: "u1", email: "user@example.com", displayName: "User" } })
    });
  });

  await page.route("**/api/billing/subscription", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          planTier: "free",
          subscriptionStatus: "INCOMPLETE",
          status: "INCOMPLETE",
          isActive: false,
          trialEndsAt: null,
          currentPeriodEnd: null
        }
      })
    });
  });

  await page.route("**/api/billing/checkout", async (route) => {
    checkoutCalled = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { url: "/settings?billing=success" } })
    });
  });

  await page.route("**/api/pets", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });

  await page.route("**/api/settings/display", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          ownerUserId: "u1",
          showMedicationCard: true,
          showVaccinationCard: true,
          showHealthCard: true,
          showMedicalRecordCard: true,
          showEmergencyMedicationSummary: true,
          showEmergencyVaccinationSummary: true,
          showEmergencyMedicalRecordSummary: true
        }
      })
    });
  });

  await page.goto("/settings");
  const cta = page.getByRole("button", { name: "無料トライアルを開始する" });
  await expect(cta).toBeVisible();
  await cta.click();
  expect(checkoutCalled).toBe(true);
});

test("settings shows portal CTA for active subscription and calls portal endpoint", async ({ page }) => {
  let portalCalled = false;

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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { userId: "u1", email: "user@example.com", displayName: "User" } })
    });
  });

  await page.route("**/api/billing/subscription", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          planTier: "paid",
          subscriptionStatus: "ACTIVE",
          status: "ACTIVE",
          isActive: true,
          trialEndsAt: null,
          currentPeriodEnd: "2026-06-01T00:00:00.000Z"
        }
      })
    });
  });

  await page.route("**/api/billing/portal", async (route) => {
    portalCalled = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { url: "/settings" } })
    });
  });

  await page.route("**/api/pets", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  });

  await page.route("**/api/settings/display", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          ownerUserId: "u1",
          showMedicationCard: true,
          showVaccinationCard: true,
          showHealthCard: true,
          showMedicalRecordCard: true,
          showEmergencyMedicationSummary: true,
          showEmergencyVaccinationSummary: true,
          showEmergencyMedicalRecordSummary: true
        }
      })
    });
  });

  await page.goto("/settings");
  const cta = page.getByRole("button", { name: "契約を管理する" });
  await expect(cta).toBeVisible();
  await cta.click();
  expect(portalCalled).toBe(true);
});
