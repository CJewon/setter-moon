import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignUpPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold">계정 만들기</h1>
      <p className="mt-2 text-sm text-slate-600">스토어 운영 정보를 안전하게 관리할 관리자 계정을 만듭니다.</p>
      <SignUpForm />
    </main>
  );
}
