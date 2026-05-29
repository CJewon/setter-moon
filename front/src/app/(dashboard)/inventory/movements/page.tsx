import { StockMovementsPageClient } from "@/features/inventory/components/stock-movements-page-client";

type StockMovementsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function StockMovementsPage({ searchParams }: StockMovementsPageProps) {
  return <StockMovementsPageClient searchParams={await searchParams} />;
}
