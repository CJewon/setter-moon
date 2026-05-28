import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell title="비밀번호 찾기" description="가입한 이메일을 입력하면 재설정 요청을 접수합니다.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
