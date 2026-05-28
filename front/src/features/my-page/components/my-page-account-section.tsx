import { cn } from "@/shared/utils/cn";

type MyPageAccountSectionProps = {
  displayName: string;
  displayNameError?: string;
  email: string;
};

export function MyPageAccountSection({ displayName, displayNameError, email }: MyPageAccountSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">계정 정보</h2>
          <p className="mt-1 text-sm text-slate-500">서비스 안에서 표시될 이름을 관리합니다.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="display-name">
          이름
          <input
            id="display-name"
            name="displayName"
            className={cn(
              "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              displayNameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
            defaultValue={displayName}
            maxLength={40}
            placeholder="예: 김셀러"
            aria-describedby={displayNameError ? "display-name-error" : undefined}
          />
          {displayNameError ? (
            <span id="display-name-error" className="text-xs text-red-700">
              {displayNameError}
            </span>
          ) : null}
        </label>
        <div className="grid gap-2 text-sm font-medium text-slate-800">
          이메일
          <p className="min-h-10 break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}
