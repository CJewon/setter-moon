import { PageHeader } from "@/shared/components/page-header";

export default function LowStockPage() {
  return (
    <>
      <PageHeader title="재고 부족" description="안전재고 이하로 떨어진 SKU를 확인합니다." />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        재고 부족 SKU 목록을 연결할 예정입니다.
      </div>
    </>
  );
}
