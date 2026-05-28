import Link from "next/link";
import type { Route } from "next";
import type { MouseEvent } from "react";

type ProductSubmitBarProps = {
  cancelHref: Route;
  confirmOnCancel: boolean;
  optionCombinationLimitExceeded: boolean;
  pending: boolean;
  productLimitReached: boolean;
};

export function ProductSubmitBar({
  cancelHref,
  confirmOnCancel,
  optionCombinationLimitExceeded,
  pending,
  productLimitReached
}: ProductSubmitBarProps) {
  function handleCancelClick(event: MouseEvent<HTMLAnchorElement>) {
    if (confirmOnCancel && !window.confirm("작성 중인 내용이 사라집니다. 이 화면을 나갈까요?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">저장 후 상품 상세 화면에서 옵션별 재고를 확인할 수 있어요.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={cancelHref}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          onClick={handleCancelClick}
        >
          취소
        </Link>
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          disabled={pending || productLimitReached || optionCombinationLimitExceeded}
        >
          {pending ? "등록 중..." : "상품 등록"}
        </button>
      </div>
    </div>
  );
}
