import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { formatNumber, formatWon } from "@/shared/lib/format";

const summaryCards = [
  { label: "오늘 주문", value: formatNumber(0), helper: "주문접수 기준" },
  { label: "오늘 판매금액", value: formatWon(0), helper: "취소 주문 제외" },
  { label: "재고 부족 옵션", value: formatNumber(0), helper: "안전재고 이하" },
  { label: "배송대기", value: formatNumber(0), helper: "재고 차감 완료" }
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="대시보드" description="오늘 기준 주문, 판매금액, 재고 부족 흐름을 확인합니다." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">판매 추이</h2>
            <StatusBadge tone="info">오늘</StatusBadge>
          </div>
          <div className="mt-6 flex h-64 items-center justify-center rounded-md bg-slate-50 text-sm text-slate-500">
            아직 표시할 판매 추이가 없습니다.
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">최근 주문</h2>
          <p className="mt-6 rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            아직 등록된 주문이 없습니다.
          </p>
        </div>
      </section>
    </>
  );
}
