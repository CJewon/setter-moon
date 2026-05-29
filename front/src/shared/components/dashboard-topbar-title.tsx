"use client";

import { usePathname } from "next/navigation";

export function DashboardTopbarTitle() {
  const pathname = usePathname();

  if (pathname !== "/orders") {
    return <div className="hidden lg:block" aria-hidden="true" />;
  }

  return (
    <div className="min-w-0">
      <h1 className="truncate text-lg font-bold text-slate-950">주문</h1>
      <p className="mt-0.5 truncate text-xs text-slate-500">수동 등록한 주문과 배송 상태를 관리합니다.</p>
    </div>
  );
}
