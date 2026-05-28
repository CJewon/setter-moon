import type { UsageMetric } from "@/server/usage/usage-policy";
import { StatusBadge } from "@/shared/components/status-badge";

type MyPageOverviewProps = {
  businessType: string | null;
  displayName: string;
  email: string;
  isPaidPlan: boolean;
  storeName: string;
};

export function MyPageOverview({ businessType, displayName, email, isPaidPlan, storeName }: MyPageOverviewProps) {
  const displayNameLabel = displayName || "사용자";

  return (
    <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-500">현재 접속 계정</p>
          <h2 className="mt-1 break-words text-2xl font-bold tracking-normal text-slate-950">{displayNameLabel}</h2>
          <p className="mt-1 break-all text-sm text-slate-500">{email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">연결된 스토어</p>
          <p className="mt-1 break-words text-lg font-bold text-slate-950">{storeName}</p>
          <p className="mt-1 text-sm text-slate-500">{businessType ?? "판매 채널 선택 전"}</p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <StatusBadge tone={isPaidPlan ? "success" : "neutral"}>{isPaidPlan ? "유료 풀버전" : "무료 플랜"}</StatusBadge>
          <p className="text-sm text-slate-500">
            {isPaidPlan ? "풀버전 사용 중" : "상품 10개, 옵션 조합 100개, 월 신규 주문 300건까지"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function MyPageUsageGrid({ metrics }: { metrics: UsageMetric[] }) {
  return (
    <section className="mb-5 grid gap-4 lg:grid-cols-3">
      {metrics.map((metric) => (
        <UsageMeter key={metric.key} metric={metric} />
      ))}
    </section>
  );
}

function UsageMeter({ metric }: { metric: UsageMetric }) {
  const percent = metric.percent ?? 18;
  const tone = getUsageTone(metric.state, metric.limit);
  const unit = metric.key === "monthlyOrders" ? "건" : "개";
  const barClassName = {
    success: "bg-emerald-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
    danger: "bg-red-500"
  }[tone];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{metric.label}</p>
          <p className="mt-1 text-xs text-slate-500">무료 플랜 기준 한도: {getLimitLabel(metric)}</p>
        </div>
        <StatusBadge tone={tone}>{getUsageStateLabel(metric.state, metric.limit)}</StatusBadge>
      </div>
      <p className="mt-4 text-xl font-bold text-slate-950" aria-label={`${metric.label} 사용량`}>
        {metric.limit === null ? (
          <>
            {metric.count.toLocaleString("ko-KR")}
            <span className="ml-1 text-sm font-semibold text-slate-500">{unit} 사용</span>
          </>
        ) : (
          <>
            {metric.count.toLocaleString("ko-KR")}
            <span className="mx-1 text-sm font-semibold text-slate-400">/</span>
            {metric.limit.toLocaleString("ko-KR")}
            <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>
          </>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-600">{getUsageMessage(metric.state, metric.limit)}</p>
    </div>
  );
}

function getUsageTone(state: UsageMetric["state"], limit: number | null) {
  if (limit === null) {
    return "success";
  }

  return state === "blocked" ? "danger" : state === "warning" ? "warning" : "info";
}

function getLimitLabel(metric: UsageMetric) {
  if (metric.limit === null) {
    return "한도 없음";
  }

  return metric.key === "monthlyOrders" ? `월 ${metric.limit.toLocaleString("ko-KR")}건` : `${metric.limit.toLocaleString("ko-KR")}개`;
}

function getUsageStateLabel(state: UsageMetric["state"], limit: number | null) {
  if (limit === null) {
    return "한도 없음";
  }

  return state === "blocked" ? "한도 도달" : state === "warning" ? "한도 임박" : "정상";
}

function getUsageMessage(state: UsageMetric["state"], limit: number | null) {
  if (limit === null) {
    return "풀버전은 제한 없이 사용할 수 있어요.";
  }

  if (state === "blocked") {
    return "무료 한도를 모두 사용했어요.";
  }

  if (state === "warning") {
    return "무료 한도에 가까워지고 있어요.";
  }

  return "아직 여유가 있어요.";
}
