import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignUpPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      title="계정 만들기"
      description="이메일로 계정을 만들고, 스토어 정보는 다음 단계에서 입력합니다."
      supportTitle="가입 후 첫 설정"
      supportItems={["1. 스토어 이름 입력", "2. 첫 상품 등록", "3. 옵션별 재고 입력"]}
      size="wide"
    >
      <SignUpForm />
    </AuthShell>
  );
}
