import type { ProductVariantDraft } from "@/features/products/types/product-create-draft";
import { formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/utils/cn";

type ProductVariantStockSectionProps = {
  activeVariantCount: number;
  optionCombinationLimit: number | null;
  optionCombinationLimitExceeded: boolean;
  updateVariant: (key: string, patch: Partial<ProductVariantDraft>) => void;
  variants: ProductVariantDraft[];
  variantsError?: string;
};

export function ProductVariantStockSection({
  activeVariantCount,
  optionCombinationLimit,
  optionCombinationLimitExceeded,
  updateVariant,
  variants,
  variantsError
}: ProductVariantStockSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">옵션 조합과 옵션별 재고</h2>
          <p className="mt-1 text-sm text-slate-500">등록할 조합만 켜두고 현재 재고와 안전 재고를 입력합니다.</p>
        </div>
        <div className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          등록 예정 {formatNumber(activeVariantCount)}개
        </div>
      </div>
      {variantsError ? <p className="mt-3 text-xs text-red-700">{variantsError}</p> : null}
      {optionCombinationLimitExceeded ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          남은 옵션 조합 한도는 {formatNumber(optionCombinationLimit ?? 0)}개입니다. 사용하지 않을 조합을 꺼주세요.
        </p>
      ) : null}
      {variants.length === 0 ? (
        <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">옵션 그룹과 옵션값을 입력하면 조합이 나타납니다.</p>
      ) : (
        <div className="mt-5 grid gap-3">
          {variants.map((variant) => (
            <div key={variant.key} className={cn("rounded-md border p-4", variant.isActive ? "border-slate-200" : "border-slate-100 bg-slate-50")}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="inline-flex items-start gap-3 text-sm font-semibold text-slate-950">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-slate-300"
                    checked={variant.isActive}
                    onChange={(event) => updateVariant(variant.key, { isActive: event.target.checked })}
                  />
                  <span>
                    {variant.label}
                    <span className="mt-1 block text-xs font-medium text-slate-500">{variant.isActive ? "등록할 옵션 조합" : "사용 안 함"}</span>
                  </span>
                </label>
                <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[640px]">
                  <VariantNumberInput
                    disabled={!variant.isActive}
                    label="옵션별 판매가"
                    onChange={(value) => updateVariant(variant.key, { price: value })}
                    value={variant.price}
                  />
                  <VariantNumberInput
                    disabled={!variant.isActive}
                    label="현재 재고"
                    onChange={(value) => updateVariant(variant.key, { currentStock: value })}
                    value={variant.currentStock}
                  />
                  <VariantNumberInput
                    disabled={!variant.isActive}
                    label="안전 재고"
                    onChange={(value) => updateVariant(variant.key, { safetyStock: value })}
                    value={variant.safetyStock}
                  />
                  <VariantNumberInput
                    disabled={!variant.isActive}
                    label="원가"
                    onChange={(value) => updateVariant(variant.key, { cost: value })}
                    value={variant.cost}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VariantNumberInput({
  disabled,
  label,
  onChange,
  value
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-slate-600">
      {label}
      <input
        className="min-h-9 rounded-md border border-slate-300 px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="numeric"
        disabled={disabled}
      />
    </label>
  );
}
