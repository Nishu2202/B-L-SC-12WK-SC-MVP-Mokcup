"use client";

import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusChip from "./StatusChip";
import type { SkuData } from "@/lib/mock-data";

interface RecommendationPanelProps {
  selectedSku: SkuData | null;
  allSkus: SkuData[];
  onSelectSku: (sku: SkuData) => void;
}

const actionIcon: Record<string, React.ElementType> = {
  increase: TrendingUp,
  decrease: TrendingDown,
  hold: Minus,
  rebalance: RefreshCw,
};

export default function RecommendationPanel({ selectedSku, allSkus, onSelectSku }: RecommendationPanelProps) {
  const sku = selectedSku ?? allSkus[0];
  const ActionIcon = actionIcon[sku.recommendedAction];

  const deviationAbs = Math.abs(sku.deviationPct);
  const deviationColor =
    deviationAbs > 20
      ? "text-[var(--color-danger)]"
      : deviationAbs > 10
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-success)]";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Main recommendation card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] p-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--color-primary-light)]">
              <Brain size={13} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-foreground)]">AI Recommendation</span>
          </div>
          <StatusChip status={sku.status} />
        </div>

        {/* SKU identifier */}
        <div className="mb-3">
          <div className="text-sm font-bold text-[var(--color-foreground)] leading-tight">{sku.name}</div>
          <div className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
            {sku.code} · {sku.segment}
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[var(--color-surface-2)] rounded-lg p-2.5">
            <div className={cn("text-base font-bold leading-tight", deviationColor)}>
              {sku.deviationPct > 0 ? "+" : ""}
              {sku.deviationPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">vs Expected</div>
          </div>
          <div className="bg-[var(--color-surface-2)] rounded-lg p-2.5">
            <div className="text-base font-bold text-[var(--color-foreground)] leading-tight">
              {sku.confidenceScore}%
            </div>
            <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">Confidence</div>
          </div>
          <div className="bg-[var(--color-surface-2)] rounded-lg p-2.5">
            <div className="text-base font-bold text-[var(--color-foreground)] leading-tight">
              {(sku.currentMonthForecast / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">Curr Month Fcst</div>
          </div>
          <div className="bg-[var(--color-surface-2)] rounded-lg p-2.5">
            <div
              className={cn(
                "text-base font-bold leading-tight",
                sku.suggestedAdjustmentPct !== 0
                  ? sku.suggestedAdjustmentPct > 0
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-warning)]"
                  : "text-[var(--color-foreground-muted)]"
              )}
            >
              {sku.suggestedAdjustmentPct > 0 ? "+" : ""}
              {sku.suggestedAdjustmentPct}%
            </div>
            <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">Adjustment</div>
          </div>
        </div>

        {/* Action badge */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg p-2.5 mb-3",
            sku.recommendedAction === "increase"
              ? "bg-blue-50 border border-blue-200"
              : sku.recommendedAction === "decrease"
              ? "bg-amber-50 border border-amber-200"
              : sku.recommendedAction === "hold"
              ? "bg-slate-50 border border-slate-200"
              : "bg-orange-50 border border-orange-200"
          )}
        >
          <ActionIcon
            size={13}
            className={cn(
              sku.recommendedAction === "increase"
                ? "text-blue-600"
                : sku.recommendedAction === "decrease"
                ? "text-amber-600"
                : sku.recommendedAction === "hold"
                ? "text-slate-500"
                : "text-orange-600"
            )}
          />
          <span className="text-xs font-semibold text-[var(--color-foreground)]">
            {sku.recommendedAction === "increase" &&
              `Increase current month forecast by ${sku.suggestedAdjustmentPct}%`}
            {sku.recommendedAction === "decrease" &&
              `Decrease current month forecast by ${Math.abs(sku.suggestedAdjustmentPct)}%`}
            {sku.recommendedAction === "hold" && "Hold forecast — monitor for 48 hours"}
            {sku.recommendedAction === "rebalance" && "Rebalance distribution across weeks"}
          </span>
        </div>

        {/* Explanation */}
        <p className="text-[11px] text-[var(--color-foreground-muted)] leading-relaxed">
          {sku.explanation}
        </p>
      </div>

      {/* Top SKU list */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <h4 className="text-xs font-semibold text-[var(--color-foreground)]">Top Flagged SKUs</h4>
          <p className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">Click to drill down</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {allSkus.map((s) => {
            const isSelected = selectedSku?.id === s.id;
            const devAbs = Math.abs(s.deviationPct);
            return (
              <button
                key={s.id}
                onClick={() => onSelectSku(s)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] last:border-0 text-left hover:bg-[var(--color-surface-2)] transition-colors",
                  isSelected && "bg-[var(--color-primary-light)]"
                )}
              >
                {/* Status dot */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
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
                  <div className="text-[11px] font-medium text-[var(--color-foreground)] truncate">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-[var(--color-foreground-muted)] flex items-center gap-2 mt-0.5">
                    <span
                      className={cn(
                        "font-medium",
                        devAbs > 20
                          ? "text-[var(--color-danger)]"
                          : devAbs > 10
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--color-success)]"
                      )}
                    >
                      {s.deviationPct > 0 ? "+" : ""}
                      {s.deviationPct.toFixed(1)}%
                    </span>
                    <span>·</span>
                    <span>{s.forecastAccuracy}% acc.</span>
                    <span>·</span>
                    <span className="truncate">{s.segment}</span>
                  </div>
                </div>
                <StatusChip action={s.recommendedAction} size="sm" />
                <ChevronRight size={12} className="text-[var(--color-foreground-subtle)] flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
