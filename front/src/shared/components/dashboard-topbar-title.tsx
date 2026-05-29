"use client";

import { usePathname } from "next/navigation";

const topbarPageTitles: Record<string, { description: string; title: string }> = {
  "/orders": {
    title: "주문",
    description: "수동 등록한 주문과 배송 상태를 관리합니다."
  },
  "/products": {
    title: "상품",
    description: "등록된 상품을 검색하고 옵션별 재고 상태를 확인합니다."
  }
};

export function DashboardTopbarTitle() {
  const pathname = usePathname();
  const pageTitle = topbarPageTitles[pathname];

  if (!pageTitle) {
    return <div className="hidden lg:block" aria-hidden="true" />;
  }

  return (
    <div className="min-w-0">
      <h1 className="truncate text-lg font-bold text-slate-950">{pageTitle.title}</h1>
      <p className="mt-0.5 truncate text-xs text-slate-500">{pageTitle.description}</p>
    </div>
  );
}
