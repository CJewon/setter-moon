import Link from "next/link";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { routes } from "@/shared/constants/routes";
import { requireDashboardAccess } from "@/server/auth/session";
import { listStockMovementsForStore } from "@/server/inventory/service";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const movementPageSizeOptions = [10, 20, 50, 100];
const defaultMovementPageSize = 10;

const movementTypeLabel = {
  cancel_restore: "취소 복구",
  inbound: "입고",
  manual_adjust: "수동 조정",
  sale_deduction: "판매 차감"
} as const;

type StockMovementsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function StockMovementsPage({ searchParams }: StockMovementsPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const pagination = normalizePaginationParams(resolvedSearchParams, movementPageSizeOptions, defaultMovementPageSize);
  const movementPage = await listStockMovementsForStore(supabase, access.store.id, pagination);

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.inventory,
          label: "전체 재고로"
        }}
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="app-table responsive-card-table">
          <thead>
            <tr>
              <th>일시</th>
              <th>상품명</th>
              <th>옵션 조합</th>
              <th>유형</th>
              <th>수량</th>
              <th>변경 전/후</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {movementPage.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-sm text-slate-500">
                  아직 재고 변경 이력이 없습니다. 입고, 판매 차감, 취소 복구, 수동 조정 내역이 생기면 이곳에 표시됩니다.
                </td>
              </tr>
            ) : (
              movementPage.items.map((movement) => (
                <tr key={movement.id}>
                  <td data-label="일시">{new Date(movement.createdAt).toLocaleString("ko-KR")}</td>
                  <td className="font-semibold text-slate-950" data-label="상품명">
                    <Link href={routes.productDetail(movement.productId)} className="hover:text-blue-700">
                      {movement.productName}
                    </Link>
                  </td>
                  <td data-label="옵션 조합">{movement.variantName}</td>
                  <td data-label="유형">{movementTypeLabel[movement.type]}</td>
                  <td data-label="수량">{formatNumber(movement.quantity)}개</td>
                  <td data-label="변경 전/후">
                    {formatNumber(movement.beforeStock)}개 → {formatNumber(movement.afterStock)}개
                  </td>
                  <td data-label="메모">{movement.memo ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        basePath={routes.inventoryMovements}
        page={movementPage.page}
        pageSize={movementPage.pageSize}
        searchParams={{
          page: resolvedSearchParams.page,
          pageSize: resolvedSearchParams.pageSize
        }}
        totalCount={movementPage.totalCount}
        totalPages={movementPage.totalPages}
      />
    </>
  );
}
