import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";

const { findFirstMock, findUniqueMock, upsertMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  findUniqueMock: vi.fn(),
  upsertMock: vi.fn()
}));

const prismaMock = vi.hoisted(() => ({
  householdMember: {
    findFirst: findFirstMock
  },
  ownerDisplaySettings: {
    findUnique: findUniqueMock,
    upsert: upsertMock
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

import { GET, PATCH } from "../../src/app/api/settings/display/route";

describe("/api/settings/display", () => {
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);

  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      userId: "11111111-1111-4111-8111-111111111111"
    });
    findFirstMock
      .mockResolvedValueOnce({ householdId: "household-1" })
      .mockResolvedValueOnce({ userId: "11111111-1111-4111-8111-111111111111" });
  });

  it("returns 503 on GET when ownerDisplaySettings delegate is unavailable", async () => {
    (prismaMock as { ownerDisplaySettings?: unknown }).ownerDisplaySettings = undefined;

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Display settings model is unavailable. Regenerate Prisma Client."
    });
  });

  it("returns 503 on PATCH when ownerDisplaySettings delegate is unavailable", async () => {
    (prismaMock as { ownerDisplaySettings?: unknown }).ownerDisplaySettings = undefined;

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showMedicationCard: false })
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Display settings model is unavailable. Regenerate Prisma Client."
    });
  });

  it("returns persisted settings on GET when delegate is available", async () => {
    prismaMock.ownerDisplaySettings = {
      findUnique: findUniqueMock,
      upsert: upsertMock
    };
    findUniqueMock.mockResolvedValue({
      ownerUserId: "11111111-1111-4111-8111-111111111111",
      showMedicationCard: false,
      showVaccinationCard: true,
      showHealthCard: true,
      showMedicalRecordCard: true,
      showEmergencyMedicationSummary: false,
      showEmergencyVaccinationSummary: true,
      showEmergencyMedicalRecordSummary: true
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        ownerUserId: "11111111-1111-4111-8111-111111111111",
        showMedicationCard: false,
        showVaccinationCard: true,
        showHealthCard: true,
        showMedicalRecordCard: true,
        showEmergencyMedicationSummary: false,
        showEmergencyVaccinationSummary: true,
        showEmergencyMedicalRecordSummary: true
      }
    });
  });

  it("returns 401 on unauthenticated GET", async () => {
    prismaMock.ownerDisplaySettings = {
      findUnique: findUniqueMock,
      upsert: upsertMock
    };
    requireAuthenticatedUserMock.mockResolvedValueOnce(NextResponse.json({ error: "認証が必要です" }, { status: 401 }));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });
});
