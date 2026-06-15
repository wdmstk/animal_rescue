import { describe, expect, it } from "vitest";
import { normalizeExtractedResult } from "@/lib/services/medical-document-ocr";

describe("medical-document-ocr", () => {
  it("normalizes a date and clinic name", () => {
    const result = normalizeExtractedResult("2026/05/01\nどうぶつ病院\nALT: 52");

    expect(result.examinedOn).toBe("2026-05-01");
    expect(result.hospitalName).toBe("どうぶつ病院");
    expect(result.candidates).toEqual([{ key: "ALT", value: "52" }]);
  });

  it("returns fallback values for empty text", () => {
    const result = normalizeExtractedResult("");

    expect(result.examinedOn).toBeNull();
    expect(result.hospitalName).toBeNull();
    expect(result.summary.length).toBeGreaterThan(0);
  });
});
