import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSignedUploadUrlMock, getPublicUrlMock, fromMock } = vi.hoisted(() => ({
  createSignedUploadUrlMock: vi.fn(),
  getPublicUrlMock: vi.fn(),
  fromMock: vi.fn()
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceRoleClient: () => ({
    storage: {
      from: fromMock
    }
  })
}));

import { POST } from "../../src/app/api/pets/[petId]/photos/upload-url/route";

describe("POST /api/pets/[petId]/photos/upload-url", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      createSignedUploadUrl: createSignedUploadUrlMock,
      getPublicUrl: getPublicUrlMock
    });
  });

  it("returns 400 when content type is not an image", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fileName: "report.pdf",
          contentType: "application/pdf"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it("returns 400 when petId is invalid", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fileName: "file.jpg",
          contentType: "image/jpeg"
        })
      }),
      { params: Promise.resolve({ petId: "pet-1" }) }
    );

    expect(response.status).toBe(400);
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it("returns signed upload url and public url", async () => {
    createSignedUploadUrlMock.mockResolvedValue({
      data: { signedUrl: "https://example.supabase.co/upload/sign-url" },
      error: null
    });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/pet-photos/pets/pet-1/file.jpg" }
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fileName: "file.jpg",
          contentType: "image/jpeg"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("pet-photos");
    expect(createSignedUploadUrlMock).toHaveBeenCalledOnce();

    const payload = await response.json();
    expect(payload.data.signedUrl).toBe("https://example.supabase.co/upload/sign-url");
    expect(payload.data.publicUrl).toContain("/storage/v1/object/public/pet-photos/");
  });
});
