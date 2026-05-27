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
  Package,
  ShieldCheck,
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

const painPoints = [
  {
    title: "옵션별 재고가 섞일 때",
    description: "상품 하나 아래 색상, 사이즈, 구성 옵션을 SKU 단위로 나누어 현재 재고와 예약 수량을 분리합니다."
  },
  {
    title: "주문 상태마다 재고 기준이 다를 때",
    description: "주문접수는 예약 수량으로 보고, 배송대기 전환부터 실제 재고가 줄어드는 흐름으로 정리합니다."
  },
  {
    title: "채널별 주문이 흩어질 때",
    description: "스마트스토어, 쿠팡, 인스타그램, 카카오톡 주문을 셀러가 직접 한 콘솔에 기록합니다."
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
    description: "오늘 주문, 재고 부족 SKU, 최근 주문을 한 화면에서 먼저 확인합니다.",
    icon: BarChart3
  }
];

const demoMetrics: Metric[] = [
  { label: "오늘 주문", value: "12건", detail: "데모 화면 기준" },
  { label: "주문접수 예약", value: "7건", detail: "실제 차감 전 수량" },
  { label: "재고 부족 SKU", value: "3개", detail: "가용 재고 5개 이하" },
  { label: "최근 주문", value: "5건", detail: "상태 변경 대상" }
];

const workflowSteps = [
  "상품 등록",
  "사용자 정의 옵션 생성",
  "SKU별 현재 재고 입력",
  "채널 주문 수동 등록",
  "배송대기 전환 시 재고 차감",
  "재고 이력과 부족 SKU 확인"
];

const feedbackNotes = [
  "실제 공개 후기가 쌓이기 전까지 별점과 고객 인용문은 만들지 않습니다.",
  "초기 셀러의 상품 등록, 주문접수, 배송대기 전환 흐름을 기준으로 베타 피드백을 수집합니다.",
  "외부 채널 자동 연동, 결제, 정산, 손익 분석은 현재 랜딩에서 약속하지 않습니다."
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFFDF6] text-zinc-950">
      <LandingHeader />
      <HeroSection />

      <section id="preview" className="border-y border-[#EFE7D2] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-[#4F6F52]">데모 데이터 기준</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
              오늘 처리할 주문과 재고를 먼저 봅니다
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoMetrics.map((metric) => (
              <MetricPreview key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="features">
        <SectionHeading
          eyebrow="문제와 해결"
          title="혹시 이런 경험 있으시죠?"
          description="이미 들어온 상품, 옵션, 재고, 주문 정보를 셀러가 덜 헷갈리게 정리하는 내부 콘솔입니다."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {painPoints.map((point) => (
            <article key={point.title} className="rounded-md border border-slate-200 bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold text-slate-950">{point.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{point.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="기능"
            title="상품 등록부터 배송 상태까지 한 흐름으로 봅니다."
            description="초기 MVP 범위에 맞춰 상품, SKU 재고, 주문 상태, 대시보드에 집중합니다."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="운영 흐름"
            title="주문과 재고가 어긋나는 순간을 줄입니다."
            description="주문접수와 배송대기의 재고 영향을 다르게 두어, 실제 차감 타이밍을 더 분명하게 보여줍니다."
          />
          <ol className="mt-8 space-y-3">
            {workflowSteps.map((step, index) => (
              <li key={step} className="flex min-h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#EEF3EA] text-xs font-bold text-[#355E3B]">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <InventoryPreview />
      </section>

      <section className="border-y border-[#EFE7D2] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="베타 피드백"
              title="후기는 만들지 않고, 검증할 장면을 공개합니다."
              description="런칭 전 단계에서는 실제 사용자 수와 고객 후기를 과장하지 않고, 어떤 운영 흐름을 검증하는지 투명하게 보여줍니다."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {feedbackNotes.map((note) => (
              <article key={note} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <ShieldCheck className="h-5 w-5 text-[#4F6F52]" aria-hidden="true" />
                <p className="mt-4 text-sm leading-6 text-slate-700">{note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="start">
        <div className="rounded-md border border-[#25472D] bg-[#355E3B] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold text-[#DDE8D7]">시작하기</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
            오늘 들어온 주문부터 SellerRoom에 정리해보세요.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
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
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-600 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-slate-950">
          SellerRoom
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <a href="#features" className="text-zinc-600 transition-colors hover:text-zinc-950">
            기능
          </a>
          <a href="#preview" className="text-zinc-600 transition-colors hover:text-zinc-950">
            미리보기
          </a>
          <a href="#start" className="text-zinc-600 transition-colors hover:text-zinc-950">
            시작하기
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            로그인
          </Link>
          <Link
            href={SIGN_UP_ROUTE}
            className="hidden min-h-10 items-center justify-center gap-2 rounded-md bg-[#355E3B] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#294A2E] sm:inline-flex"
          >
            시작하기
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
            주문·재고 정리,
            <br className="hidden sm:block" />
            엑셀보다 덜 헷갈리게
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8 text-zinc-800 sm:text-2xl">
            옵션별 재고, 주문접수 수량, 배송대기 상태를 한 화면에서 확인하세요.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            SellerRoom은 스마트스토어, 쿠팡, 인스타그램, 카카오톡 주문을 수동으로 모아 초기 셀러의 운영 흐름을 정리하는 내부 콘솔입니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["외부 채널 연동 없음", "주문접수는 예약 수량", "배송대기부터 재고 차감"].map((label) => (
              <span key={label} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[#E5D9BF] bg-white px-3 text-xs font-bold text-zinc-700">
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
              스토어 설정하고 시작하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#preview"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100"
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
      <div className="h-[420px] overflow-hidden rounded-md border border-[#E5D9BF] bg-white shadow-xl sm:h-[500px] lg:h-[520px]">
        <div className="flex min-h-12 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-slate-500">데모 콘솔 미리보기</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr] md:p-5">
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
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_180px]">
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">최근 주문</p>
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">데모</span>
                </div>
                <div className="overflow-hidden">
                  {[
                    ["ORD-1024", "린넨 셔츠 / 스카이", "주문접수", "예약 2"],
                    ["ORD-1023", "코튼 팬츠 / M", "배송대기", "차감 1"],
                    ["ORD-1022", "니트 백 / 크림", "배송중", "차감 완료"],
                    ["ORD-1021", "실버 링 / 12호", "취소", "복원 대기"]
                  ].map(([code, product, status, stock]) => (
                    <div key={code} className="grid grid-cols-[74px_1fr_68px_70px] border-b border-slate-100 px-4 py-3 text-xs last:border-b-0">
                      <span className="font-bold text-slate-800">{code}</span>
                      <span className="truncate text-slate-600">{product}</span>
                      <span className="font-semibold text-slate-700">{status}</span>
                      <span className="text-slate-500">{stock}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">재고 부족 SKU</p>
                <div className="mt-4 space-y-3">
                  {[
                    ["SKY-S", "가용 2"],
                    ["CREAM-BAG", "가용 4"],
                    ["RING-12", "가용 1"]
                  ].map(([sku, count]) => (
                    <div key={sku} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                      <span className="text-xs font-bold text-slate-800">{sku}</span>
                      <span className="text-xs font-semibold text-amber-700">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <article className="rounded-md border border-[#EFE7D2] bg-[#FFFDF6] p-5">
      <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{metric.detail}</p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold text-[#4F6F52]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
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
      <h3 className="mt-5 text-base font-bold text-slate-950">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
    </article>
  );
}

function InventoryPreview() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-bold text-slate-950">SKU 재고 상태</p>
          <p className="mt-1 text-xs text-slate-500">데모 화면 기준</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500">
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">현재 재고</th>
              <th className="px-3 py-3">주문접수</th>
              <th className="px-3 py-3">가용 재고</th>
              <th className="px-3 py-3">상태</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["SHIRT-SKY-S", "18", "4", "14", "정상"],
              ["SHIRT-SKY-M", "7", "3", "4", "주의"],
              ["BAG-CREAM", "4", "2", "2", "부족"],
              ["RING-12", "3", "2", "1", "부족"]
            ].map(([sku, stock, reserved, available, status]) => (
              <tr key={sku} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 font-bold text-slate-800">{sku}</td>
                <td className="px-3 py-3 text-slate-600">{stock}</td>
                <td className="px-3 py-3 text-slate-600">{reserved}</td>
                <td className="px-3 py-3 text-slate-900">{available}</td>
                <td className="px-3 py-3">
                  <StatusPill status={status} />
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
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "정상"
      ? "bg-emerald-50 text-emerald-700"
      : status === "주의"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${className}`}>{status}</span>;
}
