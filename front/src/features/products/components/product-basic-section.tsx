import type { ProductBasicDraft } from "@/features/products/types/product-create-draft";
import { productStatuses } from "@/features/products/utils/product-create-draft";
import { FormSelect } from "@/shared/components/form-select";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { cn } from "@/shared/utils/cn";

type ProductBasicSectionProps = {
  basic: ProductBasicDraft;
  basePriceError?: string;
  nameError?: string;
  updateBasic: (field: keyof ProductBasicDraft, value: string) => void;
};

export function ProductBasicSection({ basic, basePriceError, nameError, updateBasic }: ProductBasicSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-950">상품 기본 정보</h2>
        <p className="text-sm text-slate-500">상품명과 기본 판매가를 먼저 입력합니다.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-name">
          상품명
          <input
            id="product-name"
            className={cn(
              "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              nameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
            value={basic.name}
            onChange={(event) => updateBasic("name", event.target.value)}
            placeholder="예: 린넨 셔츠"
            maxLength={80}
          />
          {nameError ? <span className="text-xs text-red-700">{nameError}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="base-price">
          기본 판매가
          <input
            id="base-price"
            className={cn(
              "min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              basePriceError && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
            value={basic.basePrice}
            onChange={(event) => updateBasic("basePrice", event.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
          {basePriceError ? <span className="text-xs text-red-700">{basePriceError}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="base-cost">
          기본 원가
          <input
            id="base-cost"
            className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={basic.baseCost}
            onChange={(event) => updateBasic("baseCost", event.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-status">
          판매 상태
          <FormSelect
            id="product-status"
            value={basic.status}
            onChange={(event) => updateBasic("status", event.target.value as ProductBasicDraft["status"])}
          >
            {productStatuses.map((status) => (
              <option key={status} value={status}>
                {productStatusLabel[status]}
              </option>
            ))}
          </FormSelect>
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800" htmlFor="product-memo">
        상품 메모
        <textarea
          id="product-memo"
          className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={basic.memo}
          onChange={(event) => updateBasic("memo", event.target.value)}
          maxLength={500}
          placeholder="입고처, 촬영 메모, 판매 채널별 주의사항 등을 적어둘 수 있어요."
        />
      </label>
    </section>
  );
}
