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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
        className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        disabled={pending || !isDirty}
      >
        {pending ? "저장 중" : "변경사항 저장"}
      </button>
    </div>
  );
}
