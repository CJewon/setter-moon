import { AuthShell } from "@/features/auth/components/auth-shell";
import { FindIdForm } from "@/features/auth/components/find-id-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function FindIdPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell title="아이디 찾기" description="가입할 때 입력한 이름과 스토어명을 확인해 주세요.">
      <FindIdForm />
    </AuthShell>
  );
}
