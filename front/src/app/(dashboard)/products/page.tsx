import Link from "next/link";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { StatusBadge } from "@/shared/components/status-badge";
import { routes } from "@/shared/constants/routes";
import { productStatusLabel } from "@/shared/constants/status-labels";
import { requireDashboardAccess } from "@/server/auth/session";
import { listProductsForStore } from "@/server/products/service";
import { formatNumber } from "@/shared/lib/format";
import { createClient } from "@/shared/lib/supabase/server";

export default async function ProductsPage() {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const products = await listProductsForStore(supabase, access.store.id);

  return (
    <>
      <PageHeader
        title="상품"
        description="등록된 상품을 검색하고 옵션별 재고 상태를 확인합니다."
        action={{ href: routes.newProduct, label: "상품 등록" }}
      />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <input className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="상품명 검색" />
        <select className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" defaultValue="">
          <option value="">전체 카테고리</option>
        </select>
        <select className="min-h-10 rounded-md border border-slate-300 px-3 text-sm" defaultValue="">
          <option value="">전체 판매상태</option>
          <option value="active">판매중</option>
          <option value="sold_out">품절</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="아직 등록된 상품이 없습니다."
          description="첫 상품을 등록하고 옵션별 재고를 관리해보세요."
          action={
            <Link
              href="/products/new"
              className="inline-flex min-h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              상품 등록하기
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="app-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>판매 상태</th>
                <th>옵션 조합</th>
                <th>현재 재고</th>
                <th>기본 판매가</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link href={`/products/${product.id}`} className="font-semibold text-slate-950 hover:text-blue-700">
                      {product.name}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge tone={product.status === "active" ? "success" : product.status === "sold_out" ? "warning" : "neutral"}>
                      {productStatusLabel[product.status]}
                    </StatusBadge>
                  </td>
                  <td>{formatNumber(product.variantCount)}개</td>
                  <td>{formatNumber(product.totalCurrentStock)}개</td>
                  <td>{formatNumber(product.base_price)}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
