import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { primaryActionClassName, secondaryActionClassName } from "@/shared/components/action-styles";

type PageAction = {
  href: Route;
  label: string;
  variant?: "primary" | "secondary";
};

type PageActionBarProps = {
  actions?: PageAction[];
  backLink?: {
    href: Route;
    label: string;
  };
};

export function PageActionBar({ actions = [], backLink }: PageActionBarProps) {
  if (!backLink && actions.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backLink ? (
          <Link
            href={backLink.href}
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md px-1 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLink.label}
          </Link>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {actions.map((action) => (
            <Link
              href={action.href}
              className={action.variant === "secondary" ? secondaryActionClassName : primaryActionClassName}
              key={action.label}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
