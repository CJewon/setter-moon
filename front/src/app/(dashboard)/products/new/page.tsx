import { ProductCreateForm } from "@/features/products/components/product-create-form";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getStoreUsageSummary } from "@/server/usage/service";
import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewProductPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const usageSummary = await getStoreUsageSummary(supabase, access.store, getAppAccessPlanId(access));

  return (
    <>
      <PageHeader
        backLink={{
          href: routes.products,
          label: "상품 목록으로"
        }}
        title="상품 등록"
        description="상품 정보와 옵션 조합을 만들고 옵션별 재고를 입력합니다."
      />
      <ProductCreateForm usageSummary={usageSummary} />
    </>
  );
}
