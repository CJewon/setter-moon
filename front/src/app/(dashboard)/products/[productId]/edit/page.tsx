import { notFound } from "next/navigation";
import { ProductEditForm } from "@/features/products/components/product-edit-form";
import { PageActionBar } from "@/shared/components/page-action-bar";
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
