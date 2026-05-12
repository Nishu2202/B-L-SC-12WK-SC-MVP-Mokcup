"use client";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { SKU_DATA, SKU, ForecastEngine, SegmentColor } from "@/lib/mock-data";
import { cn, formatNumber, formatPct } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const ENGINE_CONFIG: Record<
  ForecastEngine,
  { bg: string; text: string; border: string; dot: string }
> = {
  "Blue Yonder Forecast": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  "OPAL Forecast": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  "Blue Yonder + Planner": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  "OPAL + Planner": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const SEG_COLOR_CONFIG: Record<SegmentColor, { label: string; badge: string; text: string; dot: string }> = {
  green: {
    label: "Retain Blue Yonder",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  amber: {
    label: "Planner Review",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  blue: {
    label: "Alt Engine",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  red: {
    label: "Risk / Mismatch",
    badge: "bg-red-100 text-red-600 border-red-200",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

const ACTION_ICONS = {
  increase: <TrendingUp className="w-3 h-3" />,
  decrease: <TrendingDown className="w-3 h-3" />,
  hold: <Minus className="w-3 h-3" />,
  rebalance: <ArrowLeftRight className="w-3 h-3" />,
};

const VARIABILITY_ICON = {
  Low: <Activity className="w-3 h-3 text-emerald-500" />,
  Medium: <Activity className="w-3 h-3 text-amber-500" />,
  High: <Activity className="w-3 h-3 text-red-500" />,
};

// ─── Accuracy Bar ────────────────────────────────────────────────────────────

function AccuracyBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-500"
      : value >= 65
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-[#334155] w-7 text-right">{value}%</span>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {(Object.entries(SEG_COLOR_CONFIG) as [SegmentColor, typeof SEG_COLOR_CONFIG[SegmentColor]][]).map(
        ([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
            <span className="text-[10px] text-[#64748b]">{cfg.label}</span>
          </div>
        )
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SegmentationMatrix() {
  const { selectedSKU, setSelectedSKU, setChartView } = useAppState();

  function selectSKU(sku: SKU) {
    setSelectedSKU(sku);
    setChartView("sku");
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#f1f5f9]">
        <div>
          <h3 className="text-sm font-semibold text-[#0f172a]">
            SKU Segmentation & Forecast Strategy
          </h3>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            Rule-based engine assignment · Click a row to drill into SKU detail
          </p>
        </div>
        <Legend />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8fafc]">
              {[
                "SKU",
                "Segment",
                "Volume",
                "Variability",
                "Forecast Accuracy",
                "Forecast Engine",
                "Rationale",
                "Next Action",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap border-b border-[#f1f5f9]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SKU_DATA.map((sku, i) => {
              const engineCfg = ENGINE_CONFIG[sku.forecastEngine];
              const segCfg = SEG_COLOR_CONFIG[sku.segmentColor];
              const isSelected = selectedSKU?.id === sku.id;
              const actionIcon = ACTION_ICONS[sku.recommendedAction];

              return (
                <tr
                  key={sku.id}
                  onClick={() => selectSKU(sku)}
                  className={cn(
                    "cursor-pointer border-b border-[#f8fafc] transition-colors",
                    isSelected
                      ? "bg-[#f0fdff]"
                      : "hover:bg-[#f8fafc]"
                  )}
                >
                  {/* SKU */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", segCfg.dot)} />
                      <div>
                        <p className="text-[11px] font-semibold text-[#0f172a] whitespace-nowrap">
                          {sku.name}
                        </p>
                        <p className="text-[9px] text-[#94a3b8]">{sku.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Segment */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                        segCfg.badge
                      )}
                    >
                      {segCfg.label}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#0f172a]">
                      {formatNumber(sku.volume)}
                    </p>
                    <p className="text-[9px] text-[#94a3b8]">units</p>
                  </td>

                  {/* Variability */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {VARIABILITY_ICON[sku.variability]}
                      <span className="text-[11px] font-medium text-[#334155]">
                        {sku.variability}
                      </span>
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td className="px-4 py-3 min-w-28">
                    <AccuracyBar value={sku.forecastAccuracy} />
                  </td>

                  {/* Engine */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg border w-fit whitespace-nowrap",
                        engineCfg.bg,
                        engineCfg.text,
                        engineCfg.border
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", engineCfg.dot)} />
                      {sku.forecastEngine}
                    </span>
                  </td>

                  {/* Rationale */}
                  <td className="px-4 py-3 max-w-52">
                    <p className="text-[10px] text-[#64748b] leading-tight line-clamp-2">
                      {sku.rationale}
                    </p>
                  </td>

                  {/* Next action */}
                  <td className="px-4 py-3 max-w-44">
                    <div
                      className={cn(
                        "flex items-start gap-1.5 text-[10px] font-medium leading-tight",
                        sku.recommendedAction === "increase"
                          ? "text-amber-700"
                          : sku.recommendedAction === "decrease"
                          ? "text-red-600"
                          : sku.recommendedAction === "hold"
                          ? "text-sky-700"
                          : "text-violet-700"
                      )}
                    >
                      <span className="flex-shrink-0 mt-0.5">{actionIcon}</span>
                      <span className="line-clamp-2">{sku.nextAction}</span>
                    </div>
                  </td>

                  {/* Drill in */}
                  <td className="px-3 py-3">
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-colors",
                        isSelected ? "text-[#0e7490]" : "text-[#cbd5e1]"
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected SKU expanded detail */}
      {selectedSKU && (
        <div
          key={selectedSKU.id}
          className="border-t border-[#f1f5f9] overflow-hidden"
        >
            <div className="px-5 py-4 bg-[#f0fdff]">
              <div className="flex items-start gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#0e7490] mb-1">
                    {selectedSKU.segment}
                  </p>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {selectedSKU.explanation}
                  </p>
                </div>
                <div className="flex-shrink-0 grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Forecast Gap",
                      value:
                        (selectedSKU.forecastGap > 0 ? "+" : "") +
                        selectedSKU.forecastGap.toLocaleString(),
                      sub: "units",
                      color:
                        selectedSKU.forecastGap > 0
                          ? "text-amber-600"
                          : "text-emerald-600",
                    },
                    {
                      label: "Confidence",
                      value: selectedSKU.confidence + "%",
                      sub: "AI score",
                      color: "text-[#0e7490]",
                    },
                    {
                      label: "Adjustment",
                      value:
                        selectedSKU.adjustmentPct > 0
                          ? `+${selectedSKU.adjustmentPct}%`
                          : selectedSKU.adjustmentPct < 0
                          ? `${selectedSKU.adjustmentPct}%`
                          : "Hold",
                      sub: "recommended",
                      color:
                        selectedSKU.recommendedAction === "decrease"
                          ? "text-red-600"
                          : selectedSKU.recommendedAction === "increase"
                          ? "text-amber-600"
                          : "text-sky-700",
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-2.5 border border-[#e2e8f0] text-center"
                    >
                      <p className={cn("text-sm font-bold", m.color)}>{m.value}</p>
                      <p className="text-[9px] text-[#94a3b8]">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
