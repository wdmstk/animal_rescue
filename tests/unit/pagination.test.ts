import { describe, it, expect } from "vitest";
import { buildPaginatedResponse, paginationQuerySchema } from "@/lib/pagination";

describe("pagination utility", () => {
  it("parses valid pagination query parameters", () => {
    const parsed = paginationQuerySchema.safeParse({
      limit: "10",
      cursor: "11111111-1111-4111-a111-111111111111"
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.limit).toBe(10);
      expect(parsed.data.cursor).toBe("11111111-1111-4111-a111-111111111111");
    }
  });

  it("applies default limit when missing", () => {
    const parsed = paginationQuerySchema.safeParse({});

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.limit).toBe(20);
      expect(parsed.data.cursor).toBeUndefined();
    }
  });

  it("builds paginated response correctly when there are more items", () => {
    const items = [
      { id: "id-1", name: "item 1" },
      { id: "id-2", name: "item 2" },
      { id: "id-3", name: "item 3" }
    ];

    const result = buildPaginatedResponse(items, 2);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe("id-1");
    expect(result.data[1].id).toBe("id-2");
    expect(result.pagination.hasMore).toBe(true);
    expect(result.pagination.nextCursor).toBe("id-2");
  });

  it("builds paginated response correctly when there are no more items", () => {
    const items = [
      { id: "id-1", name: "item 1" },
      { id: "id-2", name: "item 2" }
    ];

    const result = buildPaginatedResponse(items, 5);

    expect(result.data).toHaveLength(2);
    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.nextCursor).toBeNull();
  });
});
