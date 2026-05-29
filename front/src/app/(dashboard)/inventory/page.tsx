import Link from "next/link";
import { InventoryAdjustmentDialog } from "@/features/inventory/components/inventory-adjustment-dialog";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { requireDashboardAccess } from "@/server/auth/session";
import { listInventoryItemsForStore, type InventoryStatus } from "@/server/inventory/service";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const inventoryPageSizeOptions = [10, 20, 50, 100];
const defaultInventoryPageSize = 10;
const inventoryStatuses = ["normal", "low", "out"] as const;
const inventoryStatusLabel: Record<InventoryStatus, string> = {
  low: "부족",
  normal: "정상",
  out: "품절"
};

function getInventoryStatusTone(status: InventoryStatus) {
  if (status === "out") {
    return "danger";
  }

  if (status === "low") {
    return "warning";
  }

  return "success";
}

type InventoryPageProps = {
  searchParams: Promise<{
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const pagination = normalizePaginationParams(resolvedSearchParams, inventoryPageSizeOptions, defaultInventoryPageSize);
  const keyword = resolvedSearchParams.keyword?.trim() ?? "";
  const selectedStatus = inventoryStatuses.find((status) => status === resolvedSearchParams.status);
  const inventoryPage = await listInventoryItemsForStore(supabase, access.store.id, pagination, {
    keyword,
    status: selectedStatus
  });

  return (
    <>
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
      <InventoryFilters keyword={keyword} pageSize={pagination.pageSize} selectedStatus={selectedStatus} />
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
            {inventoryPage.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-sm text-slate-500">
                  조건에 맞는 재고 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              inventoryPage.items.map((item) => (
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
        page={inventoryPage.page}
        pageSize={inventoryPage.pageSize}
        searchParams={{
          keyword,
          page: resolvedSearchParams.page,
          pageSize: resolvedSearchParams.pageSize,
          status: selectedStatus
        }}
        totalCount={inventoryPage.totalCount}
        totalPages={inventoryPage.totalPages}
      />
    </>
  );
}
