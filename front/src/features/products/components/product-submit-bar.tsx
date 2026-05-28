type ProductSubmitBarProps = {
  optionCombinationLimitExceeded: boolean;
  pending: boolean;
  productLimitReached: boolean;
};

export function ProductSubmitBar({ optionCombinationLimitExceeded, pending, productLimitReached }: ProductSubmitBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">저장 후 상품 상세 화면에서 옵션별 재고를 확인할 수 있어요.</p>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        disabled={pending || productLimitReached || optionCombinationLimitExceeded}
      >
        {pending ? "등록 중..." : "상품 등록하기"}
      </button>
    </div>
  );
}
