import { AlertTriangle, History, Truck } from "lucide-react";
import { inventoryRows, type StockStatus } from "@/features/landing/landing-content";

export function InventoryPreview() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-bold text-slate-950">옵션별 재고 상태</p>
          <p className="mt-1 text-xs text-slate-500">예시 화면 기준</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-blue-600" aria-hidden="true" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500">
              <th className="px-3 py-3">옵션 조합</th>
              <th className="px-3 py-3">현재 재고</th>
              <th className="px-3 py-3">주문접수</th>
              <th className="px-3 py-3">가용 재고</th>
              <th className="px-3 py-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {inventoryRows.map((row) => (
              <tr key={row.sku} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 font-bold text-slate-800">{row.sku}</td>
                <td className="px-3 py-3 text-slate-600">{row.stock}</td>
                <td className="px-3 py-3 text-slate-600">{row.reserved}</td>
                <td className="px-3 py-3 text-slate-900">{row.available}</td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-md bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>주문접수는 예약 수량으로 표시하고, 배송대기 전환부터 실제 재고 차감 흐름을 확인합니다.</p>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <History className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>재고 변경과 주문 상태 변경은 이력으로 남겨 운영자가 나중에 다시 확인할 수 있게 설계합니다.</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: StockStatus }) {
  const className = {
    정상: "bg-slate-100 text-slate-700",
    주의: "bg-blue-50 text-blue-700",
    부족: "bg-slate-950 text-white"
  }[status];

  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${className}`}>{status}</span>;
}
