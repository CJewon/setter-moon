export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<TItem> = PaginationParams & {
  items: TItem[];
  totalCount: number;
  totalPages: number;
};
