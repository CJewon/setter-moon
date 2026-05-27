import { PageHeader } from "@/shared/components/page-header";

const steps = ["상품 기본 정보", "옵션 그룹", "SKU 조합", "재고 입력", "저장"];

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="상품 등록" description="상품 정보와 옵션 조합을 만들고 SKU별 재고를 입력합니다." />
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-md border border-slate-200 bg-white p-4">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-semibold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </aside>
        <form className="rounded-md border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              상품명
              <input className="min-h-10 rounded-md border border-slate-300 px-3" placeholder="예: 린넨 셔츠" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              판매가
              <input className="min-h-10 rounded-md border border-slate-300 px-3" inputMode="numeric" placeholder="0" />
            </label>
          </div>
          <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            옵션 빌더와 SKU 조합 테이블은 다음 구현 단계에서 이 영역에 연결합니다.
          </div>
        </form>
      </div>
    </>
  );
}
