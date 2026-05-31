"use client";

import Link from "next/link";
import type { Route } from "next";
import { InventoryAdjustmentDialog } from "@/features/inventory/components/inventory-adjustment-dialog";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { useInventoryQuery } from "@/features/inventory/hooks/use-inventory-queries";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { formatNumber } from "@/shared/lib/format";
import type { InventoryStatus } from "@/server/inventory/service";

const inventoryPageSizeOptions = [10, 20, 50, 100];
const defaultInventoryPageSize = 10;
const inventoryStatuses = ["normal", "low", "out"] as const;
const inventoryStatusLabel: Record<InventoryStatus, string> = {
  low: "부족",
  normal: "정상",
  out: "품절"
};

type InventoryListPageClientProps = {
  searchParams: {
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  };
};

function getPageSize(value?: string) {
  const parsed = Number(value);

  return inventoryPageSizeOptions.includes(parsed) ? parsed : defaultInventoryPageSize;
}

function getSelectedStatus(value?: string) {
  return inventoryStatuses.find((status) => status === value);
}

function getInventoryStatusTone(status: InventoryStatus) {
  if (status === "out") {
    return "danger";
  }

  if (status === "low") {
    return "warning";
  }

  return "success";
}

function getFirstInventoryPageHref({
  keyword,
  pageSize,
  status
}: {
  keyword: string;
  pageSize: number;
  status?: InventoryStatus;
}) {
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

export function InventoryListPageClient({ searchParams }: InventoryListPageClientProps) {
  const keyword = searchParams.keyword?.trim() ?? "";
  const pageSize = getPageSize(searchParams.pageSize);
  const selectedStatus = getSelectedStatus(searchParams.status);
  const hasFilters = Boolean(keyword || selectedStatus);
  const inventoryPageQuery = useInventoryQuery({
    keyword,
    page: searchParams.page,
    pageSize,
    status: selectedStatus
  });
  const firstInventoryPageHref = getFirstInventoryPageHref({ keyword, pageSize, status: selectedStatus });

  return (
    <>
      <InventoryFilters keyword={keyword} pageSize={pageSize} selectedStatus={selectedStatus} />
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:mb-4 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <Link
          href={routes.inventoryLowStock}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          재고 부족 보기
        </Link>
        <Link
          href={routes.inventoryMovements}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          재고 이력 보기
        </Link>
      </div>

      {inventoryPageQuery.isLoading ? <QueryLoadingState title="재고 목록을 불러오고 있습니다." variant="table" /> : null}
      {inventoryPageQuery.isError ? <QueryErrorState title="재고 목록을 불러오지 못했습니다." /> : null}

      {inventoryPageQuery.data ? (
        inventoryPageQuery.data.items.length === 0 && inventoryPageQuery.data.totalCount > 0 ? (
          <EmptyState
            title="현재 페이지에 표시할 재고가 없습니다."
            description="목록 범위를 벗어났어요. 첫 페이지에서 다시 확인해 주세요."
            action={
              <Link href={firstInventoryPageHref} className={secondaryActionClassName}>
                첫 페이지로 이동
              </Link>
            }
          />
        ) : inventoryPageQuery.data.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "조건에 맞는 재고가 없습니다." : "아직 확인할 재고가 없습니다."}
            description={
              hasFilters
                ? "검색어나 재고상태 필터를 바꿔 다시 확인해 주세요."
                : "상품을 등록하면 옵션별 현재 재고, 예약 수량, 가용 재고를 여기에서 확인할 수 있어요."
            }
            action={
              hasFilters ? (
                <Link href={routes.inventory} className={secondaryActionClassName}>
                  전체 재고 보기
                </Link>
              ) : (
                <Link href={routes.newProduct} className={primaryActionClassName}>
                  상품 등록하기
                </Link>
              )
            }
          />
        ) : (
          <>
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="app-table responsive-card-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>옵션 조합</th>
                  <th>현재 재고</th>
                  <th>예약 수량</th>
                  <th>가용 재고</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {inventoryPageQuery.data.items.map((item) => (
                    <tr key={item.variantId}>
                      <td className="font-semibold text-slate-950" data-label="상품명">
                        <Link href={routes.productDetail(item.productId)} className="hover:text-blue-700">
                          {item.productName}
                        </Link>
                      </td>
                      <td data-label="옵션 조합">{item.variantName}</td>
                      <td data-label="현재 재고">{formatNumber(item.currentStock)}개</td>
                      <td data-label="예약 수량">{formatNumber(item.reservedQuantity)}개</td>
                      <td data-label="가용 재고">{formatNumber(item.availableStock)}개</td>
                      <td data-label="상태">
                        <StatusBadge tone={getInventoryStatusTone(item.status)}>{inventoryStatusLabel[item.status]}</StatusBadge>
                      </td>
                      <td data-label="작업">
                        <InventoryAdjustmentDialog item={item} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            basePath={routes.inventory}
            page={inventoryPageQuery.data.page}
            pageSize={inventoryPageQuery.data.pageSize}
            searchParams={{
              keyword,
              page: searchParams.page,
              pageSize: searchParams.pageSize,
              status: selectedStatus
            }}
            totalCount={inventoryPageQuery.data.totalCount}
            totalPages={inventoryPageQuery.data.totalPages}
          />
        </>
        )
      ) : null}
    </>
  );
}
