"use client";

import type { OrderChangeLog } from "@/server/orders/types";

type OrderChangeHistoryProps = {
  logs: OrderChangeLog[];
};

function getValueText(value: string | null) {
  return value || "-";
}

export function OrderChangeHistory({ logs }: OrderChangeHistoryProps) {
  return (
    <section aria-labelledby="order-change-history-heading" className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950" id="order-change-history-heading">
            주문 수정 이력
          </h2>
          <p className="mt-1 text-sm text-slate-500">주문 내용이 바뀐 항목만 기록합니다.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {logs.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">아직 주문 수정 이력이 없습니다.</p>
        ) : (
          logs.map((log) => (
            <article key={log.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-semibold text-slate-900">{log.summary}</p>
                <time className="text-xs font-medium text-slate-500" dateTime={log.created_at}>
                  {new Date(log.created_at).toLocaleString("ko-KR")}
                </time>
              </div>
              <div className="mt-3 grid gap-2">
                {log.changes.map((change) => (
                  <div key={`${log.id}-${change.field}`} className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold text-slate-500">{change.label}</p>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-slate-700 sm:flex-row sm:items-center">
                      <span className="break-all text-slate-500">{getValueText(change.before)}</span>
                      <span className="hidden text-slate-400 sm:inline" aria-hidden="true">
                        →
                      </span>
                      <span className="break-all font-semibold text-slate-950">{getValueText(change.after)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
