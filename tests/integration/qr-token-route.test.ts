import { beforeEach, describe, expect, it, vi } from "vitest";

const { findPetMock, findUniqueMock, createMock, upsertMock } = vi.hoisted(() => ({
  findPetMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findPetMock
    },
    petEmergencyToken: {
      findUnique: findUniqueMock,
      create: createMock,
      upsert: upsertMock
    }
  }
}));

vi.mock("@/lib/security/emergency-token", () => ({
  generateEmergencyToken: () => "11111111-1111-4111-8111-111111111111"
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/qr-token/route";

describe("/api/pets/[petId]/qr-token", () => {
  const validPetId = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet does not exist", async () => {
    findPetMock.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(404);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns existing token on GET", async () => {
    findPetMock.mockResolvedValue({ id: validPetId });
    findUniqueMock.mockResolvedValue({
      token: "99999999-9999-4999-8999-999999999999"
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("99999999-9999-4999-8999-999999999999");
    expect(payload.data.publicUrl).toBe("/e/99999999-9999-4999-8999-999999999999");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates token on GET when missing", async () => {
    findPetMock.mockResolvedValue({ id: validPetId });
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
    findPetMock.mockResolvedValue({ id: validPetId });
    upsertMock.mockResolvedValue({
      token: "11111111-1111-4111-8111-111111111111"
    });

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.data.publicUrl).toBe("/e/11111111-1111-4111-8111-111111111111");
    expect(upsertMock).toHaveBeenCalledOnce();
  });
});
