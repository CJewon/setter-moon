"use client";

import { usePathname } from "next/navigation";

const topbarPageTitles: Record<string, { description: string; title: string }> = {
  "/categories": {
    title: "카테고리",
    description: "상품 분류를 관리합니다."
  },
  "/dashboard": {
    title: "대시보드",
    description: "오늘 기준 주문, 판매금액, 재고 부족 흐름을 확인합니다."
  },
  "/inventory": {
    title: "재고",
    description: "전체 옵션 조합의 현재 재고, 예약 수량, 가용 재고를 확인합니다."
  },
  "/inventory/low-stock": {
    title: "재고 부족",
    description: "안전재고 이하로 떨어진 옵션 조합을 확인합니다."
  },
  "/inventory/movements": {
    title: "재고 이력",
    description: "입고, 판매 차감, 취소 복구, 수동 조정 이력을 확인합니다."
  },
  "/my-page": {
    title: "마이페이지",
    description: "계정, 스토어, 플랜 사용 상태를 확인합니다."
  },
  "/orders": {
    title: "주문",
    description: "수동 등록한 주문과 배송 상태를 관리합니다."
  },
  "/orders/new": {
    title: "주문 등록",
    description: "고객 정보와 상품 옵션을 선택해 주문을 수동 등록합니다."
  },
  "/products": {
    title: "상품",
    description: "등록된 상품을 검색하고 옵션별 재고 상태를 확인합니다."
  },
  "/products/new": {
    title: "상품 등록",
    description: "상품 정보와 옵션 조합을 만들고 옵션별 재고를 입력합니다."
  },
  "/settings": {
    title: "설정",
    description: "스토어 정보와 기본 운영 설정을 관리합니다."
  }
};

function getTopbarPageTitle(pathname: string) {
  const exactTitle = topbarPageTitles[pathname];

  if (exactTitle) {
    return exactTitle;
  }

  if (/^\/orders\/[^/]+$/.test(pathname)) {
    return {
      title: "주문 상세",
      description: "주문번호, 상품, 상태 변경 이력을 확인합니다."
    };
  }

  if (/^\/products\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "상품 수정",
      description: "상품명, 판매가, 판매 상태를 수정합니다."
    };
  }

  if (/^\/products\/[^/]+$/.test(pathname)) {
    return {
      title: "상품 상세",
      description: "상품 기본 정보와 옵션별 재고를 확인합니다."
    };
  }

  return null;
}

export function DashboardTopbarTitle() {
  const pathname = usePathname();
  const pageTitle = getTopbarPageTitle(pathname);

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
