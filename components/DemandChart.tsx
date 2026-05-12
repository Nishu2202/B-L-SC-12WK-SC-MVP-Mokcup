"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useAppState, ChartView } from "@/lib/app-state";
import { AGGREGATE_DAILY_DATA, DailyPoint } from "@/lib/mock-data";
import { cn, formatNumber } from "@/lib/utils";

const VIEW_TABS: { id: ChartView; label: string }[] = [
  { id: "aggregate", label: "Aggregate" },
  { id: "sku", label: "Selected SKU" },
  { id: "month", label: "Month View" },
  { id: "history", label: "History" },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#334155] mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#64748b]">{p.name}:</span>
          <span className="font-semibold text-[#0f172a]">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function SpikeLabel({ viewBox }: { viewBox?: { x: number; y: number; width: number; height: number } }) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <rect x={x - 30} y={y - 24} width={72} height={18} rx={4} fill="#f97316" fillOpacity={0.15} />
      <text x={x + 6} y={y - 11} fill="#ea580c" fontSize={10} fontWeight={600}>
        Spike
      </text>
    </g>
  );
}

export default function DemandChart() {
  const { selectedSKU, chartView, setChartView } = useAppState();

  const chartData = useMemo<DailyPoint[]>(() => {
    if (chartView === "aggregate" || chartView === "month") {
      return AGGREGATE_DAILY_DATA;
    }
    if (chartView === "sku" && selectedSKU) {
      return selectedSKU.dailyData;
    }
    // History: use aggregate but show 30 days
    return AGGREGATE_DAILY_DATA;
  }, [chartView, selectedSKU]);

  const formattedData = useMemo(
    () =>
      chartData.map((d) => ({
        ...d,
        dateLabel: d.date.slice(5), // MM-DD
      })),
    [chartData]
  );

  const spikeIndex = formattedData.findIndex((d) => d.spike);
  const spikePoint = spikeIndex >= 0 ? formattedData[spikeIndex] : null;

  const isSkuView = (chartView === "sku" || chartView === "month") && selectedSKU;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0f172a]">
            {isSkuView
              ? `${selectedSKU!.name} — Demand Profile`
              : "Expected Profile vs. Actual Orders"}
          </h3>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            {isSkuView
              ? `${selectedSKU!.category} · ${selectedSKU!.segment}`
              : "Aggregate across all SKUs · April 2025"}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-[#f1f5f9] rounded-lg p-0.5 gap-0.5">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChartView(tab.id)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all",
                chartView === tab.id
                  ? "bg-white text-[#0e7490] shadow-sm"
                  : "text-[#64748b] hover:text-[#334155]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={chartView + (selectedSKU?.id ?? "agg")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-52 w-full"
      >
        <ResponsiveContainer width="100%" height={208}>
          <AreaChart data={formattedData} margin={{ top: 8, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e7490" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#0e7490" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#bandGradient)"
              legendType="none"
              name="Upper band"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="white"
              legendType="none"
              name="Lower band"
              tooltipType="none"
            />

            {/* Expected */}
            <Line
              type="monotone"
              dataKey="expected"
              stroke="#0e7490"
              strokeWidth={2}
              dot={false}
              name="Expected profile"
              strokeDasharray="4 2"
            />

            {/* Actual */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              name="Actual orders"
            />

            {/* Spike reference line */}
            {spikePoint && (
              <ReferenceLine
                x={spikePoint.dateLabel}
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={<SpikeLabel />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 border-t border-[#f1f5f9]">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-px bg-[#0e7490] block" style={{ borderTop: "2px dashed #0e7490" }} />
          <span className="text-[10px] text-[#64748b]">Expected profile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-[#f97316] rounded block" />
          <span className="text-[10px] text-[#64748b]">Actual orders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-3 rounded" style={{ background: "rgba(14,116,144,0.1)" }} />
          <span className="text-[10px] text-[#64748b]">Confidence band</span>
        </div>
        {spikePoint && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-red-600 font-medium">Spike detected Apr {spikePoint.date.slice(8)}</span>
          </div>
        )}
      </div>

      {/* SKU-level metrics row */}
      {isSkuView && selectedSKU && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-4 gap-2 pt-2 border-t border-[#f1f5f9]"
        >
          {[
            { label: "Month Forecast", value: selectedSKU.currentMonthForecast.toLocaleString() },
            { label: "Month Actuals", value: selectedSKU.currentMonthActual.toLocaleString() },
            { label: "Month-End Projection", value: selectedSKU.projectedMonthEnd.toLocaleString() },
            {
              label: "Forecast Gap",
              value: (selectedSKU.forecastGap > 0 ? "+" : "") + selectedSKU.forecastGap.toLocaleString(),
              highlight: selectedSKU.forecastGap > 0 ? "text-amber-600" : "text-emerald-600",
            },
          ].map((m, i) => (
            <div key={i} className="text-center bg-[#f8fafc] rounded-lg py-2 px-1">
              <p className={`text-sm font-bold ${m.highlight ?? "text-[#0f172a]"}`}>{m.value}</p>
              <p className="text-[9px] text-[#94a3b8] mt-0.5">{m.label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
