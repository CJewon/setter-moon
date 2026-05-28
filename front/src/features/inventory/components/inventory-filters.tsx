"use client";

import { Search } from "lucide-react";
import type { Route } from "next";
import { FilterDropdown } from "@/shared/components/filter-dropdown";
import { routes } from "@/shared/constants/routes";

const stockStatusOptions = [
  { label: "전체 재고상태", value: "" },
  { label: "정상", value: "normal" },
  { label: "부족", value: "low" },
  { label: "품절", value: "out" }
];

type InventoryFiltersProps = {
  keyword: string;
  pageSize: number;
  selectedStatus?: string;
};

export function InventoryFilters({ keyword, pageSize, selectedStatus = "" }: InventoryFiltersProps) {
  function getStatusHref(status: string) {
    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (status) {
      params.set("status", status);
    }

    params.set("page", "1");
    params.set("pageSize", String(pageSize));

    return `${routes.inventory}?${params.toString()}` as Route;
  }

  return (
    <div className="mb-3 grid gap-2.5 rounded-md border border-slate-200 bg-white/80 p-2.5 shadow-sm sm:mb-4 sm:p-3 md:grid-cols-[1fr_190px]">
      <form action={routes.inventory} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value={pageSize} />
        {selectedStatus ? <input type="hidden" name="status" value={selectedStatus} /> : null}
        <label className="relative block">
          <span className="sr-only">상품명 또는 옵션 조합 검색</span>
          <Search aria-hidden size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="keyword"
            className="min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 pl-10 text-sm outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            defaultValue={keyword}
            placeholder="상품명 또는 옵션 조합 검색"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          검색
        </button>
      </form>
      <FilterDropdown
        ariaLabel="재고상태 필터"
        getOptionHref={getStatusHref}
        options={stockStatusOptions}
        selectedValue={selectedStatus}
      />
    </div>
  );
}
