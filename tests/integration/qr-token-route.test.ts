import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findUniqueMock, createMock, upsertMock, updateMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  upsertMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyToken: {
      findUnique: findUniqueMock,
      create: createMock,
      upsert: upsertMock,
      update: updateMock
    }
  }
}));

vi.mock("@/lib/security/emergency-token", () => ({
  generateEmergencyToken: () => "11111111-1111-4111-8111-111111111111"
}));

import { DELETE, GET, POST } from "../../src/app/api/pets/[petId]/qr-token/route";

describe("/api/pets/[petId]/qr-token", () => {
  const validPetId = "22222222-2222-4222-8222-222222222222";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid petId", async () => {
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet does not exist", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns existing token on GET", async () => {
    findUniqueMock.mockResolvedValue({
      token: "99999999-9999-4999-8999-999999999999",
      isActive: true
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("99999999-9999-4999-8999-999999999999");
    expect(payload.data.publicUrl).toBe("http://localhost/e/99999999-9999-4999-8999-999999999999");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("reactivates token on GET when existing token is inactive", async () => {
    findUniqueMock.mockResolvedValue({
      token: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      isActive: false
    });
    updateMock.mockResolvedValue({
      token: "11111111-1111-4111-8111-111111111111",
      isActive: true
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("11111111-1111-4111-8111-111111111111");
    expect(updateMock).toHaveBeenCalledOnce();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates token on GET when missing", async () => {
    findUniqueMock.mockResolvedValue(null);
    createMock.mockResolvedValue({
      token: "11111111-1111-4111-8111-111111111111"
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("11111111-1111-4111-8111-111111111111");
    expect(createMock).toHaveBeenCalledOnce();
  });

  it("returns regenerated token on POST", async () => {
    upsertMock.mockResolvedValue({
      token: "11111111-1111-4111-8111-111111111111"
    });

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.data.publicUrl).toBe("http://localhost/e/11111111-1111-4111-8111-111111111111");
    expect(upsertMock).toHaveBeenCalledOnce();
  });

  it("returns 404 on DELETE when token does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deactivates active token on DELETE", async () => {
    findUniqueMock.mockResolvedValue({
      token: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      isActive: true
    });
    updateMock.mockResolvedValue({
      token: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      isActive: false
    });

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(payload.data.publicUrl).toBe("http://localhost/e/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(payload.data.isActive).toBe(false);
    expect(updateMock).toHaveBeenCalledOnce();
  });

  it("returns existing inactive token on DELETE", async () => {
    findUniqueMock.mockResolvedValue({
      token: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      isActive: false
    });

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(payload.data.isActive).toBe(false);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
