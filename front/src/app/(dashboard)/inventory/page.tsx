import { InventoryListPageClient } from "@/features/inventory/components/inventory-list-page-client";

type InventoryPageProps = {
  searchParams: Promise<{
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  return <InventoryListPageClient searchParams={await searchParams} />;
}
