import { SignInForm } from "@/features/auth/components/sign-in-form";
import { redirectAuthenticatedUser } from "@/server/auth/session";

export default async function SignInPage() {
  await redirectAuthenticatedUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-2 text-sm text-slate-600">상품, 재고, 주문 상태를 이어서 관리하세요.</p>
      <SignInForm />
    </main>
  );
}
