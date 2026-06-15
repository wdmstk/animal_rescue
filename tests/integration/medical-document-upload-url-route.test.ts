import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSignedUploadUrlMock, getPublicUrlMock, fromMock, createSupabaseServiceRoleClientMock } = vi.hoisted(() => {
  const createSignedUploadUrl = vi.fn();
  const getPublicUrl = vi.fn();
  const from = vi.fn(() => ({ createSignedUploadUrl, getPublicUrl }));
  const createClient = vi.fn(() => ({ storage: { from } }));

  return {
    createSignedUploadUrlMock: createSignedUploadUrl,
    getPublicUrlMock: getPublicUrl,
    fromMock: from,
    createSupabaseServiceRoleClientMock: createClient
  };
});

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock
}));

import { POST } from "../../src/app/api/pets/[petId]/medical-documents/upload-url/route";

describe("POST /api/pets/[petId]/medical-documents/upload-url", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid petId", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: "a.jpg", contentType: "image/jpeg" })
      }),
      { params: Promise.resolve({ petId: "invalid" }) }
    );

    expect(response.status).toBe(400);
  });

  it("returns signed url", async () => {
    createSignedUploadUrlMock.mockResolvedValue({ data: { signedUrl: "https://signed-upload" }, error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: "https://example.com/public.jpg" } });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: "a.jpg", contentType: "image/jpeg" })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("pet-photos");
    expect(createSignedUploadUrlMock).toHaveBeenCalled();
  });
});
