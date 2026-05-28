import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BarChart3, Boxes, CheckCircle2, ClipboardList, Package } from "lucide-react";
import { demoOrders, heroBadges, lowStockPreview, SIGN_UP_ROUTE } from "@/features/landing/landing-content";

export function HeroSection() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex min-h-9 items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700">
            초기 셀러를 위한 상품·재고·주문 운영 콘솔
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            주문과 재고를{" "}
            <br className="hidden sm:block" />
            한 화면에서 덜 헷갈리게
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-800 sm:text-2xl">
            옵션별 재고, 주문접수 예약 수량, 배송대기 차감을 한 흐름으로 확인하세요.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            SellerRoom은 여러 판매 채널의 주문을 수동으로 모아 초기 셀러가 매일 확인해야 하는 상품, 옵션별 재고, 주문 상태를 정리하는 무료 운영 콘솔입니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {heroBadges.map((label) => (
              <span
                key={label}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
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
              스토어 만들고 시작하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#preview"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
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
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="flex min-h-12 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="h-3 w-3 rounded-full bg-slate-400" />
            <span className="h-3 w-3 rounded-full bg-blue-500" />
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
              <PreviewStat label="재고 부족" value="3개" tone="blue" />
              <PreviewStat label="배송대기" value="5건" tone="dark" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">최근 주문</p>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">데모</span>
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
                  <p className="text-sm font-bold text-slate-900">부족 옵션</p>
                  <div className="mt-4 space-y-3">
                    {lowStockPreview.map((item) => (
                      <div key={item.sku} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
                        <span className="text-xs font-bold text-slate-800">{item.sku}</span>
                        <span className="text-xs font-semibold text-blue-700">{item.available}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-900">상태 변경 영향</p>
                  <p className="mt-3 text-xs leading-5 text-blue-700">
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
