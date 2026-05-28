import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";

type ProductEditPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { productId } = await params;

  return (
    <>
      <PageHeader
        backLink={{
          href: routes.productDetail(productId),
          label: "상품 상세로"
        }}
        title="상품 수정"
        description="상품명, 판매가, 판매 상태를 수정합니다."
      />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        현재는 상품 상세에서 등록된 정보를 확인할 수 있습니다.
      </div>
    </>
  );
}
