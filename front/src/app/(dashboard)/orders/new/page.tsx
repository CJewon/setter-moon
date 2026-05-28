import { OrderCreateForm } from "@/features/orders/components/order-create-form";
import { getOrderProductChoicesForStore } from "@/server/orders/service";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageHeader } from "@/shared/components/page-header";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewOrderPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const products = await getOrderProductChoicesForStore(supabase, access.store.id);

  return (
    <>
      <PageHeader title="주문 등록" description="고객 정보와 상품 옵션을 선택해 주문을 수동 등록합니다." />
      <OrderCreateForm products={products} />
    </>
  );
}
