import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGN_IN_ROUTE, SIGN_UP_ROUTE } from "@/features/landing/landing-content";

const navItems = [
  { href: "#intro", label: "소개" },
  { href: "#features", label: "기능" },
  { href: "#workflow", label: "운영 흐름" },
  { href: "#pricing", label: "요금" }
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-500 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        상품 10개와 월 신규 주문 300건까지 무료로 시작하세요
      </div>
      <div className="mx-auto grid h-16 w-full max-w-[1760px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 sm:px-6 lg:px-10 2xl:px-12">
        <Link href="/" className="justify-self-start text-lg font-bold text-slate-950">
          SellerRoom
        </Link>
        <nav className="hidden items-center gap-6 justify-self-center text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-slate-600 transition-colors hover:text-slate-950">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={SIGN_IN_ROUTE}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            로그인
          </Link>
          <Link
            href={SIGN_UP_ROUTE}
            className="hidden min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:inline-flex"
          >
            무료 시작
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
