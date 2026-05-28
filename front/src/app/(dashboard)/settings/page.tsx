import { PageHeader } from "@/shared/components/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" description="스토어 정보와 기본 운영 설정을 관리합니다." />
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
        스토어 이름과 운영 메모는 마이페이지에서 수정할 수 있습니다.
      </div>
    </>
  );
}
