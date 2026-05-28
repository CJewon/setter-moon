import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignUpPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      title="계정 만들기"
      description="이메일로 계정을 만들고, 가입 후 스토어 정보를 입력합니다."
      size="wide"
    >
      <SignUpForm />
    </AuthShell>
  );
}
