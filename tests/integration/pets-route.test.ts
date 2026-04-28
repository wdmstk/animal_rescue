import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser, requireHouseholdMember } from "@/lib/auth/pet-access";

const { findManyMock, createMock, householdMemberFindFirstMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn(),
  householdMemberFindFirstMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findMany: findManyMock,
      create: createMock
    },
    householdMember: {
      findFirst: householdMemberFindFirstMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/route";

describe("/api/pets", () => {
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);
  const requireHouseholdMemberMock = vi.mocked(requireHouseholdMember);

  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      userId: "22222222-2222-4222-8222-222222222222"
    });
    requireHouseholdMemberMock.mockResolvedValue(true);
    householdMemberFindFirstMock.mockResolvedValue({
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 401 on unauthenticated GET", async () => {
    requireAuthenticatedUserMock.mockResolvedValueOnce(NextResponse.json({ error: "認証が必要です" }, { status: 401 }));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns pets on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "pet-1" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        household: {
          members: {
            some: { userId: "22222222-2222-4222-8222-222222222222" }
          }
        }
      },
      include: {
        emergencyInfo: true,
        emergencyToken: true,
        photos: true
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("returns 400 on invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "invalid",
          name: "",
          species: "dog",
          sex: "UNKNOWN"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates pet on POST", async () => {
    createMock.mockResolvedValue({
      id: "pet-1",
      name: "モカ"
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "11111111-1111-4111-8111-111111111111",
          name: "モカ",
          species: "dog",
          breed: "トイプードル",
          sex: "FEMALE",
          birthday: "2020-03-10"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        householdId: "11111111-1111-4111-8111-111111111111",
        name: "モカ",
        species: "dog",
        breed: "トイプードル",
        sex: "FEMALE",
        birthday: new Date("2020-03-10")
      })
    });
  });

  it("creates pet on POST without householdId by resolving membership", async () => {
    createMock.mockResolvedValue({
      id: "pet-1",
      name: "モカ"
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          name: "モカ",
          species: "dog",
          sex: "FEMALE"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(householdMemberFindFirstMock).toHaveBeenCalledWith({
      where: { userId: "22222222-2222-4222-8222-222222222222" },
      select: { householdId: true },
      orderBy: { createdAt: "asc" }
    });
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        householdId: "11111111-1111-4111-8111-111111111111",
        name: "モカ"
      })
    });
  });

  it("returns 403 when household is not accessible on POST", async () => {
    requireHouseholdMemberMock.mockResolvedValueOnce(NextResponse.json({ error: "Forbidden" }, { status: 403 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "11111111-1111-4111-8111-111111111111",
          name: "モカ",
          species: "dog",
          sex: "FEMALE"
        })
      })
    );

    expect(response.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 when household membership is not found on POST without householdId", async () => {
    householdMemberFindFirstMock.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          name: "モカ",
          species: "dog",
          sex: "FEMALE"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(requireHouseholdMemberMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
