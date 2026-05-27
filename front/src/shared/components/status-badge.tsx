import { cn } from "@/shared/utils/cn";

type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClassName: Record<StatusBadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700"
};

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: StatusBadgeTone;
}) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-semibold", toneClassName[tone])}>
      {children}
    </span>
  );
}
