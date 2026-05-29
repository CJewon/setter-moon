import { EmptyState } from "@/shared/components/empty-state";

type QueryStateProps = {
  description?: string;
  title: string;
};

export function QueryLoadingState({ description = "잠시만 기다려 주세요.", title }: QueryStateProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-10 text-center">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function QueryErrorState({ description = "새로고침 후 다시 시도해 주세요.", title }: QueryStateProps) {
  return <EmptyState title={title} description={description} />;
}
