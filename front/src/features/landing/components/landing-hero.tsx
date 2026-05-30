import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Boxes, CheckCircle2, ClipboardList, Package } from "lucide-react";
import { demoOrders, heroBadges, lowStockPreview, SIGN_UP_ROUTE } from "@/features/landing/landing-content";

export function HeroSection() {
  return (
    <section className="scroll-mt-28 border-b border-slate-200 bg-white" id="intro">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex min-h-9 items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700">
            1인 셀러를 위한 주문·재고 관리
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            <span className="text-blue-600">주문과 재고를</span>{" "}
            <br className="hidden sm:block" />
            한 화면에서 가볍게
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-800 sm:text-2xl">
            상품, 옵션별 재고, 주문 상태를 매일 보기 쉬운 흐름으로 정리합니다.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            SellerRoom은 스마트스토어, 쿠팡, 인스타그램, 카카오톡처럼 여러 판매 채널에서 들어온 운영 정보를
            한곳에 모으는 무료 관리 도구입니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {heroBadges.map((label) => (
              <span
                key={label}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={SIGN_UP_ROUTE}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              무료 시작
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              둘러보기
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
    <div className="pointer-events-none relative mx-auto mt-10 w-full max-w-6xl">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="flex min-h-12 items-center border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="h-3 w-3 rounded-full bg-slate-400" />
            <span className="h-3 w-3 rounded-full bg-blue-500" />
          </div>
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
            <div className="mb-4 border-b border-slate-200 pb-4">
              <p className="text-lg font-bold text-slate-950">대시보드</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                오늘 주문, 판매금액, 부족 재고를 빠르게 확인합니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PreviewStat label="오늘 주문" value="12건" tone="neutral" />
              <PreviewStat label="주문접수" value="7건" tone="blue" />
              <PreviewStat label="배송대기" value="5건" tone="dark" />
              <PreviewStat label="부족 재고" value="3개" tone="neutral" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">최근 주문</p>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">상태 확인</span>
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
                        <span className="text-xs font-semibold text-blue-700">{order.status}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-700">{order.product}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.stockEffect}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">부족 재고</p>
                  <div className="mt-4 space-y-3">
                    {lowStockPreview.map((item) => (
                      <div key={item.optionLabel} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                        <span className="text-xs font-bold text-slate-800">{item.optionLabel}</span>
                        <span className="text-xs font-semibold text-blue-700">{item.available}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-900">재고 차감</p>
                  <p className="mt-3 text-xs leading-5 text-blue-700">
                    주문접수는 예약 수량으로 보고, 배송대기부터 실제 재고를 줄입니다.
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

function PreviewNav({ active = false, icon: Icon, label }: { active?: boolean; icon: LucideIcon; label: string }) {
  return (
    <div className={active ? "flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white" : "flex items-center gap-2 rounded-md px-3 py-2"}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function PreviewStat({ label, value, tone }: { label: string; value: string; tone: "neutral" | "blue" | "dark" }) {
  const toneClass = {
    neutral: "bg-slate-100 text-slate-800",
    blue: "bg-blue-50 text-blue-700",
    dark: "bg-slate-950 text-white"
  }[tone];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
