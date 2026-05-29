"use client";

import { ProductEditForm } from "@/features/products/components/product-edit-form";
import { useProductQuery } from "@/features/products/hooks/use-product-queries";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";
import { routes } from "@/shared/constants/routes";

type ProductEditPageClientProps = {
  productId: string;
};

export function ProductEditPageClient({ productId }: ProductEditPageClientProps) {
  const productQuery = useProductQuery(productId);

  if (productQuery.isLoading) {
    return <QueryLoadingState title="상품 수정 정보를 불러오고 있습니다." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return <QueryErrorState title="상품 수정 정보를 불러오지 못했습니다." />;
  }

  const product = productQuery.data;

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.productDetail(productId),
          label: "상품 상세로"
        }}
      />
      <ProductEditForm
        product={{
          basePrice: product.base_price,
          id: product.id,
          memo: product.memo ?? undefined,
          name: product.name,
          status: product.status
        }}
      />
    </>
  );
}
