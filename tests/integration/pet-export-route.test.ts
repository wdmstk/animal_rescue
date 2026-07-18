import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findUniqueMock, requireExportAccessMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  requireExportAccessMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findUniqueMock
    }
  }
}));

vi.mock("@/lib/billing/access-guard", () => ({
  requireExportAccess: requireExportAccessMock
}));

import { GET } from "../../src/app/api/pets/[petId]/export/route";

describe("GET /api/pets/[petId]/export", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
    requireExportAccessMock.mockResolvedValue({
      isActive: true
    } as any);
  });

  it("exports pet health data to CSV", async () => {
    findUniqueMock.mockResolvedValue({
      id: validPetId,
      name: "Choco",
      medicalRecords: [
        {
          date: new Date("2026-05-01T00:00:00.000Z"),
          title: "定期検診",
          recordType: "EXAM",
          description: "良好"
        }
      ],
      medications: [],
      vaccinations: [],
      coreMetrics: [],
      labResults: []
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    const text = await response.text();
    expect(text).toContain("定期検診");
    expect(text).toContain("良好");
  });
});
