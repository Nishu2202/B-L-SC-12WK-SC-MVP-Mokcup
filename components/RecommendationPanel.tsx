"use client";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeftRight,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { SKU_DATA, SKU } from "@/lib/mock-data";
import { cn, formatNumber, formatPct } from "@/lib/utils";

const ACTION_CONFIG = {
  increase: {
    label: "Increase Forecast",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  decrease: {
    label: "Decrease Forecast",
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  hold: {
    label: "Hold — Monitor 48h",
    icon: <Minus className="w-3.5 h-3.5" />,
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  rebalance: {
    label: "Rebalance Distribution",
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
};

const SEG_COLOR: Record<string, { bar: string; text: string; bg: string }> = {
  green: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  amber: { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  blue: { bar: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
  red: { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50" },
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          style={{ width: `${value}%` }}
          className={cn(
            "h-full rounded-full",
            value >= 80 ? "bg-emerald-500" : value >= 65 ? "bg-amber-500" : "bg-red-500"
          )}
        />
      </div>
      <span className="text-xs font-semibold text-[#334155]">{value}%</span>
    </div>
  );
}

function SKURow({
  sku,
  isSelected,
  onClick,
}: {
  sku: SKU;
  isSelected: boolean;
  onClick: () => void;
}) {
  const actionCfg = ACTION_CONFIG[sku.recommendedAction];
  const segCfg = SEG_COLOR[sku.segmentColor];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 group",
        isSelected
          ? "border-[#0e7490]/40 bg-[#0e7490]/5"
          : "border-transparent hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", segCfg.bar)} />
          <span className="text-[11px] font-semibold text-[#0f172a] truncate">{sku.name}</span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold flex-shrink-0",
            sku.deviationPct > 0 ? "text-amber-600" : "text-emerald-600"
          )}
        >
          {sku.deviationPct > 0 ? "+" : ""}
          {sku.deviationPct}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-[#94a3b8]">{sku.id}</span>
        <span className="text-[9px] text-[#94a3b8]">·</span>
        <span className="text-[9px] text-[#94a3b8]">{formatNumber(sku.volume)} units</span>
        <span className="flex-1" />
        <span
          className={cn(
            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
            actionCfg.bg,
            actionCfg.text
          )}
        >
          {sku.adjustmentPct > 0
            ? `+${sku.adjustmentPct}%`
            : sku.adjustmentPct < 0
            ? `${sku.adjustmentPct}%`
            : "Hold"}
        </span>
      </div>
    </button>
  );
}

export default function RecommendationPanel() {
  const { selectedSKU, setSelectedSKU, setChartView } = useAppState();

  function selectSKU(sku: SKU) {
    setSelectedSKU(sku);
    setChartView("sku");
  }

  if (!selectedSKU) return null;

  const actionCfg = ACTION_CONFIG[selectedSKU.recommendedAction];
  const segCfg = SEG_COLOR[selectedSKU.segmentColor];

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Recommendation card */}
      <div
        key={selectedSKU.id}
        className="bg-white rounded-2xl border border-[#e2e8f0] p-4"
      >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              AI Recommendation
            </span>
            <span
              className={cn(
                "ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                actionCfg.bg,
                actionCfg.text,
                actionCfg.border
              )}
            >
              {actionCfg.icon}
              {actionCfg.label}
            </span>
          </div>

          {/* SKU details */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h4 className="text-sm font-bold text-[#0f172a]">{selectedSKU.name}</h4>
                <p className="text-[10px] text-[#94a3b8]">{selectedSKU.id} · {selectedSKU.category}</p>
              </div>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-lg",
                  segCfg.bg,
                  segCfg.text
                )}
              >
                {selectedSKU.deviationPct > 0 ? "+" : ""}
                {selectedSKU.deviationPct}%
              </span>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed bg-[#f8fafc] rounded-lg p-2.5 border border-[#f1f5f9]">
              {selectedSKU.whyFlagged}
            </p>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Current Forecast", value: formatNumber(selectedSKU.currentMonthForecast) },
              { label: "Actuals MTD", value: formatNumber(selectedSKU.currentMonthActual) },
              {
                label: "Suggested Adj.",
                value:
                  selectedSKU.adjustmentPct > 0
                    ? `+${selectedSKU.adjustmentPct}%`
                    : selectedSKU.adjustmentPct < 0
                    ? `${selectedSKU.adjustmentPct}%`
                    : "Hold",
                highlight: true,
              },
              { label: "Forecast Engine", value: selectedSKU.forecastEngine },
            ].map((m, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-lg p-2 border border-[#f1f5f9]">
                <p className="text-[9px] text-[#94a3b8] mb-0.5">{m.label}</p>
                <p
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    m.highlight ? actionCfg.text : "text-[#0f172a]"
                  )}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Confidence */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#64748b]">Confidence score</span>
            </div>
            <ConfidenceBar value={selectedSKU.confidence} />
          </div>

          {/* Explanation */}
          <div className="bg-[#f8fafc] rounded-lg p-3 border border-[#f1f5f9] mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Info className="w-3 h-3 text-[#94a3b8]" />
              <span className="text-[10px] font-semibold text-[#475569]">Explanation</span>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              {selectedSKU.explanation}
            </p>
          </div>

          {/* Next action */}
          <div
            className={cn(
              "rounded-lg p-2.5 border text-[11px] font-medium leading-tight",
              actionCfg.bg,
              actionCfg.text,
              actionCfg.border
            )}
          >
            {selectedSKU.nextAction}
          </div>
        </div>

      {/* Top SKU list */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
        <h4 className="text-xs font-semibold text-[#334155] mb-2.5">Top Flagged SKUs</h4>
        <div className="space-y-1">
          {SKU_DATA.map((sku) => (
            <SKURow
              key={sku.id}
              sku={sku}
              isSelected={selectedSKU.id === sku.id}
              onClick={() => selectSKU(sku)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
