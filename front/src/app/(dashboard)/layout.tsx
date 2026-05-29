import { AppShell } from "@/shared/components/app-shell";
import { requireDashboardAccess } from "@/server/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAccess();

  return <AppShell>{children}</AppShell>;
}
