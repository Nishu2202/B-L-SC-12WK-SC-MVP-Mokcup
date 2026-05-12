"use client";

import { AlertTriangle, TrendingUp, Lightbulb, Activity, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkuData } from "@/lib/mock-data";

interface KpiCardsProps {
  selectedSku: SkuData | null;
  allSkus: SkuData[];
}

export default function KpiCards({ selectedSku, allSkus }: KpiCardsProps) {
  const atRisk = allSkus.filter((s) => s.status !== "on-track").length;
  const topDeviation = allSkus.reduce(
    (max, s) => (Math.abs(s.deviationPct) > Math.abs(max) ? s.deviationPct : max),
    0
  );
  const avgAccuracy = Math.round(allSkus.reduce((sum, s) => sum + s.forecastAccuracy, 0) / allSkus.length);
  const spikeDetected = allSkus.some((s) => Math.abs(s.deviationPct) > 15);

  const cards = [
    {
      icon: AlertTriangle,
      label: "Demand Spike Detected",
      value: spikeDetected ? "Active" : "None",
      sub: "Last 2 Days",
      accent: spikeDetected ? "danger" : "success",
      iconColor: spikeDetected ? "text-[var(--color-danger)]" : "text-[var(--color-success)]",
      bgColor: spikeDetected ? "bg-[var(--color-danger-light)]" : "bg-[var(--color-success-light)]",
    },
    {
      icon: TrendingUp,
      label: "SKUs at Risk",
      value: `${atRisk} / ${allSkus.length}`,
      sub: "Require review or action",
      accent: atRisk > 3 ? "danger" : atRisk > 1 ? "warning" : "success",
      iconColor: "text-[var(--color-warning)]",
      bgColor: "bg-[var(--color-warning-light)]",
    },
    {
      icon: Lightbulb,
      label: "Forecast Adjustment",
      value: selectedSku
        ? `${selectedSku.suggestedAdjustmentPct > 0 ? "+" : ""}${selectedSku.suggestedAdjustmentPct}%`
        : `+${allSkus[0].suggestedAdjustmentPct}%`,
      sub: selectedSku ? selectedSku.name : "Top flagged SKU",
      accent: "info",
      iconColor: "text-[var(--color-primary)]",
      bgColor: "bg-[var(--color-primary-light)]",
    },
    {
      icon: Activity,
      label: "Confidence Level",
      value: `${selectedSku ? selectedSku.confidenceScore : allSkus[0].confidenceScore}%`,
      sub: "Model confidence",
      accent: "success",
      iconColor: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success-light)]",
    },
    {
      icon: BarChart2,
      label: "Forecast Bias",
      value: `${topDeviation > 0 ? "+" : ""}${topDeviation.toFixed(1)}%`,
      sub: "Peak deviation this cycle",
      accent: Math.abs(topDeviation) > 20 ? "danger" : "warning",
      iconColor: "text-[var(--color-warning)]",
      bgColor: "bg-[var(--color-warning-light)]",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <Icon size={15} className={card.iconColor} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--color-foreground)] leading-tight">
              {card.value}
            </div>
            <div className="text-sm font-semibold text-[var(--color-foreground)] mt-1 leading-snug">
              {card.label}
            </div>
            <div className="text-xs text-[var(--color-foreground-muted)] mt-0.5 leading-snug">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
