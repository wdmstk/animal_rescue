import { describe, expect, it } from "vitest";
import { z } from "zod";

const flexibleDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  });

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  isPublished: z.boolean().optional().default(false),
  publishedAt: flexibleDateSchema,
  expiresAt: flexibleDateSchema
});

describe("Admin announcements datetime schema validation", () => {
  it("validates datetime-local format without Z suffix", () => {
    const payload = {
      title: "新機能のお知らせ",
      body: "本文テスト",
      isPublished: true,
      expiresAt: "2026-12-31T23:59"
    };

    const parsed = createSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(typeof parsed.data.expiresAt).toBe("string");
      expect(parsed.data.expiresAt).toMatch(/^2026-12-31T/);
    }
  });

  it("handles empty/null expiresAt correctly", () => {
    const payload = {
      title: "下書きお知らせ",
      body: "本文",
      expiresAt: ""
    };

    const parsed = createSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.expiresAt).toBeNull();
    }
  });
});
