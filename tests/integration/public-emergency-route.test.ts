import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpcMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock
}));

import { GET } from "../../src/app/api/public/emergency/[token]/route";

describe("GET /api/public/emergency/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseServerClientMock.mockResolvedValue({
      rpc: rpcMock
    });
  });

  it("returns 400 for non-uuid token", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { token: "invalid-token" }
    });

    expect(response.status).toBe(400);
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("returns 404 when token has no matching data", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    const response = await GET(new Request("http://localhost"), {
      params: { token: "11111111-1111-4111-8111-111111111111" }
    });

    expect(response.status).toBe(404);
    expect(rpcMock).toHaveBeenCalledWith("get_public_emergency_by_token", {
      input_token: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns emergency payload for valid token", async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          pet_name: "Mugi",
          disease: "CKD",
          current_medications: "Renal meds",
          allergy: "None",
          vet_name: "City Vet",
          vet_phone: "03-0000-0000",
          emergency_contact_name: "Owner",
          emergency_contact_phone: "090-0000-0000"
        }
      ],
      error: null
    });

    const response = await GET(new Request("http://localhost"), {
      params: { token: "11111111-1111-4111-8111-111111111111" }
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toEqual({
      petName: "Mugi",
      disease: "CKD",
      medications: "Renal meds",
      allergy: "None",
      vetName: "City Vet",
      vetPhone: "03-0000-0000",
      emergencyContactName: "Owner",
      emergencyContactPhone: "090-0000-0000"
    });
  });
});
