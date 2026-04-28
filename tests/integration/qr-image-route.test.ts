import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { toDataUrlMock, findTokenMock, createTokenMock, updateTokenMock } = vi.hoisted(() => ({
  toDataUrlMock: vi.fn(),
  findTokenMock: vi.fn(),
  createTokenMock: vi.fn(),
  updateTokenMock: vi.fn()
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: toDataUrlMock
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyToken: {
      findUnique: findTokenMock,
      create: createTokenMock,
      update: updateTokenMock
    }
  }
}));

vi.mock("@/lib/security/emergency-token", () => ({
  generateEmergencyToken: () => "33333333-3333-4333-8333-333333333333"
}));

import { GET } from "../../src/app/api/pets/[petId]/qr-image/route";

describe("GET /api/pets/[petId]/qr-image", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    toDataUrlMock.mockResolvedValue("data:image/png;base64,mock");
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(toDataUrlMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet does not exist", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(toDataUrlMock).not.toHaveBeenCalled();
  });

  it("returns QR image data with existing token", async () => {
    findTokenMock.mockResolvedValue({
      token: "99999999-9999-4999-8999-999999999999",
      isActive: true
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.publicUrl).toContain("/e/99999999-9999-4999-8999-999999999999");
    expect(createTokenMock).not.toHaveBeenCalled();
    expect(toDataUrlMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/e\/99999999-9999-4999-8999-999999999999$/),
      expect.any(Object)
    );
  });

  it("creates token when missing and returns QR image", async () => {
    findTokenMock.mockResolvedValue(null);
    createTokenMock.mockResolvedValue({
      token: "33333333-3333-4333-8333-333333333333"
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.publicUrl).toContain("/e/33333333-3333-4333-8333-333333333333");
    expect(payload.data.image).toBe("data:image/png;base64,mock");
    expect(toDataUrlMock).toHaveBeenCalledOnce();
    expect(createTokenMock).toHaveBeenCalledOnce();
  });

  it("reactivates token when existing token is inactive", async () => {
    findTokenMock.mockResolvedValue({
      token: "99999999-9999-4999-8999-999999999999",
      isActive: false
    });
    updateTokenMock.mockResolvedValue({
      token: "33333333-3333-4333-8333-333333333333"
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.publicUrl).toContain("/e/33333333-3333-4333-8333-333333333333");
    expect(updateTokenMock).toHaveBeenCalledOnce();
    expect(createTokenMock).not.toHaveBeenCalled();
  });
});
