"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  Line,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { cn } from "@/lib/utils";
import type { SkuData, DailyDataPoint } from "@/lib/mock-data";

type ViewMode = "aggregate" | "sku" | "month" | "history";

interface DemandChartProps {
  selectedSku: SkuData | null;
  aggregateData: DailyDataPoint[];
}

const formatK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-sidebar-bg)] border border-slate-700 rounded-lg px-3 py-2.5 shadow-xl text-[11px]">
      <div className="text-slate-400 mb-2 font-medium">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="text-white font-semibold ml-auto pl-3">{formatK(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DemandChart({ selectedSku, aggregateData }: DemandChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("aggregate");

  const modes: { id: ViewMode; label: string }[] = [
    { id: "aggregate", label: "Aggregate" },
    { id: "sku", label: "Selected SKU" },
    { id: "month", label: "Month View" },
    { id: "history", label: "History" },
  ];

  const data = viewMode === "aggregate" || !selectedSku ? aggregateData : selectedSku.history;

  // Last 3 data points = spike zone (2 Days)
  const spikeDateStart = data.length >= 4 ? data[data.length - 4].date : null;
  const spikeDateEnd = data[data.length - 1].date;

  // Calculate Y-axis domain to better show variation
  const allValues = data.flatMap(d => [d.expected, d.actual, d.upper ?? 0].filter(v => v > 0));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.15;
  const yMin = Math.max(0, Math.floor((minVal - padding) / 1000) * 1000);
  const yMax = Math.ceil((maxVal + padding) / 1000) * 1000;

  const title =
    viewMode === "aggregate"
      ? "Expected Profile vs Actual Orders — All SKUs"
      : `${selectedSku?.name ?? "SKU Detail"} — Expected vs Actual`;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-base font-bold text-[var(--color-foreground)]">{title}</h3>
          <p className="text-xs text-[var(--color-foreground-muted)] mt-0.5">
            Daily order volume · 30-day rolling window
          </p>
        </div>
        {/* View toggles */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-lg p-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                viewMode === m.id
                  ? "bg-white text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 pt-4 pb-2 overflow-visible">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-[#0e7490] rounded" />
            <span className="text-xs text-[var(--color-foreground-muted)] font-medium">Expected profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-0.5 bg-[#f97316] rounded" />
            <span className="text-xs text-[var(--color-foreground-muted)] font-medium">Actual orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-3 bg-amber-100 border border-amber-300 rounded" />
            <span className="text-xs text-[var(--color-foreground-muted)] font-medium">Spike zone (2 Days)</span>
          </div>
          {viewMode !== "aggregate" && (
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 bg-[var(--color-primary)] rounded border-dashed border border-[var(--color-primary)] bg-transparent" />
              <span className="text-xs text-[var(--color-foreground-muted)] font-medium">Conf. band</span>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 22 }}>
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e7490" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0e7490" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval={4}
              dy={10}
              height={40}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatK}
              width={48}
              domain={[yMin, yMax]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#bandGradient)"
              name="upper"
              legendType="none"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              name="lower"
              legendType="none"
              dot={false}
            />

            {/* Spike zone highlight */}
            {spikeDateStart && (
              <ReferenceArea
                x1={spikeDateStart}
                x2={spikeDateEnd}
                fill="#fef9c3"
                fillOpacity={0.7}
                stroke="#eab308"
                strokeOpacity={0.6}
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
            )}

            <Line
              type="monotone"
              dataKey="expected"
              stroke="#0e7490"
              strokeWidth={2}
              dot={false}
              name="Expected"
              activeDot={{ r: 4, fill: "#0e7490" }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Actual"
              activeDot={{ r: 4, fill: "#f97316" }}
              strokeDasharray={viewMode === "month" ? "4 2" : undefined}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* SKU detail metrics (shown when a SKU is selected) */}
        {selectedSku && viewMode !== "aggregate" && (
          <div className="mt-4 grid grid-cols-4 gap-3 pt-4 border-t border-[var(--color-border)]">
            {[
              {
                label: "Current Month Forecast",
                value: `${(selectedSku.currentMonthForecast / 1000).toFixed(1)}k`,
              },
              {
                label: "Month-to-Date Actual",
                value: `${(selectedSku.currentMonthActual / 1000).toFixed(1)}k`,
              },
              {
                label: "Forecast Gap",
                value: `${((selectedSku.currentMonthActual - selectedSku.currentMonthForecast) / 1000).toFixed(1)}k`,
                highlight:
                  selectedSku.currentMonthActual > selectedSku.currentMonthForecast
                    ? "text-[var(--color-danger)]"
                    : "text-[var(--color-success)]",
              },
              {
                label: "Suggested Adjustment",
                value: `${selectedSku.suggestedAdjustmentPct > 0 ? "+" : ""}${selectedSku.suggestedAdjustmentPct}%`,
                highlight:
                  selectedSku.suggestedAdjustmentPct > 0
                    ? "text-[var(--color-accent)]"
                    : selectedSku.suggestedAdjustmentPct < 0
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-foreground-muted)]",
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={cn("text-base font-bold", item.highlight ?? "text-[var(--color-foreground)]")}>
                  {item.value}
                </div>
                <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
