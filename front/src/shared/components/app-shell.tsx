import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Boxes, ClipboardList, LogOut, Package, Settings } from "lucide-react";
import { signOutAction } from "@/features/auth/actions/auth-actions";

type NavItem = {
  href: Route;
  label: string;
  icon: typeof BarChart3;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/products", label: "상품", icon: Package },
  { href: "/inventory", label: "재고", icon: Boxes },
  { href: "/orders", label: "주문", icon: ClipboardList },
  { href: "/settings", label: "설정", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="block rounded-md px-3 py-2">
          <span className="text-lg font-bold">SellerRoom</span>
          <span className="mt-1 block text-xs text-slate-500">상품, 재고, 주문 관리</span>
        </Link>
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className="absolute bottom-5 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            로그아웃
          </button>
        </form>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-bold">
              SellerRoom
            </Link>
            <nav className="flex gap-2 text-xs text-slate-600">
              {navItems.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className="rounded px-2 py-1 hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
