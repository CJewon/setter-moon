import { StatusBadge } from "@/shared/components/status-badge";

type MyPagePlanPanelProps = {
  isPaidPlan: boolean;
  isPlanHealthy: boolean;
  planCurrentPeriodEnd: string | null | undefined;
};

export function MyPagePlanPanel({ isPaidPlan, isPlanHealthy, planCurrentPeriodEnd }: MyPagePlanPanelProps) {
  return (
    <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">현재 플랜</h2>
          <p className="mt-1 text-sm text-slate-500">플랜과 사용량은 서버 기준으로 계산합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={isPaidPlan ? "success" : "neutral"}>{isPaidPlan ? "유료 풀버전" : "무료 플랜"}</StatusBadge>
          <StatusBadge tone={isPlanHealthy ? "success" : "warning"}>{isPlanHealthy ? "정상" : "확인 필요"}</StatusBadge>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
        <PlanInfoItem title="플랜 기준" description={isPaidPlan ? "한도 없이 운영" : "초기 1인 셀러 무료 한도"} />
        <PlanInfoItem title="다음 결제일" description={isPaidPlan ? formatDate(planCurrentPeriodEnd) : "결제 기능 준비 중"} />
        <PlanInfoItem title="플랜 변경" description="현재 화면에서는 변경할 수 없습니다." />
      </div>
    </section>
  );
}

function PlanInfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(value));
}
