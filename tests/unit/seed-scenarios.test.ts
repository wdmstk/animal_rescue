import { describe, expect, it, vi } from "vitest";

import { SEED_IMAGE_URLS, SEED_PREFIX, collectSeedTargetIds, isSeedTagged, resetSeedData } from "@/lib/testing/seed-scenarios";

describe("seed scenario helpers", () => {
  it("recognizes seed-tagged values with case-insensitive prefix", () => {
    expect(SEED_PREFIX).toBe("seed:");
    expect(isSeedTagged("seed:alpha")).toBe(true);
    expect(isSeedTagged("SEED:beta")).toBe(true);
    expect(isSeedTagged(" seed:gamma ")).toBe(true);
    expect(isSeedTagged("prod:delta")).toBe(false);
    expect(isSeedTagged(null)).toBe(false);
    expect(isSeedTagged(undefined)).toBe(false);
  });

  it("collects only fixed seed IDs as deletion targets", async () => {
    const target = await collectSeedTargetIds({} as never);
    expect(target.householdIds).toEqual([
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002"
    ]);
    expect(target.petIds).toEqual([
      "30000000-0000-4000-8000-000000000001",
      "30000000-0000-4000-8000-000000000002",
      "30000000-0000-4000-8000-000000000003"
    ]);
  });

  it("reset deletes only seed-scoped records", async () => {
    const transactionMock = vi.fn(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));

    const prisma = {
      household: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      pet: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      petPhoto: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petEmergencyInfo: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petMedicalRecord: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petMedication: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petVaccination: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petEmergencyToken: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petCoreMetricEntry: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petLabResultEntry: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      petHealthExtensionEntry: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      householdInviteCode: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      householdMember: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      $transaction: transactionMock
    };

    const target = await resetSeedData(prisma as never);

    expect(target.householdIds).toEqual([
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002"
    ]);
    expect(target.petIds).toEqual([
      "30000000-0000-4000-8000-000000000001",
      "30000000-0000-4000-8000-000000000002",
      "30000000-0000-4000-8000-000000000003"
    ]);
    expect(prisma.pet.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [
            "30000000-0000-4000-8000-000000000001",
            "30000000-0000-4000-8000-000000000002",
            "30000000-0000-4000-8000-000000000003"
          ]
        }
      }
    });
    expect(prisma.householdMember.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [
            "10000000-0000-4000-8000-000000000011",
            "10000000-0000-4000-8000-000000000012"
          ]
        }
      }
    });
  });

  it("uses only allowed hosts for seed image URLs", () => {
    const urls = Object.values(SEED_IMAGE_URLS);
    expect(urls.length).toBeGreaterThan(0);

    for (const value of urls) {
      const url = new URL(value);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("images.unsplash.com");
    }
  });
});
