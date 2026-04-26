import { describe, expect, it } from "vitest";
import { groupTimelineByDate } from "../../src/lib/services/medical-timeline";

describe("groupTimelineByDate", () => {
  it("groups records by date key", () => {
    const grouped = groupTimelineByDate([
      { id: "1", date: "2026-04-01", title: "A", description: "", recordType: "EXAM" },
      { id: "2", date: "2026-04-01", title: "B", description: "", recordType: "LAB" },
      { id: "3", date: "2026-03-30", title: "C", description: "", recordType: "OTHER" }
    ]);

    expect(grouped["2026-04-01"]).toHaveLength(2);
    expect(grouped["2026-03-30"]).toHaveLength(1);
  });

  it("returns empty object for empty timeline", () => {
    const grouped = groupTimelineByDate([]);
    expect(grouped).toEqual({});
  });
});
