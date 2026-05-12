"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronRight, AlertTriangle, CheckCircle, Info, ChevronDown, ArrowUpCircle, ArrowDownCircle, PauseCircle, X, Edit3, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusChip from "./StatusChip";
import type { SkuData } from "@/lib/mock-data";

interface RecommendationPanelProps {
  selectedSku: SkuData | null;
  allSkus: SkuData[];
  onSelectSku: (sku: SkuData) => void;
  view: "sku-list" | "details";
}

// Time horizons for the override modal
const timeHorizons = ["Week 1", "Week 2", "Week 3", "Week 4", "Month Total"];

// Generate mock historical/forecast data for a SKU
function generateForecastData(sku: SkuData) {
  const baseForecast = Math.round(sku.currentMonthForecast / 4);
  const aiAdjustment = sku.suggestedAdjustmentPct / 100;
  
  return {
    currentForecast: [
      baseForecast,
      Math.round(baseForecast * 1.05),
      Math.round(baseForecast * 0.98),
      Math.round(baseForecast * 1.02),
      sku.currentMonthForecast,
    ],
    aiSuggestion: [
      Math.round(baseForecast * (1 + aiAdjustment)),
      Math.round(baseForecast * 1.05 * (1 + aiAdjustment)),
      Math.round(baseForecast * 0.98 * (1 + aiAdjustment)),
      Math.round(baseForecast * 1.02 * (1 + aiAdjustment)),
      Math.round(sku.currentMonthForecast * (1 + aiAdjustment)),
    ],
    historicalSales: [
      Math.round(baseForecast * 0.95),
      Math.round(baseForecast * 1.08),
      Math.round(baseForecast * 0.92),
      Math.round(baseForecast * 1.01),
      Math.round(sku.currentMonthForecast * 0.97),
    ],
  };
}

type FilterOption = "all" | "increase" | "decrease" | "hold";

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "increase", label: "Increase Forecast" },
  { value: "decrease", label: "Reduce Forecast" },
  { value: "hold", label: "Hold & Monitor" },
];

const actionIcon: Record<string, React.ElementType> = {
  increase: TrendingUp,
  decrease: TrendingDown,
  hold: Minus,
  rebalance: RefreshCw,
};

const actionColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  increase: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
  decrease: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-600",
  },
  hold: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    icon: "text-slate-500",
  },
  rebalance: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "text-orange-600",
  },
};

// ─── Planner Override Modal ─────────────────────────────────────────────────
function PlannerOverrideModal({
  sku,
  isOpen,
  onClose,
  onSave,
}: {
  sku: SkuData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTotal: number) => void;
}) {
  const forecastData = generateForecastData(sku);
  const [overrideValues, setOverrideValues] = useState<number[]>([...forecastData.aiSuggestion]);

  useEffect(() => {
    if (isOpen) {
      setOverrideValues([...forecastData.aiSuggestion]);
    }
  }, [isOpen, sku.id]);

  const handleInputChange = (index: number, value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""), 10) || 0;
    const newValues = [...overrideValues];
    newValues[index] = numValue;
    // Update total (last column) when weekly values change
    if (index < 4) {
      newValues[4] = newValues[0] + newValues[1] + newValues[2] + newValues[3];
    }
    setOverrideValues(newValues);
  };

  const handleSave = () => {
    onSave(overrideValues[4]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--color-primary-light)]">
              <Edit3 size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">Planner&apos;s Override</h2>
              <p className="text-xs text-[var(--color-foreground-muted)]">{sku.name} · {sku.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <X size={20} className="text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Table */}
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  <th className="text-left text-xs font-semibold text-[var(--color-foreground)] px-4 py-3 w-48">
                    Metric
                  </th>
                  {timeHorizons.map((h) => (
                    <th key={h} className="text-right text-xs font-semibold text-[var(--color-foreground)] px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Historical Sales */}
                <tr className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-[var(--color-foreground-muted)]">Historical Sales (Last Month)</div>
                  </td>
                  {forecastData.historicalSales.map((val, i) => (
                    <td key={i} className="text-right px-4 py-3">
                      <span className="text-sm font-medium text-slate-500">{val.toLocaleString()}</span>
                    </td>
                  ))}
                </tr>
                {/* Current Forecast */}
                <tr className="border-t border-[var(--color-border)] bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-[var(--color-foreground)]">Current Forecast</div>
                  </td>
                  {forecastData.currentForecast.map((val, i) => (
                    <td key={i} className="text-right px-4 py-3">
                      <span className="text-sm font-bold text-[var(--color-foreground)]">{val.toLocaleString()}</span>
                    </td>
                  ))}
                </tr>
                {/* AI Suggestion */}
                <tr className="border-t border-[var(--color-border)] bg-blue-50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-blue-700">AI Suggestion</div>
                  </td>
                  {forecastData.aiSuggestion.map((val, i) => (
                    <td key={i} className="text-right px-4 py-3">
                      <span className="text-sm font-bold text-blue-700">{val.toLocaleString()}</span>
                    </td>
                  ))}
                </tr>
                {/* Planner's Override - Editable */}
                <tr className="border-t-2 border-[var(--color-primary)] bg-teal-50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-bold text-[var(--color-primary)]">Planner&apos;s Override</div>
                  </td>
                  {overrideValues.map((val, i) => (
                    <td key={i} className="text-right px-4 py-2">
                      <input
                        type="text"
                        value={val.toLocaleString()}
                        onChange={(e) => handleInputChange(i, e.target.value)}
                        disabled={i === 4} // Total is auto-calculated
                        className={cn(
                          "w-full text-right text-sm font-bold px-2 py-1.5 rounded-lg border transition-colors",
                          i === 4
                            ? "bg-teal-100 border-teal-300 text-[var(--color-primary)] cursor-not-allowed"
                            : "bg-white border-[var(--color-border)] text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Variance summary */}
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-[var(--color-surface-2)] rounded-lg">
            <span className="text-xs text-[var(--color-foreground-muted)]">
              Variance from Current Forecast:
            </span>
            <span className={cn(
              "text-sm font-bold",
              overrideValues[4] > forecastData.currentForecast[4]
                ? "text-[var(--color-success)]"
                : overrideValues[4] < forecastData.currentForecast[4]
                ? "text-[var(--color-danger)]"
                : "text-[var(--color-foreground)]"
            )}>
              {overrideValues[4] > forecastData.currentForecast[4] ? "+" : ""}
              {(overrideValues[4] - forecastData.currentForecast[4]).toLocaleString()} units
              ({overrideValues[4] > forecastData.currentForecast[4] ? "+" : ""}
              {(((overrideValues[4] - forecastData.currentForecast[4]) / forecastData.currentForecast[4]) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/25"
          >
            Save Override
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SKU List Panel ──────────────────────────────────────────────────────────
function SkuListPanel({
  allSkus,
  selectedSku,
  onSelectSku,
}: {
  allSkus: SkuData[];
  selectedSku: SkuData | null;
  onSelectSku: (sku: SkuData) => void;
}) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredSkus = allSkus.filter((sku) => {
    if (filter === "all") return true;
    if (filter === "increase") return sku.recommendedAction === "increase";
    if (filter === "decrease") return sku.recommendedAction === "decrease";
    if (filter === "hold") return sku.recommendedAction === "hold" || sku.recommendedAction === "rebalance";
    return true;
  });

  const currentFilterLabel = filterOptions.find((o) => o.value === filter)?.label ?? "All Actions";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
        <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Top Flagged SKUs</h4>
        <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
          Click any row to view AI recommendation
        </p>
        {/* Filter dropdown */}
        <div className="relative mt-3">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            <span className="text-[var(--color-foreground)]">{currentFilterLabel}</span>
            <ChevronDown size={14} className={cn("text-[var(--color-foreground-muted)] transition-transform", dropdownOpen && "rotate-180")} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                    filter === option.value
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {filteredSkus.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-[var(--color-foreground-muted)]">No SKUs match the selected filter</p>
          </div>
        ) : (
          filteredSkus.map((s) => {
          const isSelected = selectedSku?.id === s.id;
          const devAbs = Math.abs(s.deviationPct);
          const deviationColor =
            devAbs > 20
              ? "text-[var(--color-danger)]"
              : devAbs > 10
              ? "text-[var(--color-warning)]"
              : "text-[var(--color-success)]";

          return (
            <button
              key={s.id}
              onClick={() => onSelectSku(s)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-0 text-left transition-colors",
                isSelected
                  ? "bg-[var(--color-primary-light)]"
                  : "hover:bg-[var(--color-surface-2)]"
              )}
            >
              {/* Status dot */}
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0",
                  s.status === "on-track"
                    ? "bg-[var(--color-success)]"
                    : s.status === "warning"
                    ? "bg-[var(--color-warning)]"
                    : s.status === "high-deviation"
                    ? "bg-[var(--color-danger)]"
                    : "bg-orange-500"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[var(--color-foreground)] truncate leading-tight">
                  {s.name}
                </div>
                <div className="text-[10px] text-[var(--color-foreground-muted)] mt-1 flex items-center gap-1.5">
                  <span className={cn("font-semibold", deviationColor)}>
                    {s.deviationPct > 0 ? "+" : ""}
                    {s.deviationPct.toFixed(1)}%
                  </span>
                  <span>·</span>
                  <span>{s.forecastAccuracy}% acc.</span>
                </div>
              </div>
              {/* Action icon */}
              {s.recommendedAction === "increase" && (
                <ArrowUpCircle size={18} className="flex-shrink-0 text-[var(--color-danger)]" />
              )}
              {s.recommendedAction === "decrease" && (
                <ArrowDownCircle size={18} className="flex-shrink-0 text-[var(--color-success)]" />
              )}
              {(s.recommendedAction === "hold" || s.recommendedAction === "rebalance") && (
                <PauseCircle size={18} className="flex-shrink-0 text-[var(--color-warning)]" />
              )}
              <ChevronRight
                size={13}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isSelected
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-foreground-subtle)]"
                )}
              />
            </button>
          );
        })
        )}
      </div>
    </div>
  );
}

// ─── Details / AI Recommendation Panel ──────────────────────────────────────
function DetailsPanel({ sku }: { sku: SkuData }) {
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideAdjustment, setOverrideAdjustment] = useState<number | null>(null);

  const ActionIcon = actionIcon[sku.recommendedAction];
  const colors = actionColors[sku.recommendedAction];
  // Infer signal tags from the explanation keywords
  const deviationAbs = Math.abs(sku.deviationPct);
  const deviationColor =
    deviationAbs > 20
      ? "text-[var(--color-danger)]"
      : deviationAbs > 10
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-success)]";

  // Calculate displayed adjustment - use override if available
  const displayedAdjustment = overrideAdjustment !== null
    ? Math.round(((overrideAdjustment - sku.currentMonthForecast) / sku.currentMonthForecast) * 100)
    : sku.suggestedAdjustmentPct;

  const displayedAdjustmentValue = overrideAdjustment !== null
    ? overrideAdjustment
    : Math.round(sku.currentMonthForecast * (1 + sku.suggestedAdjustmentPct / 100));

  const actionLabel =
    sku.recommendedAction === "increase"
      ? `Increase current month forecast by ${Math.abs(displayedAdjustment)}%`
      : sku.recommendedAction === "decrease"
      ? `Decrease current month forecast by ${Math.abs(displayedAdjustment)}%`
      : sku.recommendedAction === "hold"
      ? "Hold forecast — monitor for 2 Days"
      : "Rebalance distribution across weeks";

  const handleOverrideSave = (newTotal: number) => {
    setOverrideAdjustment(newTotal);
  };

  // Reset override when SKU changes
  useEffect(() => {
    setOverrideAdjustment(null);
  }, [sku.id]);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] h-full flex flex-col">
      {/* Planner Override Modal */}
      <PlannerOverrideModal
        sku={sku}
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSave={handleOverrideSave}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[var(--color-primary-light)]">
            <Brain size={14} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">AI Recommendation</span>
            <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">{sku.code} · Updated 2 min ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={sku.status} />
          {/* Action buttons */}
          <button
            onClick={() => setIsOverrideModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            <Edit3 size={12} />
            Planner&apos;s Override
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
          >
            <Lock size={12} />
            Commit to System
          </button>
        </div>
      </div>

      <div className="px-6 py-5 flex-1 overflow-y-auto space-y-5">
        {/* SKU identity */}
        <div>
          <h3 className="text-base font-bold text-[var(--color-foreground)] leading-tight">{sku.name}</h3>
          <p className="text-[11px] text-[var(--color-foreground-muted)] mt-1">
            {sku.code} &nbsp;·&nbsp; {sku.segment} &nbsp;·&nbsp; {sku.forecastEngine}
          </p>
        </div>

        {/* Metrics row — 4 wide cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "vs Expected",
              value: `${sku.deviationPct > 0 ? "+" : ""}${sku.deviationPct.toFixed(1)}%`,
              sub: "Deviation",
              color: deviationColor,
            },
            {
              label: "Confidence",
              value: `${sku.confidenceScore}%`,
              sub: "Model score",
              color: "text-[var(--color-foreground)]",
            },
            {
              label: "Curr Month Fcst",
              value: `${(sku.currentMonthForecast / 1000).toFixed(1)}k`,
              sub: "Units",
              color: "text-[var(--color-foreground)]",
            },
            {
              label: overrideAdjustment !== null ? "Planner Adj." : "Suggested Adj.",
              value: `${(displayedAdjustmentValue / 1000).toFixed(1)}k`,
              sub: overrideAdjustment !== null 
                ? `Override (${displayedAdjustment > 0 ? "+" : ""}${displayedAdjustment}%)`
                : `AI suggestion (${displayedAdjustment > 0 ? "+" : ""}${displayedAdjustment}%)`,
              color:
                displayedAdjustment !== 0
                  ? displayedAdjustment > 0
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-warning)]"
                  : "text-[var(--color-foreground-muted)]",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-[var(--color-surface-2)] rounded-xl p-4"
            >
              <div className={cn("text-xl font-bold leading-tight", m.color)}>{m.value}</div>
              <div className="text-[11px] font-medium text-[var(--color-foreground)] mt-1">{m.label}</div>
              <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Action banner */}
        <div className={cn("flex items-center gap-3 rounded-xl px-5 py-4 border", colors.bg, colors.border)}>
          <div className={cn("p-2 rounded-lg bg-white/60")}>
            <ActionIcon size={16} className={colors.icon} />
          </div>
          <div>
            <div className={cn("text-xs font-bold uppercase tracking-wide mb-0.5", colors.text)}>
              Recommended Action
            </div>
            <div className="text-sm font-semibold text-[var(--color-foreground)]">{actionLabel}</div>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <div className="text-[11px] font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wide mb-2">
            Agent Rationale
          </div>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
            {sku.explanation}
          </p>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { label: "Forecast Accuracy", value: `${sku.forecastAccuracy}%` },
            { label: "Month-to-Date Actual", value: `${(sku.currentMonthActual / 1000).toFixed(1)}k` },
            { label: "Variability Score", value: sku.variabilityScore.toFixed(2) },
          ].map((m) => (
            <div key={m.label} className="bg-[var(--color-surface-2)] rounded-lg px-4 py-3">
              <div className="text-sm font-bold text-[var(--color-foreground)]">{m.value}</div>
              <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function RecommendationPanel({
  selectedSku,
  allSkus,
  onSelectSku,
  view,
}: RecommendationPanelProps) {
  if (view === "sku-list") {
    return (
      <SkuListPanel
        allSkus={allSkus}
        selectedSku={selectedSku}
        onSelectSku={onSelectSku}
      />
    );
  }

  const sku = selectedSku ?? allSkus[0];
  return <DetailsPanel sku={sku} />;
}
