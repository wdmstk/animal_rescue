import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";

const {
  findUniqueMock,
  updateMock,
  deleteMock,
  listMock,
  removeMock,
  fromMock,
  storageMock,
  createSupabaseServiceRoleClientMock
} = vi.hoisted(() => {
  const list = vi.fn();
  const remove = vi.fn();
  const from = vi.fn(() => ({ list, remove }));
  const storage = { from };
  const createClient = vi.fn(() => ({ storage }));

  return {
    findUniqueMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
    listMock: list,
    removeMock: remove,
    fromMock: from,
    storageMock: storage,
    createSupabaseServiceRoleClientMock: createClient
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findUniqueMock,
      update: updateMock,
      delete: deleteMock
    }
  }
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock
}));

import { DELETE, GET, PATCH } from "../../src/app/api/pets/[petId]/route";

describe("GET /api/pets/[petId]", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      userId: "22222222-2222-4222-8222-222222222222"
    });
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
    listMock.mockResolvedValue({ data: [], error: null });
    removeMock.mockResolvedValue({ error: null });
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    requireAuthenticatedUserMock.mockResolvedValueOnce(NextResponse.json({ error: "認証が必要です" }, { status: 401 }));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is outside ownership boundary", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns pet detail on success", async () => {
    findUniqueMock.mockResolvedValue({
      id: validPetId,
      name: "モカ"
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(findUniqueMock).toHaveBeenCalled();
  });

  it("returns 400 on invalid payload for PATCH", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "",
          weightKg: 0
        })
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates pet on PATCH", async () => {
    updateMock.mockResolvedValue({
      id: validPetId,
      name: "モカ"
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "モカ",
          birthday: "2020-03-10"
        })
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: validPetId },
      data: expect.objectContaining({
        name: "モカ",
        birthday: new Date("2020-03-10")
      })
    });
  });

  it("deletes pet and returns 200", async () => {
    deleteMock.mockResolvedValue({ id: validPetId });

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: validPetId } });
    expect(fromMock).toHaveBeenCalledWith("pet-photos");
    expect(listMock).toHaveBeenCalledWith(`pets/${validPetId}`, { limit: 1000 });
  });

  it("returns 404 on delete when pet access denied", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
