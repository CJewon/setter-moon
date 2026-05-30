type SettingsSubmitBarProps = {
  isDirty: boolean;
  pending: boolean;
};

export function SettingsSubmitBar({ isDirty, pending }: SettingsSubmitBarProps) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        className="inline-flex min-h-10 w-auto items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending || !isDirty}
      >
        {pending ? "저장 중" : "저장"}
      </button>
    </div>
  );
}
