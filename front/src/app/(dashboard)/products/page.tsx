import Link from "next/link";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { routes } from "@/shared/constants/routes";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="상품"
        description="등록된 상품을 검색하고 SKU별 재고 상태를 확인합니다."
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
    </>
  );
}
