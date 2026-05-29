"use client";

import Link from "next/link";
import { InventoryAdjustmentDialog } from "@/features/inventory/components/inventory-adjustment-dialog";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { useInventoryQuery } from "@/features/inventory/hooks/use-inventory-queries";
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

export function InventoryListPageClient({ searchParams }: InventoryListPageClientProps) {
  const keyword = searchParams.keyword?.trim() ?? "";
  const pageSize = getPageSize(searchParams.pageSize);
  const selectedStatus = getSelectedStatus(searchParams.status);
  const inventoryPageQuery = useInventoryQuery({
    keyword,
    page: searchParams.page,
    pageSize,
    status: selectedStatus
  });

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

      {inventoryPageQuery.isLoading ? <QueryLoadingState title="재고 목록을 불러오고 있습니다." /> : null}
      {inventoryPageQuery.isError ? <QueryErrorState title="재고 목록을 불러오지 못했습니다." /> : null}

      {inventoryPageQuery.data ? (
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
                {inventoryPageQuery.data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-sm text-slate-500">
                      조건에 맞는 재고 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  inventoryPageQuery.data.items.map((item) => (
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
                  ))
                )}
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
      ) : null}
    </>
  );
}
