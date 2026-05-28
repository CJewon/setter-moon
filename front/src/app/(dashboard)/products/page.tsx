import Link from "next/link";
import { ProductListFilters } from "@/features/products/components/product-list-filters";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { requireDashboardAccess } from "@/server/auth/session";
import { listProductsForStore } from "@/server/products/service";
import { normalizePaginationParams } from "@/server/shared/pagination";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

const productPageSizeOptions = [20, 50];
const defaultProductPageSize = 20;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const pagination = normalizePaginationParams(resolvedSearchParams, productPageSizeOptions, defaultProductPageSize);
  const productPage = await listProductsForStore(supabase, access.store.id, pagination);

  return (
    <>
      <PageHeader
        title="상품"
        description="등록된 상품을 검색하고 옵션별 재고 상태를 확인합니다."
        action={{ href: routes.newProduct, label: "상품 등록" }}
      />
      <ProductListFilters />

      {productPage.items.length === 0 ? (
        <EmptyState
          title="아직 등록된 상품이 없습니다."
          description="첫 상품을 등록하고 옵션별 재고를 관리해보세요."
          action={
            <Link
              href="/products/new"
              className="inline-flex min-h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              상품 등록하기
            </Link>
          }
        />
      ) : (
        <>
          <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <table className="app-table">
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
                    <td>
                      <Link href={`/products/${product.id}`} className="font-semibold text-slate-950 hover:text-blue-700">
                        {product.name}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
                        {productStatusLabel[product.status]}
                      </StatusBadge>
                    </td>
                    <td>{formatNumber(product.variantCount)}개</td>
                    <td>{formatNumber(product.totalCurrentStock)}개</td>
                    <td>{formatNumber(product.base_price)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <PaginationControls
            basePath={routes.products}
            page={productPage.page}
            pageSize={productPage.pageSize}
            pageSizeOptions={productPageSizeOptions}
            searchParams={resolvedSearchParams}
            totalCount={productPage.totalCount}
            totalPages={productPage.totalPages}
          />
        </>
      )}
    </>
  );
}
