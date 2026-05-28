import { PageHeader } from "@/shared/components/page-header";

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="카테고리" description="상품 분류를 관리합니다. 연결된 상품이 있는 카테고리는 삭제하지 않습니다." />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        아직 등록된 카테고리가 없습니다. 상품 수가 늘어나면 분류 기준을 정리해 관리할 수 있습니다.
      </div>
    </>
  );
}
