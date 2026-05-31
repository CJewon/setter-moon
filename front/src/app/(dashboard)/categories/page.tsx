import Link from "next/link";
import { routes } from "@/shared/constants/routes";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";

export default function CategoriesPage() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 text-slate-950 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-slate-500">분류 관리</p>
        <h2 className="mt-2 text-xl font-bold">카테고리는 상품이 더 많아진 뒤 정리해도 괜찮아요.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          지금은 상품명과 옵션 검색만으로도 운영 흐름을 충분히 확인할 수 있습니다. 상품 수가 적은 동안에는 판매 상태와 옵션별
          재고를 먼저 관리하는 편이 더 빠릅니다.
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link href={routes.products} className={primaryActionClassName}>
          상품 목록 보기
        </Link>
        <Link href={routes.newProduct} className={secondaryActionClassName}>
          상품 등록하기
        </Link>
      </div>
    </section>
  );
}
