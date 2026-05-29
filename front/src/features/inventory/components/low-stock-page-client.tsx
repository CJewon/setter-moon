"use client";

import Link from "next/link";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { formatNumber } from "@/shared/lib/format";
import { useLowStockQuery } from "@/features/inventory/hooks/use-inventory-queries";

type LowStockPageClientProps = {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
};

export function LowStockPageClient({ searchParams }: LowStockPageClientProps) {
  const lowStockPageQuery = useLowStockQuery(searchParams);

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.inventory,
          label: "전체 재고로"
        }}
      />
      {lowStockPageQuery.isLoading ? <QueryLoadingState title="재고 부족 목록을 불러오고 있습니다." variant="table" /> : null}
      {lowStockPageQuery.isError ? <QueryErrorState title="재고 부족 목록을 불러오지 못했습니다." /> : null}

      {lowStockPageQuery.data ? (
        <>
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="app-table responsive-card-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>옵션 조합</th>
                  <th>가용 재고</th>
                  <th>안전 재고</th>
                  <th>예약 수량</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {lowStockPageQuery.data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-sm text-slate-500">
                      현재 부족하거나 품절된 옵션 조합이 없습니다. 안전 재고 이하가 되면 이곳에 표시됩니다.
                    </td>
                  </tr>
                ) : (
                  lowStockPageQuery.data.items.map((item) => (
                    <tr key={item.variantId}>
                      <td className="font-semibold text-slate-950" data-label="상품명">
                        <Link href={routes.productDetail(item.productId)} className="hover:text-blue-700">
                          {item.productName}
                        </Link>
                      </td>
                      <td data-label="옵션 조합">{item.variantName}</td>
                      <td data-label="가용 재고">{formatNumber(item.availableStock)}개</td>
                      <td data-label="안전 재고">{formatNumber(item.safetyStock)}개</td>
                      <td data-label="예약 수량">{formatNumber(item.reservedQuantity)}개</td>
                      <td data-label="상태">
                        <StatusBadge tone={item.status === "out" ? "danger" : "warning"}>
                          {item.status === "out" ? "품절" : "부족"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            basePath={routes.inventoryLowStock}
            page={lowStockPageQuery.data.page}
            pageSize={lowStockPageQuery.data.pageSize}
            searchParams={{
              page: searchParams.page,
              pageSize: searchParams.pageSize
            }}
            totalCount={lowStockPageQuery.data.totalCount}
            totalPages={lowStockPageQuery.data.totalPages}
          />
        </>
      ) : null}
    </>
  );
}
