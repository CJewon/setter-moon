import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";

export default function StockMovementsPage() {
  return (
    <>
      <PageHeader
        backLink={{
          href: routes.inventory,
          label: "전체 재고로"
        }}
        title="재고 이력"
        description="입고, 판매 차감, 취소 복구, 수동 조정 이력을 확인합니다."
      />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        아직 재고 변경 이력이 없습니다. 입고, 판매 차감, 취소 복구, 수동 조정 내역이 생기면 이곳에 표시됩니다.
      </div>
    </>
  );
}
