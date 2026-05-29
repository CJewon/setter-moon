import { ProductDetailPageClient } from "@/features/products/components/product-detail-page-client";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  return <ProductDetailPageClient productId={productId} />;
}
