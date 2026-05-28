import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Boxes, ClipboardList, Layers3, Package, ShoppingBag, Store } from "lucide-react";
import {
  FREE_PLAN_BADGES,
  FREE_PLAN_SUMMARY,
  PAID_FULL_SUMMARY,
  PLAN_PRICE_LABEL,
  PRICING_COMPARISON_ROWS,
  PRICING_PLANS
} from "@/shared/constants/plan-policy";

export { FREE_PLAN_SUMMARY, PAID_FULL_SUMMARY, PLAN_PRICE_LABEL, PRICING_COMPARISON_ROWS, PRICING_PLANS };

export const SIGN_IN_ROUTE: Route = "/sign-in";
export const SIGN_UP_ROUTE: Route = "/sign-up";

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type TrustPrinciple = {
  value: string;
  title: string;
  description: string;
};

export type ProblemPrompt = {
  question: string;
  answer: string;
};

export type ComparisonRow = {
  legacy: string;
  sellerRoom: string;
};

export type WorkflowStep = {
  title: string;
  description: string;
};

export type TargetUser = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type PricingPlan = (typeof PRICING_PLANS)[number];
export type PricingComparisonRow = (typeof PRICING_COMPARISON_ROWS)[number];

export type StockStatus = "정상" | "주의" | "부족";

export type DemoOrder = {
  code: string;
  product: string;
  status: string;
  stockEffect: string;
};

export type InventoryRow = {
  sku: string;
  stock: string;
  reserved: string;
  available: string;
  status: StockStatus;
};

export const heroBadges = FREE_PLAN_BADGES;

export const demoOrders: DemoOrder[] = [
  { code: "ORD-1024", product: "리넨 셔츠 / 스카이 S", status: "주문접수", stockEffect: "예약 2" },
  { code: "ORD-1023", product: "코튼 백 / 크림", status: "배송대기", stockEffect: "차감 1" },
  { code: "ORD-1022", product: "니트 바지 / 슬림", status: "배송중", stockEffect: "차감 완료" },
  { code: "ORD-1021", product: "실버 링 / 12호", status: "취소", stockEffect: "복원 대기" }
];

export const lowStockPreview = [
  { sku: "SHIRT-SKY-M", available: "가용 4" },
  { sku: "BAG-CREAM", available: "가용 2" },
  { sku: "RING-12", available: "가용 1" }
];

export const trustPrinciples: TrustPrinciple[] = [
  {
    value: "3가지",
    title: "재고 기준",
    description: "현재 재고, 주문접수 예약 수량, 실제 판매 가능한 가용 재고를 분리해서 봅니다."
  },
  {
    value: "6단계",
    title: "주문 상태",
    description: "주문접수부터 취소까지 상태별로 재고 영향이 달라지는 흐름을 명확히 둡니다."
  },
  {
    value: "2종류",
    title: "변경 이력",
    description: "재고 변경과 주문 상태 변경을 기록해 어떤 순간에 숫자가 바뀌었는지 추적합니다."
  }
];

export const demoMetrics: Metric[] = [
  { label: "오늘 주문", value: "12건", detail: "예시 스토어 기준" },
  { label: "주문접수 예약", value: "7개", detail: "아직 실제 차감 전 수량" },
  { label: "재고 부족 옵션", value: "3개", detail: "가용 재고 5개 이하" },
  { label: "최근 변경", value: "5건", detail: "주문 상태와 재고 이력" }
];

export const comparisonRows: ComparisonRow[] = [
  {
    legacy: "상품과 주문을 엑셀 탭 여러 개에 나눠 적습니다.",
    sellerRoom: "상품, 옵션 조합, 주문을 한 콘솔에서 연결해서 봅니다."
  },
  {
    legacy: "주문접수부터 재고를 바로 빼서 품절 판단이 흔들립니다.",
    sellerRoom: "주문접수는 예약 수량, 배송대기부터 실제 재고 차감으로 분리합니다."
  },
  {
    legacy: "인스타, 카카오톡, 오픈마켓 주문을 메모한 뒤 다시 옮깁니다.",
    sellerRoom: "채널 주문을 수동으로 모아 상태 변경과 재고 영향을 함께 남깁니다."
  },
  {
    legacy: "부족 재고를 감으로 체크하고 포장 직전에야 발견합니다.",
    sellerRoom: "가용 재고 기준으로 부족 옵션을 먼저 보여줍니다."
  }
];

export const problemPrompts: ProblemPrompt[] = [
  {
    question: "옵션이 늘수록 어떤 옵션 재고가 빠졌는지 헷갈리나요?",
    answer: "상품 안에서 옵션 조합을 만들고 현재 재고와 가용 재고를 따로 관리합니다."
  },
  {
    question: "주문접수와 배송대기 사이에서 재고 숫자가 흔들리나요?",
    answer: "예약 수량과 실제 차감 수량을 분리해 주문 상태가 바뀌는 순간을 더 분명하게 만듭니다."
  },
  {
    question: "여러 채널 주문을 다시 옮겨 적는 시간이 아깝나요?",
    answer: "초기 버전은 자동 연동 대신 빠르게 입력하고 확인하는 수동 운영 흐름에 집중합니다."
  }
];

export const features: Feature[] = [
  {
    title: "상품·옵션 조합",
    description: "사용자가 직접 옵션 그룹을 만들고 조합별 재고를 관리합니다.",
    icon: Package
  },
  {
    title: "가용 재고",
    description: "현재 재고에서 주문접수 예약 수량을 뺀 판매 가능 수량을 바로 확인합니다.",
    icon: Boxes
  },
  {
    title: "수동 주문 등록",
    description: "외부 채널에서 들어온 주문을 직접 입력하고 상태별 처리 흐름을 이어갑니다.",
    icon: ClipboardList
  },
  {
    title: "운영 대시보드",
    description: "오늘 주문, 재고 부족 옵션, 최근 주문과 변경 이력을 첫 화면에서 확인합니다.",
    icon: BarChart3
  }
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "상품 등록",
    description: "판매 상품과 기본 정보를 등록하고 옵션 관리 기준을 정합니다."
  },
  {
    title: "옵션 조합 만들기",
    description: "색상, 사이즈, 구성처럼 직접 쓰는 옵션 조합을 만듭니다."
  },
  {
    title: "초기 재고 입력",
    description: "옵션별 현재 재고를 입력하고 부족 기준을 확인합니다."
  },
  {
    title: "주문 수동 등록",
    description: "채널에서 들어온 주문을 빠르게 기록하고 주문접수 상태로 둡니다."
  },
  {
    title: "배송대기 전환",
    description: "배송 준비가 시작될 때 실제 재고가 차감되는 흐름을 확인합니다."
  },
  {
    title: "이력 확인",
    description: "재고와 주문 상태가 언제 바뀌었는지 변경 이력에서 되짚습니다."
  }
];

export const targetUsers: TargetUser[] = [
  {
    title: "1인 셀러",
    description: "엑셀, 메모장, 채팅 주문을 오가며 매일 주문을 정리하는 운영자에게 맞습니다.",
    icon: Store
  },
  {
    title: "옵션 많은 상품",
    description: "색상과 사이즈 조합이 많아 실제 판매 가능 수량을 자주 헷갈리는 팀에 맞습니다.",
    icon: Layers3
  },
  {
    title: "수기 주문 병행",
    description: "스마트스토어, 쿠팡, 인스타그램, 카카오톡 주문을 한 번에 보고 싶은 셀러에게 맞습니다.",
    icon: ShoppingBag
  }
];

export const faqItems: FaqItem[] = [
  {
    question: "쇼핑몰 채널과 자동 연동되나요?",
    answer: "초기 버전에서는 자동 연동을 제공하지 않습니다. 여러 채널에서 들어온 주문을 빠르게 수동 등록하고 재고 흐름을 확인하는 데 집중합니다."
  },
  {
    question: "재고는 언제 실제로 차감되나요?",
    answer: "주문접수 상태에서는 예약 수량으로 표시하고, 배송대기 전환 시 실제 재고가 차감되는 흐름을 기준으로 설계합니다."
  },
  {
    question: "지금 보이는 숫자는 실제 이용자 데이터인가요?",
    answer: "아닙니다. 현재 랜딩의 주문 수와 옵션 조합 수는 화면 이해를 돕기 위한 예시 데이터입니다."
  },
  {
    question: "백오피스 기능까지 한 번에 제공하나요?",
    answer: "처음에는 상품, 옵션별 재고, 주문 상태, 대시보드에 집중합니다. 이후 검증된 운영 흐름을 바탕으로 확장합니다."
  }
];

export const inventoryRows: InventoryRow[] = [
  { sku: "SHIRT-SKY-S", stock: "18", reserved: "4", available: "14", status: "정상" },
  { sku: "SHIRT-SKY-M", stock: "7", reserved: "3", available: "4", status: "주의" },
  { sku: "BAG-CREAM", stock: "4", reserved: "2", available: "2", status: "부족" },
  { sku: "RING-12", stock: "3", reserved: "2", available: "1", status: "부족" }
];
