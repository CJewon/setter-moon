"use client";

import Link from "next/link";
import type { Route } from "next";
import { OrderListFilters } from "@/features/orders/components/order-list-filters";
import { OrderListTable } from "@/features/orders/components/order-list-table";
import { useOrdersQuery } from "@/features/orders/hooks/use-order-queries";
import type { OrderSort } from "@/server/orders/service";
import type { OrderStatus } from "@/server/orders/types";
import { primaryActionClassName } from "@/shared/components/action-styles";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { orderStatusLabel } from "@/shared/constants/status-labels";

const orderTabs: Array<{ label: string; status?: OrderStatus }> = [
  { label: "전체" },
  { label: orderStatusLabel.received, status: "received" },
  { label: orderStatusLabel.ready_to_ship, status: "ready_to_ship" },
  { label: orderStatusLabel.shipping, status: "shipping" },
  { label: orderStatusLabel.delivered, status: "delivered" },
  { label: orderStatusLabel.cancelled, status: "cancelled" },
  { label: orderStatusLabel.hold, status: "hold" }
];

const orderPageSizeOptions = [10, 20, 50, 100];
const defaultOrderPageSize = 10;
const orderSortOptions: OrderSort[] = ["latest", "oldest"];

type OrderListPageClientProps = {
  searchParams: {
    customerKeyword?: string;
    fromDate?: string;
    keyword?: string;
    page?: string;
    pageSize?: string;
    productKeyword?: string;
    sort?: string;
    status?: string;
    toDate?: string;
  };
};

function getPageSize(value?: string) {
  const parsed = Number(value);

  return orderPageSizeOptions.includes(parsed) ? parsed : defaultOrderPageSize;
}

function getSelectedStatus(value?: string) {
  return orderTabs.some((tab) => tab.status === value) ? (value as OrderStatus) : undefined;
}

function getSort(value?: string) {
  return orderSortOptions.find((option) => option === value) ?? "latest";
}

export function OrderListPageClient({ searchParams }: OrderListPageClientProps) {
  const selectedStatus = getSelectedStatus(searchParams.status);
  const keyword = searchParams.keyword?.trim() ?? "";
  const customerKeyword = searchParams.customerKeyword?.trim() ?? "";
  const productKeyword = searchParams.productKeyword?.trim() ?? "";
  const fromDate = searchParams.fromDate?.trim() ?? "";
  const toDate = searchParams.toDate?.trim() ?? "";
  const sort = getSort(searchParams.sort);
  const pageSize = getPageSize(searchParams.pageSize);
  const orderPageQuery = useOrdersQuery({
    customerKeyword,
    fromDate,
    keyword,
    page: searchParams.page,
    pageSize,
    productKeyword,
    sort,
    status: selectedStatus,
    toDate
  });

  function getOrderTabHref(nextStatus?: OrderStatus) {
    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (customerKeyword) {
      params.set("customerKeyword", customerKeyword);
    }

    if (productKeyword) {
      params.set("productKeyword", productKeyword);
    }

    if (fromDate) {
      params.set("fromDate", fromDate);
    }

    if (toDate) {
      params.set("toDate", toDate);
    }

    if (nextStatus) {
      params.set("status", nextStatus);
    }

    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    params.set("sort", sort);

    return `/orders?${params.toString()}` as Route;
  }

  return (
    <>
      <OrderListFilters
        customerKeyword={customerKeyword}
        fromDate={fromDate}
        pageSize={pageSize}
        productKeyword={productKeyword}
        selectedStatus={selectedStatus}
        sort={sort}
        toDate={toDate}
      />
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {orderTabs.map((tab) => {
            const active = tab.status === selectedStatus || (!tab.status && !selectedStatus);

            return (
              <Link
                key={tab.label}
                href={getOrderTabHref(tab.status)}
                className={
                  active
                    ? "min-h-9 shrink-0 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                    : "min-h-9 shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <Link href={routes.newOrder} className={`${primaryActionClassName} w-full shrink-0 sm:w-auto`}>
          주문 등록
        </Link>
      </div>

      {orderPageQuery.isLoading ? <QueryLoadingState title="주문 목록을 불러오고 있습니다." /> : null}
      {orderPageQuery.isError ? <QueryErrorState title="주문 목록을 불러오지 못했습니다." /> : null}
      {orderPageQuery.data ? (
        <>
          <OrderListTable items={orderPageQuery.data.items} />
          <PaginationControls
            basePath={routes.orders}
            page={orderPageQuery.data.page}
            pageSize={orderPageQuery.data.pageSize}
            searchParams={{
              customerKeyword,
              page: searchParams.page,
              pageSize: searchParams.pageSize,
              fromDate,
              keyword,
              productKeyword,
              sort,
              status: selectedStatus,
              toDate
            }}
            totalCount={orderPageQuery.data.totalCount}
            totalPages={orderPageQuery.data.totalPages}
          />
        </>
      ) : null}
    </>
  );
}
