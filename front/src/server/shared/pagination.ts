import type { PaginationParams } from "@/shared/types/pagination";

const DEFAULT_PAGE = 1;

export function normalizePaginationParams(
  searchParams: { page?: string; pageSize?: string },
  pageSizeOptions: number[],
  defaultPageSize: number
): PaginationParams {
  const parsedPage = Number(searchParams.page);
  const parsedPageSize = Number(searchParams.pageSize);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
  const pageSize = pageSizeOptions.includes(parsedPageSize) ? parsedPageSize : defaultPageSize;

  return {
    page,
    pageSize
  };
}

export function getPaginationRange({ page, pageSize }: PaginationParams) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return {
    from,
    to
  };
}

export function getTotalPages(totalCount: number, pageSize: number) {
  return Math.max(Math.ceil(totalCount / pageSize), 1);
}

export function getVisibleItemRange({ page, pageSize }: PaginationParams, totalCount: number) {
  if (totalCount === 0) {
    return {
      from: 0,
      to: 0
    };
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return {
    from: Math.min(from, totalCount),
    to
  };
}
