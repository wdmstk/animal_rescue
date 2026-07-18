import { beforeEach, describe, expect, it, vi } from "vitest";

const { envMock, findManySettingsMock, findManyVaccinationsMock, createLogMock } = vi.hoisted(() => ({
  envMock: {
    DATABASE_URL: "https://example.com/db",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    STRIPE_SECRET_KEY: "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: "whsec_dummy",
    STRIPE_PRICE_ID_MONTHLY_680: "price_dummy",
    MEDICATION_REMINDER_JOB_TOKEN: undefined as string | undefined,
    REMINDER_SCHEDULE_TIMEZONE: undefined as string | undefined,
    REMINDER_EMAIL_WEBHOOK_URL: "https://provider.example.com/email",
    REMINDER_LINE_WEBHOOK_URL: "https://provider.example.com/line"
  },
  findManySettingsMock: vi.fn(),
  findManyVaccinationsMock: vi.fn(),
  createLogMock: vi.fn()
}));

vi.mock("@/lib/env", () => ({ env: envMock }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petDisplaySettings: {
      findMany: findManySettingsMock
    },
    petVaccination: {
      findMany: findManyVaccinationsMock
    },
    petVaccineReminderDispatchLog: {
      create: createLogMock,
      deleteMany: vi.fn()
    }
  }
}));

import { POST } from "../../src/app/api/jobs/vaccine-reminders/route";

describe("POST /api/jobs/vaccine-reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("processes vaccine reminders", async () => {
    findManySettingsMock.mockResolvedValue([
      {
        petId: "pet-1",
        vaccineReminderChannel: "email",
        vaccineReminderDestination: "test@example.com"
      }
    ]);
    findManyVaccinationsMock.mockResolvedValue([
      {
        id: "vac-1",
        type: "RABIES",
        nextDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      }
    ]);
    createLogMock.mockResolvedValue({ id: "log-1" });

    // Mock fetch to succeed
    const globalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as any);

    const response = await POST(new Request("http://localhost", { method: "POST" }));
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.data.scanned).toBe(1);
    expect(payload.data.dueVaccinesFound).toBe(1);

    global.fetch = globalFetch;
  });
});
