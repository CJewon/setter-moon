"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DashboardTrendItem } from "@/server/dashboard/summary";
import { formatNumber, formatWon } from "@/shared/lib/format";

type DashboardSalesChartProps = {
  data: DashboardTrendItem[];
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    payload: DashboardTrendItem;
    value: number;
  }>;
};

function formatAxisWon(value: number) {
  if (value >= 10000) {
    return `${formatNumber(Math.round(value / 10000))}만`;
  }

  if (value === 0) {
    return "0";
  }

  return formatNumber(value);
}

function SalesChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-slate-600">판매금액 {formatWon(item.salesAmount)}</p>
      <p className="mt-0.5 text-slate-500">주문 {formatNumber(item.orderCount)}건</p>
    </div>
  );
}

export function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  const hasSales = data.some((item) => item.salesAmount > 0);

  return (
    <div className="mt-4 rounded-md bg-slate-50 px-2 py-4 sm:mt-5 sm:px-3 sm:py-5">
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ bottom: 22, left: 2, right: 14, top: 12 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              dy={12}
              height={42}
              interval={0}
              label={{
                fill: "#64748b",
                fontSize: 12,
                offset: -8,
                position: "insideBottom",
                value: "날짜"
              }}
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              domain={hasSales ? [0, "dataMax"] : [0, 10000]}
              label={{
                angle: -90,
                fill: "#64748b",
                fontSize: 12,
                position: "insideLeft",
                style: { textAnchor: "middle" },
                value: "판매금액"
              }}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value: number) => formatAxisWon(value)}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<SalesChartTooltip />} cursor={{ stroke: "#93c5fd", strokeDasharray: "4 4" }} />
            <Line
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
              dataKey="salesAmount"
              dot={{ fill: "#2563eb", r: 4, stroke: "#ffffff", strokeWidth: 2 }}
              name="판매금액"
              stroke="#2563eb"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-500">
        <span>가로축: 날짜</span>
        <span>세로축: 판매금액</span>
      </div>
    </div>
  );
}
