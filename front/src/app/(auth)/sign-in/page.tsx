import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignInPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell title="로그인" description="상품, 재고, 주문 현황을 이어서 관리하세요.">
      <SignInForm />
    </AuthShell>
  );
}
