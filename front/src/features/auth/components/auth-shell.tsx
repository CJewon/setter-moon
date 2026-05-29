import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  supportTitle?: string;
  supportItems?: string[];
  size?: "default" | "wide";
};

export function AuthShell({ title, description, children, supportTitle, supportItems, size = "default" }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section
        className={cn(
          "mx-auto flex min-h-[calc(100vh-4rem)] w-full flex-col justify-center",
          size === "wide" ? "max-w-110" : "max-w-100"
        )}
      >
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="SellerRoom 홈으로 이동" className="flex w-fit flex-col items-center gap-2 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-600 text-base font-black text-white shadow-sm">
              SR
            </span>
            <span className="text-lg font-bold text-slate-950">SellerRoom</span>
          </Link>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          {children}
        </div>

        {supportTitle && supportItems?.length ? (
          <div className="mt-4 rounded-md border border-slate-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-900">{supportTitle}</p>
            <ol className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
              {supportItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>
    </main>
  );
}
