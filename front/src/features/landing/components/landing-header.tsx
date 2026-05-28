import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGN_IN_ROUTE, SIGN_UP_ROUTE } from "@/features/landing/landing-content";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-slate-950">
          SellerRoom
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <a href="#problem" className="text-slate-600 transition-colors hover:text-slate-950">
            문제
          </a>
          <a href="#flow" className="text-slate-600 transition-colors hover:text-slate-950">
            작동 방식
          </a>
          <a href="#preview" className="text-slate-600 transition-colors hover:text-slate-950">
            데모 화면
          </a>
          <a href="#plan" className="text-slate-600 transition-colors hover:text-slate-950">
            요금제
          </a>
        </nav>
        <div className="flex items-center gap-2">
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
            무료로 시작하기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
