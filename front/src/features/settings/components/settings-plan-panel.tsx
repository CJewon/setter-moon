import { StatusBadge } from "@/shared/components/status-badge";

type SettingsPlanPanelProps = {
  isPaidPlan: boolean;
  isPlanHealthy: boolean;
  planCurrentPeriodEnd: string | null | undefined;
};

export function SettingsPlanPanel({ isPaidPlan, isPlanHealthy, planCurrentPeriodEnd }: SettingsPlanPanelProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">플랜 설정</h2>
          <p className="mt-1 text-sm text-slate-500">현재 플랜과 운영 한도 기준을 확인합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={isPaidPlan ? "success" : "neutral"}>{isPaidPlan ? "유료 풀버전" : "무료 플랜"}</StatusBadge>
          <StatusBadge tone={isPlanHealthy ? "success" : "warning"}>{isPlanHealthy ? "정상" : "확인 필요"}</StatusBadge>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
        <PlanInfoItem title="상품" description={isPaidPlan ? "한도 없음" : "10개까지"} />
        <PlanInfoItem title="옵션 조합" description={isPaidPlan ? "한도 없음" : "100개까지"} />
        <PlanInfoItem title="월 신규 주문" description={isPaidPlan ? "한도 없음" : "300건까지"} />
      </div>
      {isPaidPlan ? (
        <p className="mt-3 text-sm text-slate-500">다음 결제일: {formatDate(planCurrentPeriodEnd)}</p>
      ) : null}
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
