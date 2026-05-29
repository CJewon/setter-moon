import type { CSSProperties } from "react";
import { EmptyState } from "@/shared/components/empty-state";

type QueryLoadingVariant = "dashboard" | "detail" | "form" | "table";

type QueryStateProps = {
  description?: string;
  title: string;
};

type QueryLoadingStateProps = QueryStateProps & {
  variant?: QueryLoadingVariant;
};

const skeletonBaseClassName = "rounded bg-slate-200/80";

function SkeletonBlock({ className, style }: { className: string; style?: CSSProperties }) {
  return <div className={`${skeletonBaseClassName} ${className}`} style={style} />;
}

function DashboardLoadingSkeleton() {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-3 h-7 w-24" />
            <SkeletonBlock className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5 grid h-48 grid-cols-7 items-end gap-2 sm:h-56">
            {[34, 52, 28, 66, 42, 78, 58].map((height, index) => (
              <SkeletonBlock key={index} className="w-full rounded-t-md" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
          <SkeletonBlock className="h-4 w-24" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="rounded-md border border-slate-100 bg-white p-3">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="grid gap-3">
      <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
        <SkeletonBlock className="h-3 w-24" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-7 w-52 max-w-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-3 h-6 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
          <SkeletonBlock className="h-4 w-28" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-20 w-full" />
          <SkeletonBlock className="mt-4 h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

function FormLoadingSkeleton() {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
      <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
        <SkeletonBlock className="h-5 w-36" />
        <div className="mt-5 grid gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index}>
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-2 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-4 h-24 w-full" />
        <SkeletonBlock className="mt-4 h-9 w-full" />
      </div>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 md:grid">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBlock key={index} className="h-3 w-16" />
        ))}
      </div>
      <div className="flex min-h-56 items-center justify-center px-4 py-10 text-center sm:min-h-64">
        <div className="flex flex-col items-center">
          <span
            aria-label="데이터 불러오는 중"
            className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
          />
          <p className="mt-4 text-sm font-semibold text-slate-950">목록을 불러오고 있습니다.</p>
          <p className="mt-1 text-sm text-slate-500">잠시 후 표에 데이터가 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ variant }: { variant: QueryLoadingVariant }) {
  if (variant === "dashboard") {
    return <DashboardLoadingSkeleton />;
  }

  if (variant === "detail") {
    return <DetailLoadingSkeleton />;
  }

  if (variant === "form") {
    return <FormLoadingSkeleton />;
  }

  return <TableLoadingSkeleton />;
}

export function QueryLoadingState({
  description = "화면에 필요한 정보를 준비하고 있습니다.",
  title,
  variant = "table"
}: QueryLoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
      role="status"
    >
      <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/50 px-4 py-4 sm:px-5">
        <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 ring-1 ring-blue-100">
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-blue-400/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className={variant === "table" ? "p-4 sm:p-5" : "animate-pulse p-4 sm:p-5"}>
        <LoadingSkeleton variant={variant} />
      </div>
    </div>
  );
}

export function QueryErrorState({ description = "새로고침 후 다시 시도해 주세요.", title }: QueryStateProps) {
  return <EmptyState title={title} description={description} />;
}
