"use client";

import Link from "next/link";
import { ProductListFilters } from "@/features/products/components/product-list-filters";
import { useProductsQuery } from "@/features/products/hooks/use-product-queries";
import { EmptyState } from "@/shared/components/empty-state";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { PaginationControls } from "@/shared/components/pagination-controls";
import { StatusBadge } from "@/shared/components/status-badge";
import { primaryActionClassName } from "@/shared/components/action-styles";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";
import { productStatusLabel } from "@/shared/constants/status-labels";
import type { ProductStatus } from "@/shared/types/domain";
import { formatNumber } from "@/shared/lib/format";

const productPageSizeOptions = [10, 20, 50];
const defaultProductPageSize = 10;
const productStatuses = ["active", "sold_out", "hidden"] as const;

type ProductListPageClientProps = {
  searchParams: {
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  };
};

function getPageSize(value?: string) {
  const parsed = Number(value);

  return productPageSizeOptions.includes(parsed) ? parsed : defaultProductPageSize;
}

function getSelectedStatus(value?: string) {
  return productStatuses.find((status) => status === value);
}

export function ProductListPageClient({ searchParams }: ProductListPageClientProps) {
  const keyword = searchParams.keyword?.trim() ?? "";
  const pageSize = getPageSize(searchParams.pageSize);
  const selectedStatus = getSelectedStatus(searchParams.status);
  const productPageQuery = useProductsQuery({
    keyword,
    page: searchParams.page,
    pageSize,
    status: selectedStatus
  });
  const hasFilters = Boolean(keyword || selectedStatus);

  return (
    <>
      <ProductListFilters keyword={keyword} pageSize={pageSize} selectedStatus={selectedStatus} />
      <PageActionBar actions={[{ href: routes.newProduct, label: "상품 등록" }]} />

      {productPageQuery.isLoading ? <QueryLoadingState title="상품 목록을 불러오고 있습니다." /> : null}

      {productPageQuery.isError ? <QueryErrorState title="상품 목록을 불러오지 못했습니다." /> : null}

      {productPageQuery.data ? (
        productPageQuery.data.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "조건에 맞는 상품이 없습니다." : "아직 등록된 상품이 없습니다."}
            description={
              hasFilters
                ? "검색어나 판매상태를 바꿔 다시 확인해 주세요."
                : "첫 상품을 등록하고 옵션별 재고를 관리해 보세요."
            }
            action={
              hasFilters ? (
                <Link
                  href={routes.products}
                  className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  전체 상품 보기
                </Link>
              ) : (
                <Link href="/products/new" className={primaryActionClassName}>
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
                  {productPageQuery.data.items.map((product) => (
                    <tr key={product.id}>
                      <td data-label="상품명">
                        <Link href={`/products/${product.id}`} className="font-semibold text-slate-950 hover:text-blue-700">
                          {product.name}
                        </Link>
                      </td>
                      <td data-label="판매 상태">
                        <StatusBadge
                          tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}
                        >
                          {productStatusLabel[product.status as ProductStatus]}
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
              page={productPageQuery.data.page}
              pageSize={productPageQuery.data.pageSize}
              searchParams={{
                keyword,
                page: searchParams.page,
                pageSize: searchParams.pageSize,
                status: selectedStatus
              }}
              totalCount={productPageQuery.data.totalCount}
              totalPages={productPageQuery.data.totalPages}
            />
          </>
        )
      ) : null}
    </>
  );
}
