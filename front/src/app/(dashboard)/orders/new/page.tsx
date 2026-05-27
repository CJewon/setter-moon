import { PageHeader } from "@/shared/components/page-header";

export default function NewOrderPage() {
  return (
    <>
      <PageHeader title="주문 등록" description="고객 정보와 상품/SKU를 선택해 주문을 수동 등록합니다." />
      <form className="rounded-md border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            고객명
            <input className="min-h-10 rounded-md border border-slate-300 px-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            연락처
            <input className="min-h-10 rounded-md border border-slate-300 px-3" />
          </label>
        </div>
        <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
          저장 시 상태는 `received`이며 실제 재고는 차감하지 않습니다.
        </p>
      </form>
    </>
  );
}
