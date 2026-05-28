import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { InventoryPreview } from "@/features/landing/components/landing-inventory-preview";
import { FeatureCard, MetricPreview, SectionHeading } from "@/features/landing/components/landing-shared";
import {
  comparisonRows,
  demoMetrics,
  faqItems,
  features,
  problemPrompts,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  targetUsers,
  trustPrinciples,
  workflowSteps
} from "@/features/landing/landing-content";

export function TrustPrinciplesSection() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-blue-700">무료 플랜의 신뢰 방식</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            한도와 운영 원칙을 먼저 투명하게 보여줍니다.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            셀러룸은 무료로 시작해도 스토어와 배송 상태 흐름을 동일하게 제공하고, 사용량 한도를 명확하게 공개합니다.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {trustPrinciples.map((principle) => (
            <article key={principle.title} className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-3xl font-bold text-blue-600">{principle.value}</p>
              <h3 className="mt-4 text-base font-bold text-slate-950">{principle.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{principle.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsSection() {
  return (
    <section id="preview" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-blue-700">예시 데이터 기준</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            오늘 처리할 주문과 재고를 먼저 봅니다.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
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

export function BeforeAfterSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-blue-700">운영 방식 비교</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
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
          <div className="rounded-md border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-700">SellerRoom</p>
            <ul className="mt-5 space-y-3">
              {comparisonRows.map((row) => (
                <li key={row.sellerRoom} className="flex gap-3 text-sm leading-6 text-blue-950">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
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

export function ProblemSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50" id="problem">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="혹시 이런 경험 있으시죠?"
          title="초기 셀러가 매일 겪는 주문·재고 혼선을 줄입니다."
          description="위노트가 상담자의 반복 업무를 질문으로 꺼내 보여주듯, 셀러룸도 실제 운영자가 자주 부딪히는 장면부터 해결합니다."
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
    <section className="bg-white" id="features">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="핵심 기능"
          title="상품 등록부터 배송 상태까지 한 흐름으로 봅니다."
          description="초기 버전은 상품, 옵션별 재고, 주문 상태, 대시보드에 집중합니다."
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
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="작동 방식"
            title="주문과 재고가 만나는 순간을 분리해서 보여줍니다."
            description="주문접수와 배송대기의 재고 영향을 다르게 잡아, 언제 예약이고 언제 실제 차감인지 더 분명하게 확인합니다."
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

export function TargetUsersSection() {
  return (
    <section className="border-y border-slate-200 bg-white">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-600">
                <target.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-950">{target.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{target.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="bg-white" id="faq">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="자주 묻는 질문"
          title="지금 제공하는 범위와 다음 확장 범위를 정리했습니다."
          description="셀러룸이 지금 제공하는 범위와 아직 약속하지 않는 범위를 분명하게 나눕니다."
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
      <div className="mx-auto max-w-7xl px-4 py-14 text-white sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-blue-100">시작하기</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
          오늘 들어온 주문부터 SellerRoom으로 정리해보세요.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100">
          상품, 옵션별 재고, 주문 상태를 한곳에 모으고 다음 운영 기준을 더 빠르게 확인할 수 있습니다.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={SIGN_UP_ROUTE}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            첫 주문 정리 시작하기
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
