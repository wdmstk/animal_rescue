import { describe, expect, it } from "vitest";
import { sortPetPhotos } from "../../src/lib/services/photo-gallery";

describe("sortPetPhotos", () => {
  it("sorts by sortOrder then createdAt", () => {
    const sorted = sortPetPhotos([
      { id: "3", photoUrl: "c", sortOrder: 1, createdAt: "2026-01-03T00:00:00.000Z" },
      { id: "1", photoUrl: "a", sortOrder: 0, createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "2", photoUrl: "b", sortOrder: 0, createdAt: "2026-01-01T00:00:00.000Z" }
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["2", "1", "3"]);
  });
});
