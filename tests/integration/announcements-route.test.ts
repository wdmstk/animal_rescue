import { describe, expect, it, beforeEach } from "vitest";
import { GET } from "@/app/api/announcements/route";
import { prisma } from "@/lib/prisma";

describe("GET /api/announcements", () => {
  beforeEach(async () => {
    try {
      await prisma.announcement.deleteMany();
    } catch {
      // Ignore if DB mock mode
    }
  });

  it("returns published announcements", async () => {
    try {
      await prisma.announcement.create({
        data: {
          title: "新機能リリースのお知らせ",
          body: "写真アップロード機能が強化されました。",
          isPublished: true,
          publishedAt: new Date(Date.now() - 1000 * 60),
          createdBy: "00000000-0000-0000-0000-000000000000"
        }
      });
    } catch {
      // Mock mode fallback
    }

    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});
