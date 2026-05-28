import { MyPageForm } from "@/features/my-page/components/my-page-form";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getUserDisplayName } from "@/server/profiles/service";
import { getStoreUsageSummary } from "@/server/usage/service";
import type { UsageMetric, UsageLimitState } from "@/server/usage/usage-policy";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

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

function getUsageTone(state: UsageLimitState, limit: number | null) {
  if (limit === null) {
    return "success";
  }

  return state === "blocked" ? "danger" : state === "warning" ? "warning" : "info";
}

function getUsageSuffix(key: UsageMetric["key"]) {
  return key === "monthlyOrders" ? "건 처리" : "개 사용";
}

function getLimitLabel(metric: UsageMetric) {
  if (metric.limit === null) {
    return "제한 없음";
  }

  return metric.key === "monthlyOrders" ? `월 ${formatNumber(metric.limit)}건` : `${formatNumber(metric.limit)}개`;
}

function UsageMeter({ metric }: { metric: UsageMetric }) {
  const percent = metric.percent ?? 18;
  const tone = getUsageTone(metric.state, metric.limit);
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
        <StatusBadge tone={tone}>{metric.limit === null ? "제한 없음" : `${percent}%`}</StatusBadge>
      </div>
      <p className="mt-4 text-xl font-bold text-slate-950">
        {formatNumber(metric.count)}
        <span className="ml-1 text-sm font-semibold text-slate-500">{getUsageSuffix(metric.key)}</span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
      {metric.state === "blocked" ? (
        <p className="mt-2 text-xs font-medium text-red-700">무료 한도에 도달했습니다.</p>
      ) : null}
    </div>
  );
}

export default async function MyPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const displayName = getUserDisplayName(access.user, access.profile) ?? "";
  const displayNameLabel = displayName || "사용자";
  const email = access.user.email ?? access.profile?.email ?? "-";
  const planId = getAppAccessPlanId(access);
  const usageSummary = await getStoreUsageSummary(supabase, access.store, planId);
  const isPaidPlan = planId === "paid_full";
  const isPlanHealthy = access.profile?.plan_status !== "past_due" && access.profile?.plan_status !== "cancelled";

  return (
    <>
      <PageHeader title="마이페이지" description="계정, 스토어, 플랜 사용 상태를 확인합니다." />

      <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-500">현재 접속 계정</p>
            <h2 className="mt-1 break-words text-2xl font-bold tracking-normal text-slate-950">{displayNameLabel}</h2>
            <p className="mt-1 break-all text-sm text-slate-500">{email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">연결된 스토어</p>
            <p className="mt-1 break-words text-lg font-bold text-slate-950">{access.store.name}</p>
            <p className="mt-1 text-sm text-slate-500">{access.store.business_type ?? "업종/판매 유형 선택 안 함"}</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <StatusBadge tone={isPaidPlan ? "success" : "neutral"}>{isPaidPlan ? "유료 풀버전" : "무료 플랜"}</StatusBadge>
            <p className="text-sm text-slate-500">
              {isPaidPlan ? "풀버전 사용 중" : "상품 10개, 옵션 조합 100개, 월 신규 주문 300건까지"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-3">
        {usageSummary.metrics.map((metric) => (
          <UsageMeter key={metric.key} metric={metric} />
        ))}
      </section>

      <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">현재 플랜</h2>
            <p className="mt-1 text-sm text-slate-500">플랜과 사용량은 서버 기준으로 계산됩니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={isPaidPlan ? "success" : "neutral"}>{isPaidPlan ? "유료 풀버전" : "무료 플랜"}</StatusBadge>
            <StatusBadge tone={isPlanHealthy ? "success" : "warning"}>{isPlanHealthy ? "정상" : "확인 필요"}</StatusBadge>
          </div>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="font-semibold text-slate-950">플랜 기준</p>
            <p className="mt-1">{isPaidPlan ? "한도 제한 없이 운영" : "초기 1인 셀러 무료 한도"}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="font-semibold text-slate-950">다음 결제일</p>
            <p className="mt-1">{isPaidPlan ? formatDate(access.profile?.plan_current_period_end) : "결제 기능 준비 전"}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="font-semibold text-slate-950">플랜 변경</p>
            <p className="mt-1">현재 화면에서는 변경할 수 없습니다.</p>
          </div>
        </div>
      </section>

      <MyPageForm
        displayName={displayName}
        email={email}
        storeName={access.store.name}
        businessType={access.store.business_type}
        memo={access.store.memo}
      />
    </>
  );
}
