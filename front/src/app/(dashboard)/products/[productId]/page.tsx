import { notFound } from "next/navigation";
import { ProductStatusQuickUpdate } from "@/features/products/components/product-status-quick-update";
import { PageActionBar } from "@/shared/components/page-action-bar";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
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
      <PageActionBar
        actions={[{ href: routes.productEdit(product.id), label: "상품 수정" }]}
        backLink={{
          href: routes.products,
          label: "상품 목록으로"
        }}
      />
      <section className="mb-4 rounded-md border border-slate-200 bg-white p-4 sm:mb-5 sm:p-5">
        <p className="text-sm font-semibold text-slate-500">상품명</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-950">{product.name}</h2>
          <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
            {productStatusLabel[product.status]}
          </StatusBadge>
        </div>
      </section>
      <section className="mb-4 grid gap-3 sm:mb-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-slate-500">판매 상태</p>
          <div className="mt-2">
            <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
              {productStatusLabel[product.status]}
            </StatusBadge>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-slate-500">기본 판매가</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatNumber(product.base_price)}원</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-slate-500">옵션 조합</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatNumber(product.variants.length)}개</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-sm font-semibold text-slate-500">현재 재고</p>
          <p className="mt-2 text-xl font-bold text-slate-950">
            {formatNumber(product.variants.reduce((total, variant) => total + variant.current_stock, 0))}개
          </p>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold">옵션별 재고</h2>
            <p className="mt-1 text-sm text-slate-500">주문접수 수량을 반영한 재고를 확인합니다.</p>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 sm:mt-5">
            <table className="app-table responsive-card-table">
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
                    <td className="font-semibold text-slate-950" data-label="옵션 조합">{variant.sku_name}</td>
                    <td data-label="판매가">{formatNumber(variant.price)}원</td>
                    <td data-label="현재 재고">{formatNumber(variant.current_stock)}개</td>
                    <td data-label="예약 수량">{formatNumber(variant.reservedQuantity)}개</td>
                    <td data-label="가용 재고">{formatNumber(variant.availableStock)}개</td>
                    <td data-label="안전 재고">{formatNumber(variant.safety_stock)}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-base font-semibold">재고 작업</h2>
          <p className="mt-3 text-sm text-slate-600">현재는 상품별 재고 현황을 확인할 수 있습니다. 재고 변경은 이력으로 함께 관리합니다.</p>
          <div className="mt-5 rounded-md border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-bold text-slate-950">판매상태 변경</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">목록과 주문 등록 화면에 노출할 판매상태를 바꿉니다.</p>
            <div className="mt-4">
              <ProductStatusQuickUpdate
                product={{
                  basePrice: product.base_price,
                  id: product.id,
                  memo: product.memo ?? undefined,
                  name: product.name,
                  status: product.status
                }}
              />
            </div>
          </div>
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
