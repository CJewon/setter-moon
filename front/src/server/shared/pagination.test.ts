import { describe, expect, it } from "@jest/globals";
import { getPaginationRange, getTotalPages, getVisibleItemRange, normalizePaginationParams } from "@/server/shared/pagination";

describe("pagination helpers", () => {
  it("normalizes invalid page and pageSize values", () => {
    expect(
      normalizePaginationParams(
        {
          page: "-2",
          pageSize: "999"
        },
        [20, 50],
        20
      )
    ).toEqual({
      page: 1,
      pageSize: 20
    });
  });

  it("uses allowed pageSize values", () => {
    expect(
      normalizePaginationParams(
        {
          page: "3",
          pageSize: "50"
        },
        [20, 50],
        20
      )
    ).toEqual({
      page: 3,
      pageSize: 50
    });
  });

  it("calculates database range and visible item range", () => {
    expect(getPaginationRange({ page: 2, pageSize: 20 })).toEqual({
      from: 20,
      to: 39
    });
    expect(getVisibleItemRange({ page: 2, pageSize: 20 }, 35)).toEqual({
      from: 21,
      to: 35
    });
    expect(getVisibleItemRange({ page: 1, pageSize: 20 }, 0)).toEqual({
      from: 0,
      to: 0
    });
  });

  it("keeps total pages at least one", () => {
    expect(getTotalPages(0, 20)).toBe(1);
    expect(getTotalPages(41, 20)).toBe(3);
  });
});
