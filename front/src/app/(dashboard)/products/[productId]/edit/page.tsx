import { notFound } from "next/navigation";
import { ProductEditForm } from "@/features/products/components/product-edit-form";
import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";
import { requireDashboardAccess } from "@/server/auth/session";
import { getProductDetailForStore, isProductNotFoundError } from "@/server/products/service";
import { createClient } from "@/shared/lib/supabase/server";

type ProductEditPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { productId } = await params;
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const product = await (async () => {
    try {
      return await getProductDetailForStore(supabase, access.store.id, productId);
    } catch (error) {
      if (isProductNotFoundError(error)) {
        notFound();
      }

      throw error;
    }
  })();

  return (
    <>
      <PageHeader
        backLink={{
          href: routes.productDetail(productId),
          label: "상품 상세로"
        }}
        title="상품 수정"
        description="상품명, 판매가, 판매 상태를 수정합니다."
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
