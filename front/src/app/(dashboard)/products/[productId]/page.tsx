import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  return (
    <>
      <PageHeader title="상품 상세" description={`상품 ID: ${productId}`} />
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">옵션별 재고</h2>
            <StatusBadge tone="neutral">데이터 연결 대기</StatusBadge>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
            <table className="app-table">
              <thead>
                <tr>
                  <th>옵션 조합</th>
                  <th>현재 재고</th>
                  <th>예약 수량</th>
                  <th>가용 재고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center text-sm text-slate-500">
                    아직 옵션 조합 데이터가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">재고 작업</h2>
          <p className="mt-3 text-sm text-slate-600">입고와 조정은 서버 mutation 성공 후 이력으로 남깁니다.</p>
        </aside>
      </section>
    </>
  );
}
