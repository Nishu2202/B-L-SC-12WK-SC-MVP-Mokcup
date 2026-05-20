"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertTriangle,
  Users,
  DollarSign,
  BarChart2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkuData, ForecastEngine } from "@/lib/mock-data";

interface SkuSegmentationTabProps {
  skus: SkuData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtUnits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

const actionColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  increase: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  decrease: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  hold: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-600" },
  rebalance: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
};

const engineBadge: Record<
  ForecastEngine,
  { bg: string; text: string; label: string; description: string }
> = {
  "Blue Yonder": {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    label: "Blue Yonder (Automated)",
    description: "BY ML model alone — high confidence, no planner review needed.",
  },
  OPAL: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    label: "OPAL (Automated)",
    description: "B+L's demand-sensing layer — used when BY signal is insufficient. No planner override needed.",
  },
  "Blue Yonder + Planner": {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    label: "BY + Planner Review",
    description: "BY forecast detected an out-of-band signal. A planner must manually validate before the number is locked.",
  },
  "OPAL + Planner": {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    label: "OPAL + Planner Review",
    description: "Lowest model confidence. OPAL signal plus mandatory expert planner override required — highest urgency.",
  },
};

// ─── Custom quadrant revenue label ───────────────────────────────────────────

interface QuadrantLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number };
  title: string;
  revenue: string;
  isHighRisk?: boolean;
}

function QuadrantRevenueLabel({ viewBox, title, revenue, isHighRisk }: QuadrantLabelProps) {
  if (!viewBox) return null;
  const { x, y, width } = viewBox;
  const PAD = 8;
  // Anchor to top-right corner of the quadrant area
  return (
    <g>
      <foreignObject
        x={x + width - 130 - PAD}
        y={y + PAD}
        width={130}
        height={42}
        style={{ overflow: "visible" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: isHighRisk ? "var(--color-danger)" : "var(--color-foreground-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: isHighRisk ? "var(--color-danger)" : "var(--color-foreground)",
              lineHeight: 1,
            }}
          >
            {revenue}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}

// ─── Custom scatter tooltip ───────────────────────────────────────────────────

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: SkuData }[];
}) {
  if (!active || !payload || !payload[0]?.payload) return null;
  const s = payload[0].payload;
  const revenue = s.volume * s.revenuePerUnit;
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-3 text-xs max-w-[220px]">
      <p className="font-bold text-[var(--color-foreground)] mb-1 leading-snug">{s.name}</p>
      <p className="text-[var(--color-foreground-muted)] text-[10px] mb-2">{s.code}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-foreground-muted)]">Volume</span>
          <span className="font-semibold text-[var(--color-foreground)]">{fmtUnits(s.volume)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-foreground-muted)]">Variability</span>
          <span className="font-semibold text-[var(--color-foreground)]">{s.variabilityScore.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-foreground-muted)]">Revenue</span>
          <span className="font-semibold text-[var(--color-foreground)]">{fmtRevenue(revenue)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-foreground-muted)]">Accuracy</span>
          <span className="font-semibold text-[var(--color-foreground)]">{s.forecastAccuracy}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SkuSegmentationTab({ skus }: SkuSegmentationTabProps) {
  // Thresholds
  const medianVolume = useMemo(() => {
    const sorted = [...skus].sort((a, b) => a.volume - b.volume);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1].volume + sorted[mid].volume) / 2
      : sorted[mid].volume;
  }, [skus]);

  const variabilityThreshold = 0.6;

  // Mark quadrant membership
  const skusWithQuadrant = useMemo(
    () =>
      skus.map((s) => ({
        ...s,
        isHighRisk:
          s.volume > medianVolume && s.variabilityScore > variabilityThreshold,
      })),
    [skus, medianVolume]
  );

  // Top-10 high-risk SKUs sorted by revenue desc
  const highRiskSkus = useMemo(
    () =>
      skusWithQuadrant
        .filter((s) => s.isHighRisk)
        .sort((a, b) => b.volume * b.revenuePerUnit - a.volume * a.revenuePerUnit)
        .slice(0, 10),
    [skusWithQuadrant]
  );

  // All high-risk for recommendations (no slice)
  const recSkus = useMemo(
    () =>
      skusWithQuadrant
        .filter((s) => s.isHighRisk)
        .sort((a, b) => b.volume * b.revenuePerUnit - a.volume * a.revenuePerUnit),
    [skusWithQuadrant]
  );

  // Quadrant revenue totals
  const quadrantRevenue = useMemo(() => {
    let hvhv = 0, hvlv = 0, lvhv = 0, lvlv = 0;
    for (const s of skusWithQuadrant) {
      const rev = s.volume * s.revenuePerUnit;
      const isHighVol = s.volume > medianVolume;
      const isHighVar = s.variabilityScore > variabilityThreshold;
      if (isHighVol && isHighVar) hvhv += rev;
      else if (isHighVol && !isHighVar) hvlv += rev;
      else if (!isHighVol && isHighVar) lvhv += rev;
      else lvlv += rev;
    }
    return { hvhv, hvlv, lvhv, lvlv };
  }, [skusWithQuadrant, medianVolume]);

  // X-axis domain padding
  const maxVol = Math.max(...skus.map((s) => s.volume));
  const xMax = Math.ceil(maxVol * 1.08);

  return (
    <div className="space-y-5">
      {/* ── Top row: Scatter + Table ──────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_420px] gap-4 items-start">
        {/* Scatter Chart */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                Volume vs. Variability
              </h3>
              <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
                Each dot is one SKU · Red zone = High Volume &amp; High Variability
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-[var(--color-foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[var(--color-danger)] inline-block" />
                High-Risk Quadrant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
                Other SKUs
              </span>
            </div>
          </div>

          <div className="h-[320px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

                {/* Q1: High Volume, High Variability — highlighted danger zone */}
                <ReferenceArea
                  x1={medianVolume}
                  x2={xMax}
                  y1={variabilityThreshold}
                  y2={1}
                  fill="var(--color-danger)"
                  fillOpacity={0.07}
                  strokeOpacity={0}
                  label={
                    <QuadrantRevenueLabel
                      title="HV · HVar"
                      revenue={fmtRevenue(quadrantRevenue.hvhv)}
                      isHighRisk
                    />
                  }
                />

                {/* Q2: High Volume, Low Variability */}
                <ReferenceArea
                  x1={medianVolume}
                  x2={xMax}
                  y1={0}
                  y2={variabilityThreshold}
                  fill="var(--color-success)"
                  fillOpacity={0.04}
                  strokeOpacity={0}
                  label={
                    <QuadrantRevenueLabel
                      title="HV · LVar"
                      revenue={fmtRevenue(quadrantRevenue.hvlv)}
                    />
                  }
                />

                {/* Q3: Low Volume, High Variability */}
                <ReferenceArea
                  x1={0}
                  x2={medianVolume}
                  y1={variabilityThreshold}
                  y2={1}
                  fill="var(--color-warning)"
                  fillOpacity={0.04}
                  strokeOpacity={0}
                  label={
                    <QuadrantRevenueLabel
                      title="LV · HVar"
                      revenue={fmtRevenue(quadrantRevenue.lvhv)}
                    />
                  }
                />

                {/* Q4: Low Volume, Low Variability */}
                <ReferenceArea
                  x1={0}
                  x2={medianVolume}
                  y1={0}
                  y2={variabilityThreshold}
                  fill="var(--color-foreground-muted)"
                  fillOpacity={0.03}
                  strokeOpacity={0}
                  label={
                    <QuadrantRevenueLabel
                      title="LV · LVar"
                      revenue={fmtRevenue(quadrantRevenue.lvlv)}
                    />
                  }
                />

                {/* Threshold lines */}
                <ReferenceLine
                  x={medianVolume}
                  stroke="var(--color-foreground-muted)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Median Vol",
                    position: "insideTopLeft",
                    fontSize: 10,
                    fill: "var(--color-foreground-muted)",
                    dy: -6,
                  }}
                />
                <ReferenceLine
                  y={variabilityThreshold}
                  stroke="var(--color-foreground-muted)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Var > 0.6",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "var(--color-foreground-muted)",
                    dy: -6,
                  }}
                />

                <XAxis
                  dataKey="volume"
                  type="number"
                  domain={[0, xMax]}
                  tickFormatter={(v: number) => fmtUnits(v)}
                  tick={{ fontSize: 10, fill: "var(--color-foreground-muted)" }}
                  label={{
                    value: "Volume (Units)",
                    position: "insideBottom",
                    offset: -18,
                    fontSize: 11,
                    fill: "var(--color-foreground-muted)",
                  }}
                />
                <YAxis
                  dataKey="variabilityScore"
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                  tick={{ fontSize: 10, fill: "var(--color-foreground-muted)" }}
                  label={{
                    value: "Variability Score",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 11,
                    fill: "var(--color-foreground-muted)",
                  }}
                />
                <Tooltip content={<ScatterTooltip />} />

                <Scatter data={skusWithQuadrant} isAnimationActive={false}>
                  {skusWithQuadrant.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={entry.isHighRisk ? "var(--color-danger)" : "#94a3b8"}
                      fillOpacity={entry.isHighRisk ? 0.85 : 0.55}
                      stroke={entry.isHighRisk ? "var(--color-danger)" : "#64748b"}
                      strokeWidth={entry.isHighRisk ? 1.5 : 0.5}
                      r={entry.isHighRisk ? 8 : 5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Quadrant count callout */}
          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-xs font-medium text-red-700">
              <span className="font-bold">{highRiskSkus.length} SKUs</span> flagged in the High Volume &amp; High Variability quadrant — prioritize forecast review
            </span>
          </div>
        </div>

        {/* Top-10 Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-bold text-[var(--color-foreground)]">
              High-Risk SKUs · Top {highRiskSkus.length}
            </h3>
            <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
              High Vol &amp; High Variability · Sorted by revenue (high to low)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                  {["#", "SKU", "Revenue", "Vol", "Var Score", "Accuracy", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-[10px] font-semibold text-[var(--color-foreground-muted)] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {highRiskSkus.map((sku, idx) => {
                  const revenue = sku.volume * sku.revenuePerUnit;
                  const ac = actionColors[sku.recommendedAction];
                  return (
                    <tr
                      key={sku.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                            idx === 0
                              ? "bg-red-100 text-red-700"
                              : idx === 1
                              ? "bg-orange-100 text-orange-700"
                              : idx === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      {/* SKU name + code */}
                      <td className="px-3 py-2.5 max-w-[110px]">
                        <p className="font-semibold text-[var(--color-foreground)] truncate leading-tight text-[11px]">
                          {sku.name}
                        </p>
                        <p className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{sku.code}</p>
                      </td>

                      {/* Revenue */}
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-[var(--color-foreground)] text-[11px]">
                          {fmtRevenue(revenue)}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="px-3 py-2.5 text-[var(--color-foreground-muted)]">
                        {fmtUnits(sku.volume)}
                      </td>

                      {/* Variability score */}
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-[var(--color-danger)] text-[11px]">
                          {sku.variabilityScore.toFixed(2)}
                        </span>
                      </td>

                      {/* Forecast accuracy */}
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "font-semibold text-[11px]",
                            sku.forecastAccuracy >= 80
                              ? "text-[var(--color-success)]"
                              : sku.forecastAccuracy >= 65
                              ? "text-[var(--color-warning)]"
                              : "text-[var(--color-danger)]"
                          )}
                        >
                          {sku.forecastAccuracy}%
                        </span>
                      </td>

                      {/* Action badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                            ac.bg,
                            ac.border,
                            ac.text
                          )}
                        >
                          {sku.recommendedAction === "increase" && <ChevronUp size={10} />}
                          {sku.recommendedAction === "decrease" && <ChevronDown size={10} />}
                          {sku.recommendedAction === "hold" && "—"}
                          {sku.recommendedAction === "rebalance" && "↔"}
                          {sku.recommendedAction === "increase" && "Increase"}
                          {sku.recommendedAction === "decrease" && "Decrease"}
                          {sku.recommendedAction === "hold" && " Hold"}
                          {sku.recommendedAction === "rebalance" && " Rebalance"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Bottom: Forecast Recommendations ─────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)]">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--color-primary-light)]">
              <Sparkles size={14} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                Forecast Adjustment Recommendations
              </h3>
              <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
                High-risk SKUs only · Recommended delta from current Blue Yonder (BY) forecast
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[var(--color-foreground-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-3 py-1">
            {recSkus.length} SKU{recSkus.length !== 1 ? "s" : ""} require action
          </span>
        </div>

        {/* Cards grid */}
        <div className="p-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recSkus.map((sku) => {
            const revenue = sku.volume * sku.revenuePerUnit;
            const adjPct = sku.suggestedAdjustmentPct;
            const adjUnits = Math.round(sku.currentMonthForecast * (adjPct / 100));
            const revenueImpact = adjUnits * sku.revenuePerUnit;
            const ebitdaImpact = revenueImpact * (sku.ebitdaMarginPct / 100);
            const isIncrease = adjPct > 0;
            const isDecrease = adjPct < 0;
            const isNeutral = adjPct === 0;
            const deltaColor = isIncrease
              ? "text-[var(--color-success)]"
              : isDecrease
              ? "text-[var(--color-danger)]"
              : "text-[var(--color-foreground-muted)]";

            const deltaSign = isIncrease ? "+" : "";

            return (
              <div
                key={sku.id}
                className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]"
              >
                {/* Card header */}
                <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-foreground)] truncate leading-tight">
                      {sku.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{sku.code}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-4 py-3 space-y-3">
                  {/* BY Forecast delta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--color-foreground-muted)] text-[11px]">
                      {isIncrease ? (
                        <TrendingUp size={12} className="text-[var(--color-success)]" />
                      ) : isDecrease ? (
                        <TrendingDown size={12} className="text-[var(--color-danger)]" />
                      ) : (
                        <Minus size={12} className="text-[var(--color-foreground-muted)]" />
                      )}
                      Forecast Delta vs BY
                    </div>
                    <div className="text-right">
                      <span className={cn("text-sm font-extrabold", deltaColor)}>
                        {isNeutral ? "No change" : `${deltaSign}${adjPct}%`}
                      </span>
                      {!isNeutral && (
                        <span className={cn("block text-[10px] font-semibold", deltaColor)}>
                          {deltaSign}
                          {Math.abs(adjUnits).toLocaleString()} units
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current BY Forecast */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-foreground-muted)] flex items-center gap-1.5">
                      <BarChart2 size={12} className="text-slate-400" />
                      BY Forecast (current)
                    </span>
                    <span className="font-semibold text-[var(--color-foreground)]">
                      {sku.currentMonthForecast.toLocaleString()} units
                    </span>
                  </div>

                  {/* Revenue impact */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-foreground-muted)] flex items-center gap-1.5">
                      <DollarSign size={12} className="text-slate-400" />
                      Revenue Impact
                    </span>
                    <div className="text-right">
                      <span
                        className={cn(
                          "font-bold",
                          isIncrease
                            ? "text-[var(--color-success)]"
                            : isDecrease
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-foreground-muted)]"
                        )}
                      >
                        {isNeutral ? "—" : `${deltaSign}${fmtRevenue(Math.abs(revenueImpact))}`}
                      </span>
                      {!isNeutral && (
                        <span className="block text-[10px] text-[var(--color-foreground-muted)]">
                          Base rev: {fmtRevenue(revenue)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EBITDA impact */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-foreground-muted)] flex items-center gap-1.5">
                      <BarChart2 size={12} className="text-slate-400" />
                      EBITDA Impact
                      <span className="text-[9px] text-[var(--color-foreground-subtle)] ml-0.5">
                        ({sku.ebitdaMarginPct}% margin)
                      </span>
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        isIncrease
                          ? "text-[var(--color-success)]"
                          : isDecrease
                          ? "text-[var(--color-danger)]"
                          : "text-[var(--color-foreground-muted)]"
                      )}
                    >
                      {isNeutral ? "—" : `${deltaSign}${fmtRevenue(Math.abs(ebitdaImpact))}`}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--color-border)]" />

                  {/* Top 3 customers */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-foreground-muted)] mb-2">
                      <Users size={12} className="text-slate-400" />
                      Top 3 Customers
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sku.topCustomers.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-medium bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-full px-2.5 py-1"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reason for adjustment */}
                  <div className="bg-[var(--color-surface-2)] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-foreground-muted)] mb-1.5">
                      <FileText size={11} className="text-slate-400 flex-shrink-0" />
                      <span className="font-semibold">Reason for adjustment</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-foreground-muted)] leading-relaxed">
                      {sku.rationale}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
