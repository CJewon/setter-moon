"use client";

import { Search } from "lucide-react";
import { FilterDropdown } from "@/shared/components/filter-dropdown";

const categoryOptions = [
  { label: "전체 카테고리", value: "" }
];

const statusOptions = [
  { label: "전체 판매상태", value: "" },
  { label: "판매중", value: "active" },
  { label: "품절", value: "sold_out" },
  { label: "숨김", value: "hidden" }
];

export function ProductListFilters() {
  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm md:grid-cols-[1fr_190px_190px]">
      <label className="relative block">
        <span className="sr-only">상품명 검색</span>
        <Search aria-hidden size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pl-10 text-sm outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="상품명 검색"
        />
      </label>
      <FilterDropdown ariaLabel="카테고리 필터" options={categoryOptions} />
      <FilterDropdown ariaLabel="판매상태 필터" options={statusOptions} />
    </div>
  );
}
