import { salesChannels } from "@/features/stores/schemas/store-form-schema";
import { cn } from "@/shared/utils/cn";

type MyPageStoreSectionProps = {
  businessType: string | null;
  memo: string | null;
  memoError?: string;
  storeName: string;
  storeNameError?: string;
};

export function MyPageStoreSection({ businessType, memo, memoError, storeName, storeNameError }: MyPageStoreSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-950">스토어 정보</h2>
        <p className="mt-1 text-sm text-slate-500">운영 화면에서 기본으로 사용할 스토어 정보를 관리합니다.</p>
      </div>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="store-name">
          스토어명
          <input
            id="store-name"
            name="storeName"
            className={cn(
              "min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              storeNameError && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
            defaultValue={storeName}
            maxLength={60}
            required
            aria-describedby={storeNameError ? "store-name-error" : undefined}
          />
          {storeNameError ? (
            <span id="store-name-error" className="text-xs text-red-700">
              {storeNameError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="business-type">
          판매 채널
          <select
            id="business-type"
            name="businessType"
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            defaultValue={businessType ?? ""}
          >
            <option value="">선택 안 함</option>
            {salesChannels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="memo">
          메모
          <textarea
            id="memo"
            name="memo"
            className={cn(
              "min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              memoError && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
            defaultValue={memo ?? ""}
            maxLength={500}
            aria-describedby={memoError ? "memo-error" : undefined}
          />
          {memoError ? (
            <span id="memo-error" className="text-xs text-red-700">
              {memoError}
            </span>
          ) : null}
        </label>
      </div>
    </section>
  );
}
