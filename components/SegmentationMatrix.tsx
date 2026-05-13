"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { SkuData, ForecastEngine } from "@/lib/mock-data";
import { ChevronRight, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

interface SegmentationMatrixProps {
  skus: SkuData[];
  selectedSku: SkuData | null;
  onSelectSku: (sku: SkuData) => void;
}

const engineConfig: Record<ForecastEngine, { color: string; bg: string; dot: string; label: string }> = {
  "Blue Yonder": {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
    label: "Retain BY Forecast",
  },
  OPAL: {
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    label: "Alternate Engine",
  },
  "Blue Yonder + Planner": {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    label: "Planner Review",
  },
  "OPAL + Planner": {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
    label: "Material Risk",
  },
};

const engineIcon: Record<ForecastEngine, ElementType> = {
  "Blue Yonder": CheckCircle2,
  OPAL: Info,
  "Blue Yonder + Planner": AlertCircle,
  "OPAL + Planner": XCircle,
};

const variabilityBar = {
  Low: { width: "w-1/4", color: "bg-green-500" },
  Medium: { width: "w-1/2", color: "bg-amber-500" },
  High: { width: "w-3/4", color: "bg-red-500" },
};

const accuracyColor = (a: number) =>
  a >= 80 ? "text-[var(--color-success)]" : a >= 65 ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]";

export default function SegmentationMatrix({ skus, selectedSku, onSelectSku }: SegmentationMatrixProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
            SKU Segmentation & Forecast Strategy
          </h3>
          <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
            Rule-based engine assignment · Click a row to update chart and recommendation
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          {(Object.entries(engineConfig) as [ForecastEngine, typeof engineConfig[ForecastEngine]][]).map(
            ([engine, cfg]) => (
              <div key={engine} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                <span className="text-[10px] text-[var(--color-foreground-muted)]">{cfg.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
              {[
                { label: "SKU", w: "w-[200px]" },
                { label: "Volume (Units)", w: "w-[110px]" },
                { label: "Variability", w: "w-[100px]" },
                { label: "Forecast Accuracy", w: "w-[130px]" },
                { label: "Suggested Engine", w: "w-[170px]" },
                { label: "Rationale", w: "" },
                { label: "Next Action", w: "w-[140px]" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    "text-left px-4 py-2.5 text-[11px] font-semibold text-[var(--color-foreground-muted)] whitespace-nowrap",
                    col.w
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => {
              const isSelected = selectedSku?.id === sku.id;
              const isHovered = hoveredId === sku.id;
              const engCfg = engineConfig[sku.forecastEngine];
              const EngIcon = engineIcon[sku.forecastEngine];
              const varBar = variabilityBar[sku.variability];

              return (
                <tr
                  key={sku.id}
                  onClick={() => onSelectSku(sku)}
                  onMouseEnter={() => setHoveredId(sku.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "border-b border-[var(--color-border)] last:border-0 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-[var(--color-primary-light)]"
                      : isHovered
                      ? "bg-[var(--color-surface-2)]"
                      : "bg-[var(--color-surface)]"
                  )}
                >
                  {/* SKU */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--color-foreground)] text-[11px] leading-tight">
                      {sku.name}
                    </div>
                    <div className="text-[10px] text-[var(--color-foreground-muted)] mt-0.5">{sku.code}</div>
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-[var(--color-foreground)]">
                      {sku.volume >= 1000
                        ? `${(sku.volume / 1000).toFixed(0)}k`
                        : sku.volume.toLocaleString()}
                    </span>
                  </td>

                  {/* Variability */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden w-16">
                        <div className={cn("h-full rounded-full", varBar.width, varBar.color)} />
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          sku.variability === "Low"
                            ? "text-[var(--color-success)]"
                            : sku.variability === "High"
                            ? "text-[var(--color-danger)]"
                            : "text-[var(--color-warning)]"
                        )}
                      >
                        {sku.variability}
                      </span>
                    </div>
                  </td>

                  {/* Forecast Accuracy */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden w-20">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            sku.forecastAccuracy >= 80
                              ? "bg-[var(--color-success)]"
                              : sku.forecastAccuracy >= 65
                              ? "bg-[var(--color-warning)]"
                              : "bg-[var(--color-danger)]"
                          )}
                          style={{ width: `${sku.forecastAccuracy}%` }}
                        />
                      </div>
                      <span className={cn("font-semibold text-[11px]", accuracyColor(sku.forecastAccuracy))}>
                        {sku.forecastAccuracy}%
                      </span>
                    </div>
                  </td>

                  {/* Engine */}
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                        engCfg.bg,
                        engCfg.color
                      )}
                    >
                      <EngIcon size={11} />
                      {sku.forecastEngine}
                    </div>
                  </td>

                  {/* Rationale */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <span className="text-[11px] text-[var(--color-foreground-muted)] leading-relaxed">
                      {sku.rationale}
                    </span>
                  </td>

                  {/* Next Action */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          sku.recommendedAction === "increase"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : sku.recommendedAction === "decrease"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : sku.recommendedAction === "hold"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                      >
                        {sku.recommendedAction === "increase" && `↑ Increase`}
                        {sku.recommendedAction === "decrease" && `↓ Decrease`}
                        {sku.recommendedAction === "hold" && `— Hold`}
                        {sku.recommendedAction === "rebalance" && `↔ Rebalance`}
                      </span>
                      <ChevronRight size={11} className="text-[var(--color-foreground-subtle)]" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
