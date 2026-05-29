import Link from "next/link";
import { secondaryActionClassName } from "@/shared/components/action-styles";
import { routes } from "@/shared/constants/routes";

export default function SettingsPage() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 text-slate-950 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-slate-500">기본 설정</p>
        <h2 className="mt-2 text-xl font-bold">계정과 스토어 정보는 마이페이지에서 관리합니다.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          지금 단계에서는 이름, 스토어명, 운영 메모, 플랜 사용량을 한곳에서 확인하도록 정리했습니다. 추가 설정이 필요해지면 이
          화면에서 바로 이어서 관리할 수 있게 연결하겠습니다.
        </p>
      </div>
      <div className="mt-5">
        <Link href={routes.myPage} className={secondaryActionClassName}>
          마이페이지로 이동
        </Link>
      </div>
    </section>
  );
}
