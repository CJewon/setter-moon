import { cn } from "@/shared/utils/cn";

type MyPageSubmitBarProps = {
  formStatusLabel: string;
  isDirty: boolean;
  pending: boolean;
  stateStatus: "idle" | "success" | "error";
};

export function MyPageSubmitBar({ formStatusLabel, isDirty, pending, stateStatus }: MyPageSubmitBarProps) {
  const shouldShowStatus = pending || isDirty || stateStatus !== "idle";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 sm:flex-row sm:items-center sm:justify-end">
      {shouldShowStatus ? (
        <p
          className={cn(
            "text-sm font-medium",
            pending ? "text-blue-700" : isDirty ? "text-amber-700" : stateStatus === "success" ? "text-emerald-700" : "text-slate-500"
          )}
          aria-live="polite"
        >
          {formStatusLabel}
        </p>
      ) : null}
      <button
        type="submit"
        className="inline-flex min-h-10 w-auto items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending || !isDirty}
      >
        {pending ? "저장 중" : "변경사항 저장"}
      </button>
    </div>
  );
}
