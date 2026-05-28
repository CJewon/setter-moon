import { notFound } from "next/navigation";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { requireDashboardAccess } from "@/server/auth/session";
import { getProductDetailForStore, isProductNotFoundError } from "@/server/products/service";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const product = await (async () => {
    try {
      return await getProductDetailForStore(supabase, access.store.id, productId);
    } catch (error) {
      if (isProductNotFoundError(error)) {
        notFound();
      }

      throw error;
    }
  })();

  return (
    <>
      <PageHeader title={product.name} description="상품 기본 정보와 옵션별 재고를 확인합니다." />
      <section className="mb-5 grid gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">판매 상태</p>
          <div className="mt-2">
            <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
              {productStatusLabel[product.status]}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">기본 판매가</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatNumber(product.base_price)}원</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">옵션 조합</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatNumber(product.variants.length)}개</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">현재 재고</p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatNumber(product.variants.reduce((total, variant) => total + variant.current_stock, 0))}개
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">옵션별 재고</h2>
            <StatusBadge tone="info">서버 데이터 연결</StatusBadge>
          </div>
          <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
            <table className="app-table">
              <thead>
                <tr>
                  <th>옵션 조합</th>
                  <th>판매가</th>
                  <th>현재 재고</th>
                  <th>예약 수량</th>
                  <th>가용 재고</th>
                  <th>안전 재고</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="font-semibold text-slate-950">{variant.sku_name}</td>
                    <td>{formatNumber(variant.price)}원</td>
                    <td>{formatNumber(variant.current_stock)}개</td>
                    <td>{formatNumber(variant.reservedQuantity)}개</td>
                    <td>{formatNumber(variant.availableStock)}개</td>
                    <td>{formatNumber(variant.safety_stock)}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">재고 작업</h2>
          <p className="mt-3 text-sm text-slate-600">입고와 조정은 다음 단계에서 전용 작업으로 연결합니다.</p>
          {product.memo ? (
            <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">상품 메모</p>
              <p className="mt-2 whitespace-pre-wrap">{product.memo}</p>
            </div>
          ) : null}
        </aside>
      </section>
    </>
  );
}
