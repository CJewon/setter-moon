import { OrderListPageClient } from "@/features/orders/components/order-list-page-client";

type OrdersPageProps = {
  searchParams: Promise<{
    customerKeyword?: string;
    fromDate?: string;
    keyword?: string;
    page?: string;
    pageSize?: string;
    productKeyword?: string;
    sort?: string;
    status?: string;
    toDate?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  return <OrderListPageClient searchParams={await searchParams} />;
}
