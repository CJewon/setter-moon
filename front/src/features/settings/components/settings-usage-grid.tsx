import type { UsageMetric } from "@/server/usage/usage-policy";
import { StatusBadge } from "@/shared/components/status-badge";

type SettingsUsageGridProps = {
  metrics: UsageMetric[];
};

const statusCopy: Record<UsageMetric["state"], { label: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  normal: {
    label: "정상",
    tone: "success"
  },
  warning: {
    label: "한도 임박",
    tone: "warning"
  },
  blocked: {
    label: "한도 도달",
    tone: "danger"
  }
};

export function SettingsUsageGrid({ metrics }: SettingsUsageGridProps) {
  return (
    <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">무료 한도 사용량</h2>
          <p className="mt-1 text-sm text-slate-500">상품, 옵션 조합, 월 신규 주문 등록 기준입니다.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <UsageMetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function UsageMetricCard({ metric }: { metric: UsageMetric }) {
  const copy = statusCopy[metric.state];
  const percent = metric.percent ?? 0;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatUsage(metric)}</p>
        </div>
        <StatusBadge tone={metric.limit === null ? "neutral" : copy.tone}>
          {metric.limit === null ? "한도 없음" : copy.label}
        </StatusBadge>
      </div>
      {metric.limit === null ? (
        <p className="mt-3 text-sm text-slate-500">풀버전은 사용량 제한이 없습니다.</p>
      ) : (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">{percent}% 사용</p>
        </div>
      )}
    </div>
  );
}

function formatUsage(metric: UsageMetric) {
  const count = metric.count.toLocaleString("ko-KR");

  if (metric.limit === null) {
    return `${count}개`;
  }

  return `${count} / ${metric.limit.toLocaleString("ko-KR")}`;
}
