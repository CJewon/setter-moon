import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Boxes, ClipboardList, Package, Settings } from "lucide-react";
import type { DashboardSummary } from "@/server/dashboard/summary";
import { getUserDisplayName } from "@/server/profiles/service";
import type { AppAccess } from "@/server/auth/session";
import { formatNumber } from "@/shared/lib/format";
import { SignOutButton } from "@/shared/components/sign-out-button";
import { UserMenu } from "@/shared/components/user-menu";

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

const summaryItems = [
  { label: "오늘 주문", key: "todayOrders", href: "/orders" },
  { label: "주문접수", key: "receivedOrders", href: "/orders?status=received" },
  { label: "배송대기", key: "readyToShipOrders", href: "/orders?status=ready_to_ship" },
  { label: "배송중", key: "shippingOrders", href: "/orders?status=shipping" }
] as const;

type AppShellProps = {
  access: Extract<AppAccess, { isSupabaseConfigured: true }>;
  summary: DashboardSummary;
  children: React.ReactNode;
};

export function AppShell({ access, summary, children }: AppShellProps) {
  const displayName = access.user ? getUserDisplayName(access.user, access.profile) ?? "사용자" : "사용자";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-white px-4 py-5 lg:block">
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
        <div className="absolute bottom-5 left-4 right-4">
          <SignOutButton />
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <Link href="/dashboard" className="font-bold lg:hidden">
                SellerRoom
              </Link>
              <div className="lg:hidden">
                <UserMenu displayName={displayName} email={access.user?.email ?? access.profile?.email ?? null} storeName={access.store?.name ?? null} />
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 text-xs text-slate-600 lg:hidden">
              {navItems.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 rounded px-2 py-1 hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-1">
              {summaryItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="min-w-28 rounded-md border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                >
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                  <p className="mt-1 text-base font-bold text-slate-950">{formatNumber(summary[item.key])}</p>
                </Link>
              ))}
            </div>
            <div className="hidden lg:ml-auto lg:block">
              <UserMenu displayName={displayName} email={access.user?.email ?? access.profile?.email ?? null} storeName={access.store?.name ?? null} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
