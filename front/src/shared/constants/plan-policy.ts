export const PLAN_PRICE_LABEL = "월 9,900원";

export const FREE_PLAN_LIMIT_ITEMS = [
  {
    label: "상품",
    value: "10개",
    description: "판매중, 품절, 숨김 상품을 모두 포함합니다."
  },
  {
    label: "옵션 조합",
    value: "100개",
    description: "색상, 사이즈 등 옵션 조합을 충분히 실험할 수 있는 기준입니다."
  },
  {
    label: "월 신규 주문 등록",
    value: "300건",
    description: "월평균 300건까지 새 주문을 등록할 수 있으며 기존 배송 상태 변경은 계속 가능합니다."
  }
] as const;

const [PRODUCT_LIMIT, SKU_LIMIT, MONTHLY_ORDER_LIMIT] = FREE_PLAN_LIMIT_ITEMS;

export const SHARED_PLAN_FEATURE_ITEMS = [
  {
    label: "스토어 기능",
    value: "제공"
  },
  {
    label: "배송 상태 관리",
    value: "제공"
  },
  {
    label: "재고 관리",
    value: "제공"
  }
] as const;

export const FREE_PLAN_BADGES = FREE_PLAN_LIMIT_ITEMS.map((item) => `${item.label} ${item.value}`);

export const FREE_PLAN_SUMMARY = `${FREE_PLAN_LIMIT_ITEMS[0].label} ${FREE_PLAN_LIMIT_ITEMS[0].value}, ${FREE_PLAN_LIMIT_ITEMS[1].label} ${FREE_PLAN_LIMIT_ITEMS[1].value}, ${FREE_PLAN_LIMIT_ITEMS[2].label} ${FREE_PLAN_LIMIT_ITEMS[2].value}까지 제공합니다.`;

export const PAID_FULL_SUMMARY = `유료 확장 플랜은 ${PLAN_PRICE_LABEL} 기준으로 한도 해제를 제공합니다.`;

export const PRICING_PLANS = [
  {
    name: "무료",
    badge: "기본 운영",
    description: "작게 시작하는 셀러를 위한 기본 운영 플랜",
    price: "0원",
    priceCaption: "카드 등록 없이 시작",
    ctaLabel: "무료로 시작하기",
    tone: "free",
    features: [
      `${PRODUCT_LIMIT.label} ${PRODUCT_LIMIT.value}까지 등록`,
      `${SKU_LIMIT.label} ${SKU_LIMIT.value}까지 관리`,
      `${MONTHLY_ORDER_LIMIT.label} ${MONTHLY_ORDER_LIMIT.value}까지 등록`,
      "상품·재고·주문·배송 상태 관리 제공"
    ]
  },
  {
    name: "확장",
    badge: "한도 없이 운영",
    description: "상품과 주문이 늘어난 셀러를 위한 확장 플랜",
    price: PLAN_PRICE_LABEL,
    priceCaption: "무료로 시작 후 전환 가능",
    ctaLabel: "무료로 시작 후 전환하기",
    tone: "paid",
    features: [
      "상품 등록 한도 해제",
      "옵션 조합 한도 해제",
      "월 신규 주문 등록 한도 해제",
      "무료 플랜의 모든 운영 기능 포함"
    ]
  }
] as const;

export const PRICING_COMPARISON_ROWS = [
  {
    label: `${PRODUCT_LIMIT.label} 수`,
    free: PRODUCT_LIMIT.value,
    paid: "한도 해제"
  },
  {
    label: SKU_LIMIT.label,
    free: SKU_LIMIT.value,
    paid: "한도 해제"
  },
  {
    label: "월 신규 주문 등록",
    free: MONTHLY_ORDER_LIMIT.value,
    paid: "한도 해제"
  },
  {
    label: SHARED_PLAN_FEATURE_ITEMS[0].label,
    free: SHARED_PLAN_FEATURE_ITEMS[0].value,
    paid: SHARED_PLAN_FEATURE_ITEMS[0].value
  },
  {
    label: SHARED_PLAN_FEATURE_ITEMS[1].label,
    free: SHARED_PLAN_FEATURE_ITEMS[1].value,
    paid: SHARED_PLAN_FEATURE_ITEMS[1].value
  },
  {
    label: SHARED_PLAN_FEATURE_ITEMS[2].label,
    free: SHARED_PLAN_FEATURE_ITEMS[2].value,
    paid: SHARED_PLAN_FEATURE_ITEMS[2].value
  },
  {
    label: "추천 대상",
    free: "초기 1인 셀러",
    paid: "상품·주문이 늘어난 셀러"
  }
] as const;
