import Link from "next/link";
import type { Route } from "next";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    href: Route;
    label: string;
  };
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
  );
}
