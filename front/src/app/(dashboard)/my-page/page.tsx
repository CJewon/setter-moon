import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { getAppAccessPlanId, requireDashboardAccess } from "@/server/auth/session";
import { getUserDisplayName } from "@/server/profiles/service";

export default async function MyPage() {
  const access = await requireDashboardAccess();
  const displayName = getUserDisplayName(access.user, access.profile) ?? "사용자";
  const planId = getAppAccessPlanId(access);

  return (
    <>
      <PageHeader title="마이페이지" description="계정과 현재 스토어의 기본 정보를 확인합니다." />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">계정 정보</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-500">이름</dt>
              <dd className="mt-1 font-medium text-slate-900">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">이메일</dt>
              <dd className="mt-1 font-medium text-slate-900">{access.user.email ?? access.profile?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">플랜</dt>
              <dd className="mt-1">
                <StatusBadge tone={planId === "paid_full" ? "info" : "neutral"}>
                  {planId === "paid_full" ? "유료 풀버전" : "무료"}
                </StatusBadge>
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">스토어 정보</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-500">스토어명</dt>
              <dd className="mt-1 font-medium text-slate-900">{access.store.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">판매 채널</dt>
              <dd className="mt-1 font-medium text-slate-900">{access.store.business_type ?? "선택 안 함"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">메모</dt>
              <dd className="mt-1 text-slate-700">{access.store.memo ?? "등록된 메모가 없습니다."}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
