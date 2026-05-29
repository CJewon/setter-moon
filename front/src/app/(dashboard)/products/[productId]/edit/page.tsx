import { ProductEditPageClient } from "@/features/products/components/product-edit-page-client";

type ProductEditPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { productId } = await params;

  return <ProductEditPageClient productId={productId} />;
}
