import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsertMock } = vi.hoisted(() => ({
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyToken: {
      upsert: upsertMock
    }
  }
}));

vi.mock("@/lib/security/emergency-token", () => ({
  generateEmergencyToken: () => "11111111-1111-4111-8111-111111111111"
}));

import { POST } from "../../src/app/api/pets/[petId]/qr-token/route";

describe("POST /api/pets/[petId]/qr-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns regenerated token", async () => {
    upsertMock.mockResolvedValue({
      token: "11111111-1111-4111-8111-111111111111"
    });

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: { petId: "pet-1" }
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.token).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.data.publicUrl).toBe("/e/11111111-1111-4111-8111-111111111111");
    expect(upsertMock).toHaveBeenCalledOnce();
  });
});
