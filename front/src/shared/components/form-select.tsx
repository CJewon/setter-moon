import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function FormSelect({ className, hasError, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition",
        "hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
        hasError && "border-red-300 focus:border-red-500 focus:ring-red-100",
        className
      )}
      {...props}
    />
  );
}
