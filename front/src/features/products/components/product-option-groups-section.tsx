import type { ProductOptionGroupDraft } from "@/features/products/types/product-create-draft";

type ProductOptionGroupsSectionProps = {
  addOptionGroup: () => void;
  addOptionValue: (groupId: string) => void;
  optionGroups: ProductOptionGroupDraft[];
  optionGroupsError?: string;
  removeOptionGroup: (groupId: string) => void;
  removeOptionValue: (groupId: string, index: number) => void;
  updateOptionGroup: (groupId: string, value: string) => void;
  updateOptionValue: (groupId: string, index: number, value: string) => void;
};

export function ProductOptionGroupsSection({
  addOptionGroup,
  addOptionValue,
  optionGroups,
  optionGroupsError,
  removeOptionGroup,
  removeOptionValue,
  updateOptionGroup,
  updateOptionValue
}: ProductOptionGroupsSectionProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">옵션 그룹과 옵션값</h2>
          <p className="mt-1 text-sm text-slate-500">예: 색상은 블랙/아이보리, 사이즈는 S/M/L처럼 입력합니다.</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={addOptionGroup}
        >
          옵션 그룹 추가
        </button>
      </div>
      {optionGroupsError ? <p className="mt-3 text-xs text-red-700">{optionGroupsError}</p> : null}
      <div className="mt-5 grid gap-4">
        {optionGroups.map((group) => (
          <div key={group.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="grid flex-1 gap-2 text-sm font-medium text-slate-800">
                옵션 그룹명
                <input
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={group.name}
                  onChange={(event) => updateOptionGroup(group.id, event.target.value)}
                  placeholder="예: 색상"
                />
              </label>
              <button
                type="button"
                className="min-h-10 rounded-md px-3 text-sm font-semibold text-red-700 hover:bg-red-50 sm:self-end"
                onClick={() => removeOptionGroup(group.id)}
              >
                삭제
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {group.values.map((value, index) => (
                <div key={`${group.id}-${index}`} className="flex gap-2">
                  <input
                    className="min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={value}
                    onChange={(event) => updateOptionValue(group.id, index, event.target.value)}
                    placeholder="예: 블랙"
                  />
                  <button
                    type="button"
                    className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white"
                    onClick={() => removeOptionValue(group.id, index)}
                  >
                    제거
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-fit min-h-9 rounded-md px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                onClick={() => addOptionValue(group.id)}
              >
                옵션값 추가
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
