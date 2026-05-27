import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignUpPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell title="계정 만들기" description="스토어 운영 정보를 안전하게 관리할 관리자 계정을 만듭니다.">
      <SignUpForm />
    </AuthShell>
  );
}
