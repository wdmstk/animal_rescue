import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyToken: {
      findUnique: vi.fn()
    }
  }
}));

import { GET } from "../../../src/app/api/public/emergency/[token]/route";

describe("GET /api/public/emergency/[token]", () => {
  it("returns 400 for non-uuid token", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { token: "invalid-token" }
    });

    expect(response.status).toBe(400);
  });
});
