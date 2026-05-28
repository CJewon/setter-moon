import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";

export default function LowStockPage() {
  return (
    <>
      <PageHeader
        backLink={{
          href: routes.inventory,
          label: "전체 재고로"
        }}
        title="재고 부족"
        description="안전재고 이하로 떨어진 옵션 조합을 확인합니다."
      />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        현재 재고 부족 옵션 조합이 없습니다.
      </div>
    </>
  );
}
