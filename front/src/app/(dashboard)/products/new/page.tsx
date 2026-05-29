import { ProductCreateForm } from "@/features/products/components/product-create-form";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getStoreUsageSummary } from "@/server/usage/service";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { routes } from "@/shared/constants/routes";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewProductPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const usageSummary = await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access));

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.products,
          label: "상품 목록으로"
        }}
      />
      <ProductCreateForm usageSummary={usageSummary} />
    </>
  );
}
