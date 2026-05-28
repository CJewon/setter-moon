import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="재고" description="전체 옵션 조합의 현재 재고, 예약 수량, 가용 재고를 확인합니다." />
      <InventoryFilters />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="app-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>옵션 조합</th>
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
