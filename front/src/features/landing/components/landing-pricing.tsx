import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/features/landing/components/landing-shared";
import {
  FREE_PLAN_SUMMARY,
  PAID_FULL_SUMMARY,
  PLAN_PRICE_LABEL,
  PRICING_COMPARISON_ROWS,
  PRICING_PLANS,
  SIGN_UP_ROUTE,
  type PricingComparisonRow,
  type PricingPlan
} from "@/features/landing/landing-content";

export function PlanSection() {
  return (
    <section className="bg-white scroll-mt-24" id="plan">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeading
          title={`무료로 시작하고, ${PLAN_PRICE_LABEL} 확장 플랜으로 한도를 해제합니다.`}
          description={`무료 플랜은 ${FREE_PLAN_SUMMARY} ${PAID_FULL_SUMMARY} 스토어 기능과 배송 상태 관리는 두 플랜 모두 동일하게 제공합니다.`}
          centered
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <PricingComparisonTable rows={PRICING_COMPARISON_ROWS} />

        <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          월 신규 주문 한도는 주문 등록 기준입니다. 이미 만든 주문의 상태 변경은 한도 도달 후에도 계속 진행할 수 있습니다.
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isPaid = plan.tone === "paid";
  const articleClassName = isPaid
    ? "relative rounded-md border border-blue-500 bg-blue-50 p-6 shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
    : "relative rounded-md border border-blue-100 bg-white p-6";
  const ctaClassName = isPaid
    ? "mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    : "mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50";

  return (
    <article className={articleClassName}>
      <h3 className="text-2xl font-bold text-slate-950">{plan.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
      <div className="mt-5 border-y border-slate-200 py-5">
        <p className="text-4xl font-bold text-slate-950">{plan.price}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">{plan.priceCaption}</p>
      </div>
      <ul className="mt-5 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={SIGN_UP_ROUTE} className={ctaClassName}>
        {plan.ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function PricingComparisonTable({ rows }: { rows: readonly PricingComparisonRow[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
            <th className="px-4 py-3">비교 항목</th>
            <th className="px-4 py-3">무료</th>
            <th className="px-4 py-3">확장</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
              <th scope="row" className="px-4 py-3 font-bold text-slate-900">
                {row.label}
              </th>
              <td className="px-4 py-3 text-slate-600">{row.free}</td>
              <td className="px-4 py-3 font-semibold text-blue-700">{row.paid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
