import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  envMock,
  settingsFindManyMock,
  medicationFindFirstMock,
  dispatchLogCreateMock,
  dispatchLogDeleteManyMock,
  dispatchMedicationReminderMock
} = vi.hoisted(() => ({
  envMock: {
    DATABASE_URL: "https://example.com/db",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    STRIPE_SECRET_KEY: "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: "whsec_dummy",
    STRIPE_PRICE_ID_MONTHLY_500: "price_dummy",
    MEDICATION_REMINDER_JOB_TOKEN: undefined as string | undefined,
    REMINDER_EMAIL_WEBHOOK_URL: "https://provider.example.com/email",
    REMINDER_LINE_WEBHOOK_URL: "https://provider.example.com/line"
  },
  settingsFindManyMock: vi.fn(),
  medicationFindFirstMock: vi.fn(),
  dispatchLogCreateMock: vi.fn(),
  dispatchLogDeleteManyMock: vi.fn(),
  dispatchMedicationReminderMock: vi.fn()
}));

vi.mock("@/lib/env", () => ({ env: envMock }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petDisplaySettings: { findMany: settingsFindManyMock },
    petMedication: { findFirst: medicationFindFirstMock },
    petMedicationReminderDispatchLog: {
      create: dispatchLogCreateMock,
      deleteMany: dispatchLogDeleteManyMock
    }
  }
}));

vi.mock("@/lib/services/reminder-delivery", () => ({
  dispatchMedicationReminder: dispatchMedicationReminderMock
}));

import { POST } from "../../src/app/api/jobs/medication-reminders/route";

describe("/api/jobs/medication-reminders", () => {
  const petId1 = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.restoreAllMocks();
    settingsFindManyMock.mockReset();
    medicationFindFirstMock.mockReset();
    dispatchLogCreateMock.mockReset();
    dispatchLogDeleteManyMock.mockReset();
    dispatchMedicationReminderMock.mockReset();
    envMock.MEDICATION_REMINDER_JOB_TOKEN = undefined;
  });

  it("dispatches reminders for enabled settings with active medications", async () => {
    settingsFindManyMock.mockResolvedValue([
      {
        petId: petId1,
        medicationReminderChannel: "email",
        medicationReminderDestination: "owner@example.com"
      }
    ]);
    medicationFindFirstMock.mockResolvedValue({ id: "m1" });
    dispatchLogCreateMock.mockResolvedValue({ id: "l1" });
    dispatchMedicationReminderMock.mockResolvedValue({ status: "delivered", provider: "email" });

    const response = await POST(new Request("http://localhost", { method: "POST" }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toMatchObject({
      scanned: 1,
      activeTargeted: 1,
      delivered: 1,
      duplicatesSkipped: 0,
      failed: 0
    });
    expect(dispatchMedicationReminderMock).toHaveBeenCalledTimes(1);
  });

  it("skips duplicate sends in the same reminderDate", async () => {
    settingsFindManyMock.mockResolvedValue([
      {
        petId: petId1,
        medicationReminderChannel: "line",
        medicationReminderDestination: "line-user-1"
      }
    ]);
    medicationFindFirstMock.mockResolvedValue({ id: "m1" });
    dispatchLogCreateMock.mockRejectedValue({ code: "P2002" });

    const response = await POST(new Request("http://localhost", { method: "POST" }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.duplicatesSkipped).toBe(1);
    expect(dispatchMedicationReminderMock).not.toHaveBeenCalled();
  });

  it("retries once on configured_but_failed and deletes log when still failing", async () => {
    settingsFindManyMock.mockResolvedValue([
      {
        petId: petId1,
        medicationReminderChannel: "email",
        medicationReminderDestination: "owner@example.com"
      }
    ]);
    medicationFindFirstMock.mockResolvedValue({ id: "m1" });
    dispatchLogCreateMock.mockResolvedValue({ id: "l1" });
    dispatchMedicationReminderMock
      .mockResolvedValueOnce({ status: "configured_but_failed", provider: "email", detail: "502" })
      .mockResolvedValueOnce({ status: "configured_but_failed", provider: "email", detail: "502" });

    const response = await POST(new Request("http://localhost", { method: "POST" }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.failed).toBe(1);
    expect(dispatchMedicationReminderMock).toHaveBeenCalledTimes(2);
    expect(dispatchLogDeleteManyMock).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when job token is configured and authorization is missing", async () => {
    envMock.MEDICATION_REMINDER_JOB_TOKEN = "secret-token";

    const response = await POST(new Request("http://localhost", { method: "POST" }));

    expect(response.status).toBe(401);
    expect(settingsFindManyMock).not.toHaveBeenCalled();
  });
});
