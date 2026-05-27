export const PLAN_PRICE_LABEL = "월 9,900원 후보";

export const FREE_PLAN_LIMIT_ITEMS = [
  {
    label: "상품",
    value: "10개",
    description: "판매중, 품절, 숨김 상품을 모두 포함합니다."
  },
  {
    label: "SKU/옵션 조합",
    value: "100개",
    description: "색상, 사이즈 등 옵션 조합을 충분히 실험할 수 있는 기준입니다."
  },
  {
    label: "월 새 주문",
    value: "100건",
    description: "주문/배송 처리 한도는 새 주문 등록 기준이며 기존 배송 상태 변경은 계속 가능합니다."
  }
] as const;

export const PLAN_SHARED_FEATURES = ["스토어 기능 동일", "배송 상태 관리 동일", "계정 공유는 추후 기획"] as const;

export const FREE_PLAN_BADGES = FREE_PLAN_LIMIT_ITEMS.map((item) => `${item.label} ${item.value}`);

export const FREE_PLAN_SUMMARY = `${FREE_PLAN_LIMIT_ITEMS[0].label} ${FREE_PLAN_LIMIT_ITEMS[0].value}, ${FREE_PLAN_LIMIT_ITEMS[1].label} ${FREE_PLAN_LIMIT_ITEMS[1].value}, ${FREE_PLAN_LIMIT_ITEMS[2].label} ${FREE_PLAN_LIMIT_ITEMS[2].value}까지 제공합니다.`;

export const PAID_FULL_SUMMARY = `유료 풀버전은 ${PLAN_PRICE_LABEL} 기준으로 한도 해제를 준비합니다.`;
