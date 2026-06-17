import { notFound } from "next/navigation";
import { ProductEditPageClient } from "@/features/products/components/product-edit-page-client";
import { requireDashboardAccess } from "@/server/auth/session";
import { isProductNotFoundError } from "@/server/products/errors";
import { getProductDetailForStore } from "@/server/products/service";
import { createServerQueryClient, ServerQueryHydrationBoundary } from "@/server/react-query/hydration";
import { createClient } from "@/shared/lib/supabase/server";
import { queryKeys } from "@/shared/api/query-keys";

type ProductEditPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
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

    console.error("Failed to prefetch product edit data", error);
  }

  return (
    <ServerQueryHydrationBoundary queryClient={queryClient}>
      <ProductEditPageClient productId={productId} />
    </ServerQueryHydrationBoundary>
  );
}
