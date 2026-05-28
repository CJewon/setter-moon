import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getVisibleItemRange } from "@/server/shared/pagination";
import type { PaginationParams } from "@/shared/types/pagination";
import { cn } from "@/shared/utils/cn";

type PaginationControlsProps = PaginationParams & {
  basePath: string;
  pageSizeOptions: number[];
  searchParams?: Record<string, string | undefined>;
  totalCount: number;
  totalPages: number;
};

function getPageNumbers(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function PaginationControls({
  basePath,
  page,
  pageSize,
  pageSizeOptions,
  searchParams = {},
  totalCount,
  totalPages
}: PaginationControlsProps) {
  const itemRange = getVisibleItemRange({ page, pageSize }, totalCount);
  const pageNumbers = getPageNumbers(page, totalPages);

  function getHref(nextPage: number, nextPageSize = pageSize) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));

    return `${basePath}?${params.toString()}` as Route;
  }

  if (totalCount === 0) {
    return null;
  }

  return (
    <nav
      className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm lg:flex-row lg:items-center lg:justify-between"
      aria-label="목록 페이지 이동"
    >
      <div className="font-medium">
        총 <span className="text-slate-950">{totalCount.toLocaleString("ko-KR")}</span>건 중{" "}
        <span className="text-slate-950">
          {itemRange.from.toLocaleString("ko-KR")}-{itemRange.to.toLocaleString("ko-KR")}
        </span>
        건 표시
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-slate-500">페이지당</span>
        {pageSizeOptions.map((option) => (
          <Link
            key={option}
            href={getHref(1, option)}
            className={cn(
              "inline-flex min-h-8 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-semibold transition",
              option === pageSize
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            {option}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={getHref(Math.max(page - 1, 1))}
          aria-disabled={page <= 1}
          className={cn(
            "inline-flex min-h-9 items-center gap-1 rounded-md border px-3 font-semibold transition",
            page <= 1
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
          )}
        >
          <ChevronLeft aria-hidden size={16} />
          이전
        </Link>

        {pageNumbers.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={getHref(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            className={cn(
              "hidden min-h-9 min-w-9 items-center justify-center rounded-md border font-semibold transition sm:inline-flex",
              pageNumber === page
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            )}
          >
            {pageNumber}
          </Link>
        ))}

        <span className="inline-flex min-h-9 items-center px-1 font-semibold text-slate-500 sm:hidden">
          {page} / {totalPages}
        </span>

        <Link
          href={getHref(Math.min(page + 1, totalPages))}
          aria-disabled={page >= totalPages}
          className={cn(
            "inline-flex min-h-9 items-center gap-1 rounded-md border px-3 font-semibold transition",
            page >= totalPages
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
          )}
        >
          다음
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </nav>
  );
}
