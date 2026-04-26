import { beforeEach, describe, expect, it, vi } from "vitest";

const { toDataUrlMock } = vi.hoisted(() => ({
  toDataUrlMock: vi.fn()
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: toDataUrlMock
  }
}));

import { GET } from "../../src/app/api/pets/[petId]/qr-image/route";

describe("GET /api/pets/[petId]/qr-image", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
    toDataUrlMock.mockResolvedValue("data:image/png;base64,mock");
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { petId: "sample-pet" }
    });

    expect(response.status).toBe(400);
    expect(toDataUrlMock).not.toHaveBeenCalled();
  });

  it("returns QR image data for valid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.publicUrl).toContain(`/e/${validPetId}`);
    expect(payload.data.image).toBe("data:image/png;base64,mock");
    expect(toDataUrlMock).toHaveBeenCalledOnce();
  });
});
