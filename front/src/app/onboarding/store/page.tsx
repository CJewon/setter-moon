import { PageHeader } from "@/shared/components/page-header";
import { StoreOnboardingForm } from "@/features/stores/components/store-onboarding-form";
import { requireOnboardingAccess } from "@/server/auth/session";

export default async function StoreOnboardingPage() {
  const access = await requireOnboardingAccess();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <PageHeader title="스토어 설정" description="상품과 주문을 관리할 작업 공간을 만듭니다." />
      {!access.isSupabaseConfigured ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase 환경 변수가 아직 설정되지 않았습니다. `.env.local` 설정 후 스토어 생성이 가능합니다.
        </p>
      ) : null}
      <StoreOnboardingForm />
    </main>
  );
}
