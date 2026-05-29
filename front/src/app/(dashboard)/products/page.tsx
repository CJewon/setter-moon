import { ProductListPageClient } from "@/features/products/components/product-list-page-client";

type ProductsPageProps = {
  searchParams: Promise<{
    keyword?: string;
    page?: string;
    pageSize?: string;
    status?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductListPageClient searchParams={await searchParams} />;
}
