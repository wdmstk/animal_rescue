import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { NextResponse } from "next/server";

// Supabase クライアントのモック
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  })
}));

import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const makeSupabaseMock = (email: string | null) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: email ? { id: "admin-id", email } : null },
      error: email ? null : new Error("no user")
    })
  }
});

describe("requireAdminUserForApi", () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = "admin@example.com,ops@example.com";
  });

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalEnv;
  });

  it("should return admin user when email is in ADMIN_EMAILS", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      makeSupabaseMock("admin@example.com") as never
    );

    const result = await requireAdminUserForApi();
    expect(result).toEqual({ id: "admin-id", email: "admin@example.com" });
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      makeSupabaseMock(null) as never
    );

    const result = await requireAdminUserForApi();
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(401);
  });

  it("should return 403 when authenticated but not admin", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      makeSupabaseMock("regular@example.com") as never
    );

    const result = await requireAdminUserForApi();
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(403);
  });

  it("should allow multiple admin emails", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      makeSupabaseMock("ops@example.com") as never
    );

    const result = await requireAdminUserForApi();
    expect(result).toEqual({ id: "admin-id", email: "ops@example.com" });
  });
});
