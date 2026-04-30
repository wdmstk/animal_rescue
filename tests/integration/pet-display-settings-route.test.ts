import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, upsertMock, findFirstMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  upsertMock: vi.fn(),
  findFirstMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ownerDisplaySettings: {
      findUnique: findUniqueMock,
      upsert: upsertMock
    },
    householdMember: {
      findFirst: findFirstMock
    }
  }
}));

import { GET, PATCH } from "../../src/app/api/pets/[petId]/display-settings/route";

describe("/api/pets/[petId]/display-settings", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
    findFirstMock.mockResolvedValue({ userId: "22222222-2222-4222-8222-222222222222" });
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns all true defaults when settings do not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({
      ownerUserId: "22222222-2222-4222-8222-222222222222",
      showMedicationCard: true,
      showVaccinationCard: true,
      showHealthCard: true,
      showMedicalRecordCard: true,
      showEmergencyMedicationSummary: true,
      showEmergencyVaccinationSummary: true,
      showEmergencyMedicalRecordSummary: true
    });
  });

  it("returns persisted settings on GET", async () => {
    findUniqueMock.mockResolvedValue({
      ownerUserId: "22222222-2222-4222-8222-222222222222",
      showMedicationCard: false,
      showVaccinationCard: true,
      showHealthCard: false,
      showMedicalRecordCard: true,
      showEmergencyMedicationSummary: false,
      showEmergencyVaccinationSummary: true,
      showEmergencyMedicalRecordSummary: false
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.showMedicationCard).toBe(false);
    expect(payload.data.showEmergencyMedicalRecordSummary).toBe(false);
  });

  it("returns 400 on invalid PATCH payload", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("upserts partial settings on PATCH", async () => {
    upsertMock.mockResolvedValue({
      ownerUserId: "22222222-2222-4222-8222-222222222222",
      showMedicationCard: false,
      showVaccinationCard: true,
      showHealthCard: true,
      showMedicalRecordCard: true,
      showEmergencyMedicationSummary: true,
      showEmergencyVaccinationSummary: true,
      showEmergencyMedicalRecordSummary: true
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showMedicationCard: false
        })
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { ownerUserId: "22222222-2222-4222-8222-222222222222" },
      update: { showMedicationCard: false },
      create: {
        ownerUserId: "22222222-2222-4222-8222-222222222222",
        showMedicationCard: false,
        showVaccinationCard: true,
        showHealthCard: true,
        showMedicalRecordCard: true,
        showEmergencyMedicationSummary: true,
        showEmergencyVaccinationSummary: true,
        showEmergencyMedicalRecordSummary: true
      }
    });
  });
});
