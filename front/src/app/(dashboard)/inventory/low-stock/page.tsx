import { LowStockPageClient } from "@/features/inventory/components/low-stock-page-client";

type LowStockPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function LowStockPage({ searchParams }: LowStockPageProps) {
  return <LowStockPageClient searchParams={await searchParams} />;
}
