const { postDate, isoDate, limit } = require("../src/filters");

describe("postDate", () => {
  test("formats a Date object as human-readable string", () => {
    expect(postDate(new Date("2026-05-07T00:00:00Z"))).toBe("May 7, 2026");
  });

  test("formats an ISO date string", () => {
    expect(postDate("2026-01-01T00:00:00Z")).toBe("January 1, 2026");
  });
});

describe("isoDate", () => {
  test("returns ISO 8601 string", () => {
    expect(isoDate(new Date("2026-05-07T00:00:00Z"))).toBe("2026-05-07T00:00:00.000Z");
  });

  test("accepts a date string", () => {
    expect(isoDate("2026-05-07T00:00:00Z")).toBe("2026-05-07T00:00:00.000Z");
  });
});

describe("limit", () => {
  test("returns first N items", () => {
    expect(limit([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
  });

  test("returns all items when N exceeds array length", () => {
    expect(limit([1, 2], 10)).toEqual([1, 2]);
  });

  test("returns empty array for empty input", () => {
    expect(limit([], 5)).toEqual([]);
  });

  test("returns empty array when N is 0", () => {
    expect(limit([1, 2, 3], 0)).toEqual([]);
  });
});
