import type { Feature, Metric } from "@/features/landing/landing-content";

export function MetricPreview({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{metric.detail}</p>
    </article>
  );
}

export function SectionHeading({
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
      <p className="text-sm font-bold text-blue-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-bold text-slate-950">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
    </article>
  );
}
