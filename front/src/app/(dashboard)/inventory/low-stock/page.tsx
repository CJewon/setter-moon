import Link from "next/link";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { requireDashboardAccess } from "@/server/auth/session";
import { listLowStockItemsForStore } from "@/server/inventory/service";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const lowStockPageSizeOptions = [10, 20, 50, 100];
const defaultLowStockPageSize = 10;

type LowStockPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function LowStockPage({ searchParams }: LowStockPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const pagination = normalizePaginationParams(resolvedSearchParams, lowStockPageSizeOptions, defaultLowStockPageSize);
  const lowStockPage = await listLowStockItemsForStore(supabase, access.store.id, pagination);

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
              <th>상품명</th>
              <th>옵션 조합</th>
              <th>가용 재고</th>
              <th>안전 재고</th>
              <th>예약 수량</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {lowStockPage.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-sm text-slate-500">
                  현재 재고 부족 옵션 조합이 없습니다.
                </td>
              </tr>
            ) : (
              lowStockPage.items.map((item) => (
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
                    <StatusBadge tone={item.status === "out" ? "danger" : "warning"}>{item.status === "out" ? "품절" : "부족"}</StatusBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        basePath={routes.inventoryLowStock}
        page={lowStockPage.page}
        pageSize={lowStockPage.pageSize}
        searchParams={{
          page: resolvedSearchParams.page,
          pageSize: resolvedSearchParams.pageSize
        }}
        totalCount={lowStockPage.totalCount}
        totalPages={lowStockPage.totalPages}
      />
    </>
  );
}
