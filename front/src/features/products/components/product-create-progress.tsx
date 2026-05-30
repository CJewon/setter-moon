import type { UsageSummary } from "@/server/usage/usage-policy";
import { getUsageMetric } from "@/features/products/utils/product-create-draft";

const productCreateSteps = ["상품 기본 정보", "옵션 선택", "옵션 조합", "옵션별 재고", "저장"];

function formatUsageLimit(limit: number | null | undefined) {
  return limit == null ? "무제한" : `${limit.toLocaleString("ko-KR")}개`;
}

export function ProductCreateProgress({ usageSummary }: { usageSummary: UsageSummary }) {
  const productMetric = getUsageMetric(usageSummary, "products");
  const optionCombinationMetric = getUsageMetric(usageSummary, "skus");
  const isUnlimitedPlan = productMetric?.limit === null && optionCombinationMetric?.limit === null;

  return (
    <aside className="h-fit rounded-md border border-slate-200 bg-white p-4">
      <ol className="space-y-3">
        {productCreateSteps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-700">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-md bg-blue-50 p-3 text-xs leading-5 text-blue-900">
        {isUnlimitedPlan
          ? "유료 풀버전은 상품과 옵션 조합을 한도 없이 등록할 수 있어요."
          : `무료 플랜은 상품 ${formatUsageLimit(productMetric?.limit)}, 옵션 조합 ${formatUsageLimit(
              optionCombinationMetric?.limit
            )}까지 등록할 수 있어요.`}
      </div>
    </aside>
  );
}
