import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  action?: {
    href: Route;
    label: string;
  };
  backLink?: {
    href: Route;
    label: string;
  };
  description?: string;
  title: string;
};

export function PageHeader({ title, description, action, backLink }: PageHeaderProps) {
  return (
    <div className="mb-6 grid gap-4">
      {backLink ? (
        <Link href={backLink.href} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLink.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p> : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
