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
          서비스 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
      <StoreOnboardingForm />
    </main>
  );
}
