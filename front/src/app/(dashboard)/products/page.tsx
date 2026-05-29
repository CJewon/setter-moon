import Link from "next/link";
import { ProductListFilters } from "@/features/products/components/product-list-filters";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { requireDashboardAccess } from "@/server/auth/session";
import { listProductsForStore } from "@/server/products/service";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const productPageSizeOptions = [10, 20, 50];
const defaultProductPageSize = 10;
const productStatuses = ["active", "sold_out", "hidden"] as const;

type ProductsPageProps = {
  searchParams: Promise<{
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const pagination = normalizePaginationParams(resolvedSearchParams, productPageSizeOptions, defaultProductPageSize);
  const keyword = resolvedSearchParams.keyword?.trim() ?? "";
  const selectedStatus = productStatuses.find((status) => status === resolvedSearchParams.status);
  const productPage = await listProductsForStore(supabase, access.store.id, pagination, {
    keyword,
    status: selectedStatus
  });
  const hasFilters = Boolean(keyword || selectedStatus);

  return (
    <>
      <ProductListFilters keyword={keyword} pageSize={pagination.pageSize} selectedStatus={selectedStatus} />

      {productPage.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "조건에 맞는 상품이 없습니다." : "아직 등록된 상품이 없습니다."}
          description={hasFilters ? "검색어나 판매상태를 바꿔 다시 확인해 주세요." : "첫 상품을 등록하고 옵션별 재고를 관리해보세요."}
          action={
            hasFilters ? (
              <Link
                href={routes.products}
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                전체 상품 보기
              </Link>
            ) : (
              <Link
                href="/products/new"
                className="inline-flex min-h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                상품 등록하기
              </Link>
            )
          }
        />
      ) : (
        <>
          <section className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="app-table responsive-card-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>판매 상태</th>
                  <th>옵션 조합</th>
                  <th>현재 재고</th>
                  <th>기본 판매가</th>
                </tr>
              </thead>
              <tbody>
                {productPage.items.map((product) => (
                  <tr key={product.id}>
                    <td data-label="상품명">
                      <Link href={`/products/${product.id}`} className="font-semibold text-slate-950 hover:text-blue-700">
                        {product.name}
                      </Link>
                    </td>
                    <td data-label="판매 상태">
                      <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
                        {productStatusLabel[product.status]}
                      </StatusBadge>
                    </td>
                    <td data-label="옵션 조합">{formatNumber(product.variantCount)}개</td>
                    <td data-label="현재 재고">{formatNumber(product.totalCurrentStock)}개</td>
                    <td data-label="기본 판매가">{formatNumber(product.base_price)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <PaginationControls
            basePath={routes.products}
            page={productPage.page}
            pageSize={productPage.pageSize}
            searchParams={{
              keyword,
              page: resolvedSearchParams.page,
              pageSize: resolvedSearchParams.pageSize,
              status: selectedStatus
            }}
            totalCount={productPage.totalCount}
            totalPages={productPage.totalPages}
          />
        </>
      )}
    </>
  );
}
