import Link from "next/link";
import type { Route } from "next";
import type { OrderStatus } from "@/server/orders/types";
import { OrderListFilters } from "@/features/orders/components/order-list-filters";
import { OrderListTable } from "@/features/orders/components/order-list-table";
import { listOrdersForStore } from "@/server/orders/service";
import type { OrderSort } from "@/server/orders/service";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { routes } from "@/shared/constants/routes";
import { orderStatusLabel } from "@/shared/constants/status-labels";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { createClient } from "@/shared/lib/supabase/server";

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

type OrdersPageProps = {
  searchParams: Promise<{
    customerKeyword?: string;
    fromDate?: string;
    keyword?: string;
    page?: string;
    pageSize?: string;
    productKeyword?: string;
    sort?: string;
    status?: OrderStatus;
    toDate?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const { status } = resolvedSearchParams;
  const selectedStatus = orderTabs.some((tab) => tab.status === status) ? status : undefined;
  const keyword = resolvedSearchParams.keyword?.trim() ?? "";
  const customerKeyword = resolvedSearchParams.customerKeyword?.trim() ?? "";
  const productKeyword = resolvedSearchParams.productKeyword?.trim() ?? "";
  const fromDate = resolvedSearchParams.fromDate?.trim() ?? "";
  const toDate = resolvedSearchParams.toDate?.trim() ?? "";
  const sort = orderSortOptions.find((option) => option === resolvedSearchParams.sort) ?? "latest";
  const pagination = normalizePaginationParams(resolvedSearchParams, orderPageSizeOptions, defaultOrderPageSize);
  const orderPage = await listOrdersForStore(
    supabase,
    access.store.id,
    {
      customerKeyword,
      fromDate,
      keyword,
      productKeyword,
      sort,
      status: selectedStatus,
      toDate
    },
    pagination
  );

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
    params.set("pageSize", String(pagination.pageSize));
    params.set("sort", sort);

    return `/orders?${params.toString()}` as Route;
  }

  return (
    <>
      <PageActionBar actions={[{ href: routes.newOrder, label: "주문 등록" }]} />
      <OrderListFilters
        customerKeyword={customerKeyword}
        fromDate={fromDate}
        pageSize={pagination.pageSize}
        productKeyword={productKeyword}
        selectedStatus={selectedStatus}
        sort={sort}
        toDate={toDate}
      />
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
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
      <OrderListTable items={orderPage.items} />
      <PaginationControls
        basePath={routes.orders}
        page={orderPage.page}
        pageSize={orderPage.pageSize}
        searchParams={{
          customerKeyword,
          page: resolvedSearchParams.page,
          pageSize: resolvedSearchParams.pageSize,
          fromDate,
          keyword,
          productKeyword,
          sort,
          status: selectedStatus,
          toDate
        }}
        totalCount={orderPage.totalCount}
        totalPages={orderPage.totalPages}
      />
    </>
  );
}
