import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;

  return (
    <>
      <PageHeader title="주문 상세" description={`주문 ID: ${orderId}`} />
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">주문 상품</h2>
          <p className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">주문 상품 목록을 연결할 예정입니다.</p>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">상태 변경</h2>
            <StatusBadge tone="info">주문접수</StatusBadge>
          </div>
          <p className="mt-3 text-sm text-slate-600">배송대기로 변경할 때 서버에서 재고 차감을 검증합니다.</p>
        </aside>
      </section>
    </>
  );
}
