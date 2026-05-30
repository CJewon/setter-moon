import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { InventoryPreview } from "@/features/landing/components/landing-inventory-preview";
import { FeatureCard, SectionHeading } from "@/features/landing/components/landing-shared";
import { faqItems, features, problemPrompts, SIGN_IN_ROUTE, SIGN_UP_ROUTE, workflowSteps } from "@/features/landing/landing-content";

export function ProblemSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 scroll-mt-24" id="intro">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeading
          eyebrow="소개"
          title="혼자 운영해도 주문과 재고가 헷갈리지 않게 정리합니다."
          description="여러 판매 채널에서 들어온 주문을 직접 정리하고, 옵션별 재고까지 함께 봐야 하는 초기 1인 셀러에게 맞춘 관리 화면입니다."
          centered
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {problemPrompts.map((point) => (
            <article key={point.question} className="rounded-md border border-slate-200 bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold leading-6 text-slate-950">{point.question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{point.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureSection() {
  return (
    <section className="bg-white scroll-mt-24" id="features">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeading
          eyebrow="기능"
          title="상품 등록부터 배송 상태까지 한 흐름으로 이어집니다."
          description="처음부터 복잡한 ERP를 만들기보다 1인 셀러가 매일 확인해야 하는 상품, 재고, 주문 상태에 집중합니다."
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

export function WorkflowSection() {
  return (
    <section className="bg-slate-50" id="flow">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="흐름"
            title="주문접수와 재고 차감 시점을 나눠서 봅니다."
            description="주문접수는 예약 수량으로 보고, 배송 준비가 시작될 때 실제 재고가 줄어들도록 흐름을 단순하게 잡았습니다."
          />
          <ol className="mt-8 space-y-3">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="flex min-h-16 gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-700">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">{step.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{step.description}</span>
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

export function FaqSection() {
  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="지금 바로 쓸 수 있는 범위부터 제공합니다."
          description="자동 연동이나 결제처럼 무거운 기능보다, 당장 주문과 재고를 정리하는 데 필요한 범위에 집중합니다."
          centered
        />
        <div className="mt-8 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {faqItems.map((item) => (
            <article key={item.question} className="p-5">
              <h3 className="text-base font-bold text-slate-950">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-blue-600" id="start">
      <div className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-blue-100">무료 시작</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
          오늘 들어온 주문부터 SellerRoom으로 정리해보세요.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100">
          상품, 옵션별 재고, 주문 상태를 한곳에 모으고 다음 운영 기준을 빠르게 확인할 수 있습니다.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={SIGN_UP_ROUTE}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            무료 시작
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}
