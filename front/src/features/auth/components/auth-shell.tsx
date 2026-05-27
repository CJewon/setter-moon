import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const trustItems = [
  "회원가입은 계정 생성에 필요한 최소 정보만 받습니다.",
  "스토어명과 판매 채널은 가입 후 온보딩에서 설정합니다.",
  "로그인 세션은 Supabase SSR 쿠키로 서버에서 확인합니다."
];

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-950">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white">
              SR
            </span>
            SellerRoom
          </Link>
          <div className="mt-8 max-w-md">
            <p className="text-sm font-semibold text-blue-700">계정 보안</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">필요한 정보만 받고 안전하게 시작합니다.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              상품, 재고, 주문 흐름은 계정 생성 후 스토어 온보딩에서 이어집니다.
            </p>
            <ul className="mt-6 space-y-3">
              {trustItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <CheckCircle2 aria-hidden className="mt-0.5 shrink-0 text-blue-600" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-950 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white">
              SR
            </span>
            SellerRoom
          </Link>
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 sm:inline-flex">
                <ShieldCheck aria-hidden size={20} />
              </div>
            </div>
            {children}
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <LockKeyhole aria-hidden className="mt-0.5 shrink-0 text-slate-400" size={14} />
              암호화된 연결로 안전하게 처리됩니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
