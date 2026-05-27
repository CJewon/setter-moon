import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  History,
  Layers3,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck
} from "lucide-react";

const SIGN_IN_ROUTE: Route = "/sign-in";
const SIGN_UP_ROUTE: Route = "/sign-up";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Metric = {
  label: string;
  value: string;
  detail: string;
};

type TrustPrinciple = {
  value: string;
  title: string;
  description: string;
};

type ProblemPrompt = {
  question: string;
  answer: string;
};

type ComparisonRow = {
  legacy: string;
  sellerRoom: string;
};

type WorkflowStep = {
  title: string;
  description: string;
};

type TargetUser = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type FaqItem = {
  question: string;
  answer: string;
};

type StockStatus = "정상" | "주의" | "부족";

type DemoOrder = {
  code: string;
  product: string;
  status: string;
  stockEffect: string;
};

type InventoryRow = {
  sku: string;
  stock: string;
  reserved: string;
  available: string;
  status: StockStatus;
};

const heroBadges = ["외부 채널 자동 연동 없음", "주문접수는 예약 수량", "배송대기부터 실제 재고 차감"];

const demoOrders: DemoOrder[] = [
  { code: "ORD-1024", product: "리넨 셔츠 / 스카이 S", status: "주문접수", stockEffect: "예약 2" },
  { code: "ORD-1023", product: "코튼 백 / 크림", status: "배송대기", stockEffect: "차감 1" },
  { code: "ORD-1022", product: "니트 바지 / 슬림", status: "배송중", stockEffect: "차감 완료" },
  { code: "ORD-1021", product: "실버 링 / 12호", status: "취소", stockEffect: "복원 대기" }
];

const lowStockPreview = [
  { sku: "SHIRT-SKY-M", available: "가용 4" },
  { sku: "BAG-CREAM", available: "가용 2" },
  { sku: "RING-12", available: "가용 1" }
];

const trustPrinciples: TrustPrinciple[] = [
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

const demoMetrics: Metric[] = [
  { label: "오늘 주문", value: "12건", detail: "샘플 스토어 기준" },
  { label: "주문접수 예약", value: "7개", detail: "아직 실제 차감 전 수량" },
  { label: "재고 부족 SKU", value: "3개", detail: "가용 재고 5개 이하" },
  { label: "최근 변경", value: "5건", detail: "주문 상태와 재고 이력" }
];

const comparisonRows: ComparisonRow[] = [
  {
    legacy: "상품과 주문을 엑셀 탭 여러 개에 나눠 적습니다.",
    sellerRoom: "상품, 옵션, SKU, 주문을 한 콘솔에서 연결해서 봅니다."
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
    sellerRoom: "가용 재고 기준으로 부족 SKU를 먼저 보여줍니다."
  }
];

const problemPrompts: ProblemPrompt[] = [
  {
    question: "옵션이 늘수록 어떤 SKU 재고가 빠졌는지 헷갈리나요?",
    answer: "상품 안에서 옵션 조합별 SKU를 만들고 현재 재고와 가용 재고를 따로 관리합니다."
  },
  {
    question: "주문접수와 배송대기 사이에서 재고 숫자가 흔들리나요?",
    answer: "예약 수량과 실제 차감 수량을 분리해 주문 상태가 바뀌는 순간을 더 분명하게 만듭니다."
  },
  {
    question: "여러 채널 주문을 다시 옮겨 적는 시간이 아깝나요?",
    answer: "초기 MVP는 자동 연동 대신 빠르게 입력하고 확인하는 수동 운영 흐름에 집중합니다."
  }
];

const features: Feature[] = [
  {
    title: "상품·옵션·SKU",
    description: "사용자가 직접 옵션 그룹을 만들고 조합별 SKU와 재고를 관리합니다.",
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
    description: "오늘 주문, 재고 부족 SKU, 최근 주문과 변경 이력을 첫 화면에서 확인합니다.",
    icon: BarChart3
  }
];

const workflowSteps: WorkflowStep[] = [
  {
    title: "상품 등록",
    description: "판매 상품과 기본 정보를 등록하고 옵션 관리 기준을 정합니다."
  },
  {
    title: "옵션과 SKU 생성",
    description: "색상, 사이즈, 구성처럼 직접 쓰는 옵션 조합으로 SKU를 만듭니다."
  },
  {
    title: "초기 재고 입력",
    description: "SKU별 현재 재고를 입력하고 부족 기준을 확인합니다."
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

const targetUsers: TargetUser[] = [
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

const feedbackNotes = [
  "실제 공개 전까지 도입 수치나 고객 후기는 만들지 않습니다.",
  "초기 베타는 상품 등록, 주문접수, 배송대기 전환, 부족 재고 확인을 우선 검증합니다.",
  "자동 채널 연동, 결제, 정산, 수익 분석은 현재 랜딩에서 약속하지 않습니다."
];

const faqItems: FaqItem[] = [
  {
    question: "쇼핑몰 채널과 자동 연동되나요?",
    answer: "초기 MVP에서는 자동 연동을 제공하지 않습니다. 여러 채널에서 들어온 주문을 빠르게 수동 등록하고 재고 흐름을 확인하는 데 집중합니다."
  },
  {
    question: "재고는 언제 실제로 차감되나요?",
    answer: "주문접수 상태에서는 예약 수량으로 표시하고, 배송대기 전환 시 실제 재고가 차감되는 흐름을 기준으로 설계합니다."
  },
  {
    question: "지금 보이는 숫자는 실제 이용자 데이터인가요?",
    answer: "아닙니다. 현재 랜딩의 주문 수와 SKU 수는 화면 이해를 돕기 위한 샘플 데이터입니다."
  },
  {
    question: "백오피스 기능까지 한 번에 제공하나요?",
    answer: "처음에는 상품, 옵션, SKU 재고, 주문 상태, 대시보드에 집중합니다. 이후 검증된 운영 흐름을 바탕으로 확장합니다."
  }
];

const inventoryRows: InventoryRow[] = [
  { sku: "SHIRT-SKY-S", stock: "18", reserved: "4", available: "14", status: "정상" },
  { sku: "SHIRT-SKY-M", stock: "7", reserved: "3", available: "4", status: "주의" },
  { sku: "BAG-CREAM", stock: "4", reserved: "2", available: "2", status: "부족" },
  { sku: "RING-12", stock: "3", reserved: "2", available: "1", status: "부족" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFFDF6] text-zinc-950">
      <LandingHeader />
      <HeroSection />
      <TrustPrinciplesSection />
      <MetricsSection />
      <BeforeAfterSection />
      <ProblemSection />
      <FeatureSection />
      <WorkflowSection />
      <TargetUsersSection />
      <BetaFeedbackSection />
      <FaqSection />
      <FinalCta />
    </main>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E1D3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-zinc-950">
          SellerRoom
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <a href="#problem" className="text-zinc-600 transition-colors hover:text-zinc-950">
            문제
          </a>
          <a href="#flow" className="text-zinc-600 transition-colors hover:text-zinc-950">
            작동 방식
          </a>
          <a href="#preview" className="text-zinc-600 transition-colors hover:text-zinc-950">
            데모 화면
          </a>
          <a href="#beta" className="text-zinc-600 transition-colors hover:text-zinc-950">
            베타 안내
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#E7E1D3] bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-[#F7F2E6]"
          >
            로그인
          </Link>
          <Link
            href={SIGN_UP_ROUTE}
            className="hidden min-h-10 items-center justify-center gap-2 rounded-md bg-[#355E3B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#294A2E] sm:inline-flex"
          >
            베타로 시작하기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="border-b border-[#EFE7D2] bg-[#FFF8EA]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#E5D9BF] bg-white px-3 text-sm font-bold text-[#4F6F52]">
            초기 셀러를 위한 상품·재고·주문 운영 콘솔
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-normal text-zinc-950 sm:text-6xl">
            주문과 재고를{" "}
            <br className="hidden sm:block" />
            한 화면에서 덜 헷갈리게
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8 text-zinc-800 sm:text-2xl">
            옵션별 재고, 주문접수 예약 수량, 배송대기 차감을 한 흐름으로 확인하세요.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            SellerRoom은 여러 판매 채널의 주문을 수동으로 모아 초기 셀러가 매일 확인해야 하는 상품, SKU, 재고, 주문 상태를 정리하는 베타 운영 콘솔입니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {heroBadges.map((label) => (
              <span
                key={label}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[#E5D9BF] bg-white px-3 text-xs font-bold text-zinc-700"
              >
                <CheckCircle2 className="h-4 w-4 text-[#4F6F52]" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={SIGN_UP_ROUTE}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#355E3B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#294A2E]"
            >
              스토어 만들고 시작하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#preview"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#E5D9BF] bg-white px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-[#F7F2E6]"
            >
              데모 콘솔 보기
            </a>
          </div>
        </div>
        <HeroConsolePreview />
      </div>
    </section>
  );
}

function HeroConsolePreview() {
  return (
    <div className="pointer-events-none relative mx-auto mt-12 w-full max-w-6xl">
      <div className="overflow-hidden rounded-md border border-[#E5D9BF] bg-white shadow-[0_24px_60px_rgba(51,65,85,0.16)]">
        <div className="flex min-h-12 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-slate-500">샘플 데이터 콘솔</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[184px_1fr] md:p-5">
          <aside className="hidden rounded-md border border-slate-200 bg-slate-50 p-4 md:block">
            <p className="text-base font-bold text-slate-950">SellerRoom</p>
            <div className="mt-5 space-y-2 text-sm font-semibold text-slate-600">
              <PreviewNav active icon={BarChart3} label="대시보드" />
              <PreviewNav icon={Package} label="상품" />
              <PreviewNav icon={Boxes} label="재고" />
              <PreviewNav icon={ClipboardList} label="주문" />
            </div>
          </aside>
          <div className="min-w-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <PreviewStat label="오늘 주문" value="12건" tone="neutral" />
              <PreviewStat label="재고 부족" value="3 SKU" tone="amber" />
              <PreviewStat label="배송대기" value="5건" tone="emerald" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">최근 주문</p>
                  <span className="rounded-md bg-[#F4F8F1] px-2 py-1 text-xs font-bold text-[#355E3B]">데모</span>
                </div>
                <div className="hidden md:block">
                  {demoOrders.map((order) => (
                    <div
                      key={order.code}
                      className="grid grid-cols-[82px_1fr_76px_78px] border-b border-slate-100 px-4 py-3 text-xs last:border-b-0"
                    >
                      <span className="font-bold text-slate-800">{order.code}</span>
                      <span className="truncate text-slate-600">{order.product}</span>
                      <span className="font-semibold text-slate-700">{order.status}</span>
                      <span className="text-slate-500">{order.stockEffect}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 p-3 md:hidden">
                  {demoOrders.slice(0, 3).map((order) => (
                    <div key={order.code} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-800">{order.code}</span>
                        <span className="text-xs font-semibold text-[#355E3B]">{order.status}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-700">{order.product}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.stockEffect}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">부족 SKU</p>
                  <div className="mt-4 space-y-3">
                    {lowStockPreview.map((item) => (
                      <div key={item.sku} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                        <span className="text-xs font-bold text-slate-800">{item.sku}</span>
                        <span className="text-xs font-semibold text-amber-700">{item.available}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-[#DCE8D3] bg-[#F4F8F1] p-4">
                  <p className="text-sm font-bold text-[#294A2E]">상태 변경 영향</p>
                  <p className="mt-3 text-xs leading-5 text-[#4F6F52]">
                    주문접수에서 배송대기로 바뀌면 예약 수량은 줄고 실제 재고가 차감됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustPrinciplesSection() {
  return (
    <section className="border-b border-[#EFE7D2] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-[#4F6F52]">베타 단계의 신뢰 방식</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
            도입 수치보다 먼저, 운영 원칙을 투명하게 보여줍니다.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            위노트처럼 검증 수치와 후기를 보여주기 전 단계이기 때문에, 셀러룸은 지금 약속할 수 있는 재고 계산 원칙과 기록 기준을 먼저 공개합니다.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustPrinciples.map((principle) => (
            <article key={principle.title} className="rounded-md border border-[#E7E1D3] bg-[#FFFDF6] p-5">
              <p className="text-3xl font-bold text-[#355E3B]">{principle.value}</p>
              <h3 className="mt-4 text-base font-bold text-zinc-950">{principle.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{principle.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section id="preview" className="border-b border-[#EFE7D2] bg-[#FFFDF6]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-[#4F6F52]">샘플 데이터 기준</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
            오늘 처리할 주문과 재고를 먼저 봅니다.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            숫자는 실제 이용자 데이터가 아니라 화면 이해를 돕기 위한 데모 값입니다.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoMetrics.map((metric) => (
            <MetricPreview key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-[#4F6F52]">운영 방식 비교</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
            엑셀과 메모장 사이에서 흩어지는 일을 한곳에 모읍니다.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">기존 방식</p>
            <ul className="mt-5 space-y-3">
              {comparisonRows.map((row) => (
                <li key={row.legacy} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {row.legacy}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-[#DCE8D3] bg-[#F4F8F1] p-5">
            <p className="text-sm font-bold text-[#355E3B]">SellerRoom</p>
            <ul className="mt-5 space-y-3">
              {comparisonRows.map((row) => (
                <li key={row.sellerRoom} className="flex gap-3 text-sm leading-6 text-[#294A2E]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4F6F52]" aria-hidden="true" />
                  {row.sellerRoom}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="border-y border-[#EFE7D2] bg-[#FFF8EA]" id="problem">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="혹시 이런 경험 있으시죠?"
          title="초기 셀러가 매일 겪는 주문·재고 혼선을 줄입니다."
          description="위노트가 상담자의 반복 업무를 질문으로 꺼내 보여주듯, 셀러룸도 실제 운영자가 자주 부딪히는 장면부터 해결합니다."
          centered
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {problemPrompts.map((point) => (
            <article key={point.question} className="rounded-md border border-[#E5D9BF] bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-[#4F6F52]" aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold leading-6 text-zinc-950">{point.question}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{point.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="bg-white" id="features">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="핵심 기능"
          title="상품 등록부터 배송 상태까지 한 흐름으로 봅니다."
          description="초기 MVP 범위에 맞춰 상품, SKU 재고, 주문 상태, 대시보드에 집중합니다."
          centered
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-[#FFFDF6]" id="flow">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="작동 방식"
            title="주문과 재고가 만나는 순간을 분리해서 보여줍니다."
            description="주문접수와 배송대기의 재고 영향을 다르게 잡아, 언제 예약이고 언제 실제 차감인지 더 분명하게 확인합니다."
          />
          <ol className="mt-8 space-y-3">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="flex min-h-16 gap-3 rounded-md border border-[#E7E1D3] bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EEF3EA] text-xs font-bold text-[#355E3B]">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-zinc-900">{step.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-600">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <InventoryPreview />
      </div>
    </section>
  );
}

function TargetUsersSection() {
  return (
    <section className="border-y border-[#EFE7D2] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="추천 대상"
          title="아직 큰 ERP보다 매일 쓰는 정리 도구가 필요한 셀러에게 맞습니다."
          description="거대한 백오피스보다 오늘 들어온 주문과 남은 재고를 정확히 보고 싶은 단계에 집중합니다."
          centered
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {targetUsers.map((target) => (
            <article key={target.title} className="rounded-md border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#4F6F52]">
                <target.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-bold text-zinc-950">{target.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{target.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BetaFeedbackSection() {
  return (
    <section className="bg-[#F4F8F1]" id="beta">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="베타 피드백"
            title="아직 없는 후기는 만들지 않고, 검증할 화면을 먼저 공개합니다."
            description="기획자, 디자이너, 개발자가 합의한 기준은 단순합니다. 지금 가능한 기능은 선명하게 보여주고, 아직 하지 않는 기능은 랜딩에서 과장하지 않습니다."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {feedbackNotes.map((note) => (
            <article key={note} className="rounded-md border border-[#DCE8D3] bg-white p-5">
              <ShieldCheck className="h-5 w-5 text-[#4F6F52]" aria-hidden="true" />
              <p className="mt-4 text-sm leading-6 text-zinc-700">{note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="자주 묻는 질문"
          title="베타 단계에서 먼저 확인해야 할 내용을 정리했습니다."
          description="셀러룸이 지금 제공하는 범위와 아직 약속하지 않는 범위를 분명하게 나눕니다."
          centered
        />
        <div className="mt-8 divide-y divide-[#E7E1D3] rounded-md border border-[#E7E1D3] bg-[#FFFDF6]">
          {faqItems.map((item) => (
            <article key={item.question} className="p-5">
              <h3 className="text-base font-bold text-zinc-950">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#355E3B]" id="start">
      <div className="mx-auto max-w-7xl px-4 py-14 text-white sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-[#DDE8D7]">시작하기</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
          오늘 들어온 주문부터 SellerRoom으로 정리해보세요.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#DDE8D7]">
          상품, 옵션별 재고, 주문 상태를 한곳에 모으고 다음 운영 기준을 더 빠르게 확인할 수 있습니다.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={SIGN_UP_ROUTE}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-[#25472D] transition-colors hover:bg-[#F7F2E6]"
          >
            첫 주문 정리 시작하기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#DDE8D7] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#294A2E]"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

function PreviewNav({ active = false, icon: Icon, label }: { active?: boolean; icon: LucideIcon; label: string }) {
  return (
    <div className={active ? "flex items-center gap-2 rounded-md bg-[#355E3B] px-3 py-2 text-white" : "flex items-center gap-2 rounded-md px-3 py-2"}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: string; tone: "neutral" | "amber" | "emerald" }) {
  const toneClass = {
    neutral: "bg-zinc-100 text-zinc-800",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700"
  }[tone];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function MetricPreview({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-md border border-[#EFE7D2] bg-white p-5">
      <p className="text-sm font-semibold text-zinc-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-950">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold text-zinc-500">{metric.detail}</p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-bold text-[#4F6F52]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#4F6F52]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-bold text-zinc-950">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.description}</p>
    </article>
  );
}

function InventoryPreview() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-bold text-zinc-950">SKU 재고 상태</p>
          <p className="mt-1 text-xs text-zinc-500">샘플 화면 기준</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-zinc-500">
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">현재 재고</th>
              <th className="px-3 py-3">주문접수</th>
              <th className="px-3 py-3">가용 재고</th>
              <th className="px-3 py-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {inventoryRows.map((row) => (
              <tr key={row.sku} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 font-bold text-zinc-800">{row.sku}</td>
                <td className="px-3 py-3 text-zinc-600">{row.stock}</td>
                <td className="px-3 py-3 text-zinc-600">{row.reserved}</td>
                <td className="px-3 py-3 text-zinc-900">{row.available}</td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>주문접수는 예약 수량으로 표시하고, 배송대기 전환부터 실제 재고 차감 흐름을 확인합니다.</p>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-md bg-[#F4F8F1] p-4 text-sm leading-6 text-[#294A2E]">
        <History className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>재고 변경과 주문 상태 변경은 이력으로 남겨 운영자가 나중에 다시 확인할 수 있게 설계합니다.</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: StockStatus }) {
  const className = {
    정상: "bg-emerald-50 text-emerald-700",
    주의: "bg-amber-50 text-amber-700",
    부족: "bg-red-50 text-red-700"
  }[status];

  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${className}`}>{status}</span>;
}
