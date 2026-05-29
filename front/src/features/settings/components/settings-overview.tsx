type SettingsOverviewProps = {
  businessType: string | null;
  storeName: string;
  updatedAt: string | null;
};

export function SettingsOverview({ businessType, storeName, updatedAt }: SettingsOverviewProps) {
  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-3">
      <OverviewCard title="스토어명" value={storeName} />
      <OverviewCard title="판매 채널" value={businessType || "선택 안 함"} />
      <OverviewCard title="최근 수정" value={formatDate(updatedAt)} />
    </section>
  );
}

function OverviewCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 break-words text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}
