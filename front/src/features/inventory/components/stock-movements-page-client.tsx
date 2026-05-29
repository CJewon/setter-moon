"use client";

import Link from "next/link";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { formatNumber } from "@/shared/lib/format";
import { useStockMovementsQuery } from "@/features/inventory/hooks/use-inventory-queries";

type StockMovementsPageClientProps = {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
};

const movementTypeLabel = {
  cancel_restore: "취소 복구",
  inbound: "입고",
  manual_adjust: "수동 조정",
  sale_deduction: "판매 차감"
} as const;

export function StockMovementsPageClient({ searchParams }: StockMovementsPageClientProps) {
  const movementPageQuery = useStockMovementsQuery(searchParams);

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.inventory,
          label: "전체 재고로"
        }}
      />
      {movementPageQuery.isLoading ? <QueryLoadingState title="재고 이력을 불러오고 있습니다." variant="table" /> : null}
      {movementPageQuery.isError ? <QueryErrorState title="재고 이력을 불러오지 못했습니다." /> : null}

      {movementPageQuery.data ? (
        <>
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
                {movementPageQuery.data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-sm text-slate-500">
                      아직 재고 변경 이력이 없습니다. 입고, 판매 차감, 취소 복구, 수동 조정 내역이 생기면 이곳에 표시됩니다.
                    </td>
                  </tr>
                ) : (
                  movementPageQuery.data.items.map((movement) => (
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
            page={movementPageQuery.data.page}
            pageSize={movementPageQuery.data.pageSize}
            searchParams={{
              page: searchParams.page,
              pageSize: searchParams.pageSize
            }}
            totalCount={movementPageQuery.data.totalCount}
            totalPages={movementPageQuery.data.totalPages}
          />
        </>
      ) : null}
    </>
  );
}
