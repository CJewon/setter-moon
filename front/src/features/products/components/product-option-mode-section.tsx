import type { ProductOptionMode } from "@/features/products/types/product-create-draft";
import { cn } from "@/shared/utils/cn";

type ProductOptionModeSectionProps = {
  optionMode: ProductOptionMode;
  setOptionMode: (mode: ProductOptionMode) => void;
};

const optionModeItems = [
  { value: "none" as const, title: "옵션 없이 등록", description: "단일 상품 재고를 관리합니다." },
  { value: "options" as const, title: "옵션을 나눠 등록", description: "색상, 사이즈처럼 조합별 재고를 관리합니다." }
];

export function ProductOptionModeSection({ optionMode, setOptionMode }: ProductOptionModeSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-950">옵션 사용 여부</h2>
        <p className="text-sm text-slate-500">옵션이 없는 상품도 기본 옵션 조합 1개로 재고를 관리합니다.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {optionModeItems.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-200",
              optionMode === item.value ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
            )}
            onClick={() => setOptionMode(item.value)}
          >
            <span className="text-sm font-bold text-slate-950">{item.title}</span>
            <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
