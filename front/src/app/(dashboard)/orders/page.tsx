import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";

const orderTabs = ["전체", "주문접수", "배송대기", "배송중", "배송완료", "취소", "보류"];

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="주문"
        description="수동 등록된 주문과 배송 상태를 관리합니다."
        action={{ href: routes.newOrder, label: "주문 등록" }}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {orderTabs.map((tab) => (
          <button key={tab} className="min-h-9 rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50">
            {tab}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="app-table">
          <thead>
            <tr>
              <th>주문일</th>
              <th>고객명</th>
              <th>상품/옵션</th>
              <th>수량</th>
              <th>주문금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-sm text-slate-500">
                아직 등록된 주문이 없습니다.
              </td>
              <td>
                <StatusBadge tone="info">주문접수</StatusBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
