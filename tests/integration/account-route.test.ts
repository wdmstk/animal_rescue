import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, updateUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  updateUserMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock
    }
  })
}));

import { GET, PATCH } from "../../src/app/api/account/route";

describe("/api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns account payload", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "user@example.com",
          user_metadata: { display_name: "Taro" }
        }
      },
      error: null
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({
      userId: "u1",
      email: "user@example.com",
      displayName: "Taro"
    });
  });

  it("updates displayName and password", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    updateUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Hanako", password: "password123" })
      })
    );

    expect(response.status).toBe(200);
    expect(updateUserMock).toHaveBeenCalledWith({
      password: "password123",
      data: { display_name: "Hanako" }
    });
  });
});
