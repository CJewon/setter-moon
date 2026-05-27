import { AppShell } from "@/shared/components/app-shell";
import { requireDashboardAccess } from "@/server/auth/session";
import { getDashboardSummary } from "@/server/dashboard/summary";
import { createClient } from "@/shared/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await requireDashboardAccess();
  const supabase = await createClient();
  const summary = await getDashboardSummary(supabase, access.store);

  return (
    <AppShell access={access} summary={summary}>
      {children}
    </AppShell>
  );
}
