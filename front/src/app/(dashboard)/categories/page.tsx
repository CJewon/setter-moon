import { PageHeader } from "@/shared/components/page-header";

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="카테고리" description="상품 분류를 관리합니다. 연결된 상품이 있는 카테고리는 삭제하지 않습니다." />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        카테고리 목록과 생성 폼을 연결할 예정입니다.
      </div>
    </>
  );
}
