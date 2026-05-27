import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="재고" description="전체 SKU의 현재 재고, 예약 수량, 가용 재고를 확인합니다." />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <input className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="상품명 또는 SKU 검색" />
        <select className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" defaultValue="">
          <option value="">전체 카테고리</option>
        </select>
        <select className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" defaultValue="">
          <option value="">전체 재고상태</option>
          <option value="normal">정상</option>
          <option value="low">부족</option>
          <option value="sold_out">품절</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="app-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>SKU</th>
              <th>현재 재고</th>
              <th>예약 수량</th>
              <th>가용 재고</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-sm text-slate-500">
                아직 재고 데이터가 없습니다.
              </td>
              <td>
                <StatusBadge>대기</StatusBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
