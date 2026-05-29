type MyPageOverviewProps = {
  displayName: string;
  email: string;
};

export function MyPageOverview({ displayName, email }: MyPageOverviewProps) {
  const displayNameLabel = displayName || "사용자";

  return (
    <section className="mb-5 rounded-md border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-500">현재 접속 계정</p>
          <h2 className="mt-1 break-words text-2xl font-bold tracking-normal text-slate-950">{displayNameLabel}</h2>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">로그인 이메일</p>
          <p className="mt-1 break-all text-lg font-bold text-slate-950">{email}</p>
        </div>
      </div>
    </section>
  );
}
