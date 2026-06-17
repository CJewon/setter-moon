import { notFound } from "next/navigation";
import { ProductDetailPageClient } from "@/features/products/components/product-detail-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { isProductNotFoundError } from "@/server/products/errors";
import { getProductDetailForStore } from "@/server/products/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const access = await requireDashboardAccess();
  const queryClient = createServerQueryClient();
  const supabase = await createClient();

  try {
    queryClient.setQueryData(queryKeys.product(productId), await getProductDetailForStore(supabase, access.store.id, productId));
  } catch (error) {
    if (isProductNotFoundError(error)) {
      notFound();
    }

    console.error("Failed to prefetch product detail", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <ProductDetailPageClient productId={productId} />
    </ServerQueryHydrationBoundary>
  );
}
