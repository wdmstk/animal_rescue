import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";

const { findFirstMock, findUniqueMock, upsertMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  findUniqueMock: vi.fn(),
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdMember: {
      findFirst: findFirstMock
    },
    ownerProfile: {
      findUnique: findUniqueMock,
      upsert: upsertMock
    }
  }
}));

import { GET, PATCH } from "../../src/app/api/settings/owner-profile/route";

describe("/api/settings/owner-profile", () => {
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);

  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      userId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns default profile on GET when no row exists", async () => {
    findFirstMock
      .mockResolvedValueOnce({ householdId: "household-1" })
      .mockResolvedValueOnce({ userId: "11111111-1111-4111-8111-111111111111" });
    findUniqueMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        ownerUserId: "11111111-1111-4111-8111-111111111111",
        fullName: null,
        phone: null,
        email: null,
        postalCode: null,
        addressLine1: null,
        addressLine2: null,
        note: null
      }
    });
  });

  it("rejects PATCH by non-owner", async () => {
    findFirstMock
      .mockResolvedValueOnce({ householdId: "household-1" })
      .mockResolvedValueOnce({ userId: "22222222-2222-4222-8222-222222222222" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: "Taro" })
      })
    );

    expect(response.status).toBe(403);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("updates owner profile on PATCH", async () => {
    findFirstMock
      .mockResolvedValueOnce({ householdId: "household-1" })
      .mockResolvedValueOnce({ userId: "11111111-1111-4111-8111-111111111111" });
    upsertMock.mockResolvedValue({
      ownerUserId: "11111111-1111-4111-8111-111111111111",
      fullName: "山田 太郎",
      phone: "090-1234-5678",
      email: "owner@example.com",
      postalCode: "100-0001",
      addressLine1: "東京都千代田区",
      addressLine2: "1-1-1",
      note: "不在時はSMS希望"
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "山田 太郎",
          phone: "090-1234-5678",
          email: "owner@example.com",
          postalCode: "100-0001",
          addressLine1: "東京都千代田区",
          addressLine2: "1-1-1",
          note: "不在時はSMS希望"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { ownerUserId: "11111111-1111-4111-8111-111111111111" },
      update: {
        fullName: "山田 太郎",
        phone: "090-1234-5678",
        email: "owner@example.com",
        postalCode: "100-0001",
        addressLine1: "東京都千代田区",
        addressLine2: "1-1-1",
        note: "不在時はSMS希望"
      },
      create: {
        ownerUserId: "11111111-1111-4111-8111-111111111111",
        fullName: "山田 太郎",
        phone: "090-1234-5678",
        email: "owner@example.com",
        postalCode: "100-0001",
        addressLine1: "東京都千代田区",
        addressLine2: "1-1-1",
        note: "不在時はSMS希望"
      }
    });
  });

  it("returns 400 on invalid email", async () => {
    findFirstMock
      .mockResolvedValueOnce({ householdId: "household-1" })
      .mockResolvedValueOnce({ userId: "11111111-1111-4111-8111-111111111111" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" })
      })
    );

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 401 on unauthenticated GET", async () => {
    requireAuthenticatedUserMock.mockResolvedValueOnce(NextResponse.json({ error: "認証が必要です" }, { status: 401 }));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });
});
