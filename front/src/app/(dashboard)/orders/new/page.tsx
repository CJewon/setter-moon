import { OrderCreateForm } from "@/features/orders/components/order-create-form";
import { getOrderProductChoicesForStore } from "@/server/orders/service";
import { requireDashboardAccess } from "@/server/auth/session";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { routes } from "@/shared/constants/routes";
import { createClient } from "@/shared/lib/supabase/server";

export default async function NewOrderPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const products = await getOrderProductChoicesForStore(supabase, access.store.id);

  return (
    <>
      <PageActionBar
        backLink={{
          href: routes.orders,
          label: "주문 목록으로"
        }}
      />
      <OrderCreateForm products={products} />
    </>
  );
}
