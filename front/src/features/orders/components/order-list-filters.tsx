import type { OrderSort } from "@/server/orders/service";
import type { OrderStatus } from "@/server/orders/types";
import { routes } from "@/shared/constants/routes";

type OrderListFiltersProps = {
  customerKeyword: string;
  fromDate: string;
  pageSize: number;
  productKeyword: string;
  selectedStatus?: OrderStatus;
  sort: OrderSort;
  toDate: string;
};

export function OrderListFilters({ customerKeyword, fromDate, pageSize, productKeyword, selectedStatus, sort, toDate }: OrderListFiltersProps) {
  return (
    <form
      action={routes.orders}
      className="mb-3 grid gap-2.5 rounded-md border border-slate-200 bg-white/80 p-2.5 shadow-sm sm:mb-4 sm:grid-cols-2 sm:p-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.95fr)]"
      data-testid="order-list-filters"
    >
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={pageSize} />
      {selectedStatus ? <input type="hidden" name="status" value={selectedStatus} /> : null}
      <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
        고객/주문번호
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          defaultValue={customerKeyword}
          name="customerKeyword"
          placeholder="고객명 또는 주문번호"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
        상품/옵션
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          defaultValue={productKeyword}
          name="productKeyword"
          placeholder="상품명 또는 옵션"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
        시작일
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          defaultValue={fromDate}
          name="fromDate"
          type="date"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
        종료일
        <input
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          defaultValue={toDate}
          name="toDate"
          type="date"
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold text-slate-600">
        정렬
        <select
          className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          defaultValue={sort}
          name="sort"
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </label>
      <div className="grid min-w-0 grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1 xl:self-end">
        <button
          className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
          type="submit"
        >
          검색
        </button>
        <a
          className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          href={routes.orders}
        >
          초기화
        </a>
      </div>
    </form>
  );
}
