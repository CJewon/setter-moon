import { OrderEditPageClient } from "@/features/orders/components/order-edit-page-client";

type OrderEditPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const { orderId } = await params;

  return <OrderEditPageClient orderId={orderId} />;
}
