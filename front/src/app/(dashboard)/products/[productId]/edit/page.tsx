import { PageHeader } from "@/shared/components/page-header";

type ProductEditPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { productId } = await params;

  return (
    <>
      <PageHeader title="상품 수정" description={`상품 ID: ${productId}`} />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        상품 기본 정보 수정 폼을 연결할 예정입니다.
      </div>
    </>
  );
}
