"use client";

import { useState } from "react";
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronRight, AlertTriangle, CheckCircle, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusChip from "./StatusChip";
import type { SkuData } from "@/lib/mock-data";

interface RecommendationPanelProps {
  selectedSku: SkuData | null;
  allSkus: SkuData[];
  onSelectSku: (sku: SkuData) => void;
  view: "sku-list" | "details";
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
                <div className="mt-1.5">
                  <StatusChip action={s.recommendedAction} size="sm" />
                </div>
              </div>
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
        })}
        )}
      </div>
    </div>
  );
}

// ─── Details / AI Recommendation Panel ──────────────────────────────────────
function DetailsPanel({ sku }: { sku: SkuData }) {
  const ActionIcon = actionIcon[sku.recommendedAction];
  const colors = actionColors[sku.recommendedAction];
  const deviationAbs = Math.abs(sku.deviationPct);
  const deviationColor =
    deviationAbs > 20
      ? "text-[var(--color-danger)]"
      : deviationAbs > 10
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-success)]";

  const actionLabel =
    sku.recommendedAction === "increase"
      ? `Increase current month forecast by ${sku.suggestedAdjustmentPct}%`
      : sku.recommendedAction === "decrease"
      ? `Decrease current month forecast by ${Math.abs(sku.suggestedAdjustmentPct)}%`
      : sku.recommendedAction === "hold"
      ? "Hold forecast — monitor for 48 hours"
      : "Rebalance distribution across weeks";

  // Infer signal tags from the explanation keywords
  const signals: { icon: React.ElementType; label: string; type: "warn" | "info" | "ok" }[] = [];
  if (deviationAbs > 15) signals.push({ icon: AlertTriangle, label: `${deviationAbs.toFixed(1)}% deviation from expected profile`, type: "warn" });
  if (sku.confidenceScore >= 80) signals.push({ icon: CheckCircle, label: `High model confidence at ${sku.confidenceScore}%`, type: "ok" });
  if (sku.confidenceScore < 70) signals.push({ icon: AlertTriangle, label: `Low model confidence — ${sku.confidenceScore}%`, type: "warn" });
  signals.push({ icon: Info, label: `Forecast engine: ${sku.forecastEngine}`, type: "info" });
  signals.push({ icon: Info, label: `Segment: ${sku.segment} · Variability: ${sku.variabilityScore.toFixed(1)}`, type: "info" });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] h-full flex flex-col">
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
        <StatusChip status={sku.status} />
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
              label: "Suggested Adj.",
              value: `${sku.suggestedAdjustmentPct > 0 ? "+" : ""}${sku.suggestedAdjustmentPct}%`,
              sub: "To forecast",
              color:
                sku.suggestedAdjustmentPct !== 0
                  ? sku.suggestedAdjustmentPct > 0
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

        {/* Signal tags */}
        <div>
          <div className="text-[11px] font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wide mb-2">
            Key Signals
          </div>
          <div className="flex flex-col gap-2">
            {signals.map((sig, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs",
                  sig.type === "warn"
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : sig.type === "ok"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground-muted)]"
                )}
              >
                <sig.icon size={12} className="flex-shrink-0" />
                <span>{sig.label}</span>
              </div>
            ))}
          </div>
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

        {/* SC Parameters Drift */}
        <div>
          <div className="text-[11px] font-semibold text-[var(--color-foreground-muted)] uppercase tracking-wide mb-3">
            SC Parameters Drift
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Lead Time Variance", value: "+3.2 days", status: "warn" },
              { label: "Safety Stock Delta", value: "-8.5%", status: "ok" },
              { label: "Reorder Point Drift", value: "+12%", status: "warn" },
              { label: "Service Level Impact", value: "-1.1%", status: "warn" },
            ].map((m) => (
              <div
                key={m.label}
                className={cn(
                  "rounded-lg px-4 py-3 border",
                  m.status === "warn"
                    ? "bg-amber-50 border-amber-200"
                    : m.status === "ok"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                )}
              >
                <div className={cn(
                  "text-sm font-bold",
                  m.status === "warn"
                    ? "text-amber-800"
                    : m.status === "ok"
                    ? "text-emerald-800"
                    : "text-[var(--color-foreground)]"
                )}>
                  {m.value}
                </div>
                <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
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
