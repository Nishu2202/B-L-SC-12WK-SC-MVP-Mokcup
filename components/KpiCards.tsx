"use client";

import {
  TrendingUp,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  BarChart2,
} from "lucide-react";
import { KPI_SUMMARY } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Status = "success" | "warning" | "danger" | "info";

const STATUS_CONFIG: Record<
  Status,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  danger: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  info: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-100",
    icon: <ArrowUpCircle className="w-4 h-4" />,
  },
};

const KPI_ICONS: Record<string, React.ReactNode> = {
  demandSpike: <TrendingUp className="w-4 h-4" />,
  topSKUsAtRisk: <AlertTriangle className="w-4 h-4" />,
  forecastAdjustment: <ArrowUpCircle className="w-4 h-4" />,
  confidence: <CheckCircle2 className="w-4 h-4" />,
  timeToDetect: <Clock className="w-4 h-4" />,
  forecastBias: <BarChart2 className="w-4 h-4" />,
};

const STATUS_LABELS: Record<Status, string> = {
  success: "On track",
  warning: "Warning",
  danger: "Needs review",
  info: "Recommended action",
};

export default function KpiCards() {
  const entries = Object.entries(KPI_SUMMARY) as [
    keyof typeof KPI_SUMMARY,
    (typeof KPI_SUMMARY)[keyof typeof KPI_SUMMARY]
  ][];

  return (
    <div className="grid grid-cols-6 gap-3">
      {entries.map(([key, kpi], i) => {
        const cfg = STATUS_CONFIG[kpi.status];
        return (
          <div
            key={key}
            className={cn(
              "bg-white rounded-xl border p-3.5 hover:shadow-sm transition-shadow cursor-default",
              cfg.border
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={cn("p-1.5 rounded-lg", cfg.bg, cfg.text)}>
                {KPI_ICONS[key]}
              </span>
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                  cfg.bg,
                  cfg.text
                )}
              >
                {STATUS_LABELS[kpi.status]}
              </span>
            </div>
            <p className="text-xl font-bold text-[#0f172a] leading-none mb-1">
              {kpi.value}
            </p>
            <p className="text-[10px] font-medium text-[#334155] leading-tight mb-0.5">
              {kpi.label}
            </p>
            <p className="text-[10px] text-[#94a3b8] leading-tight">{kpi.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
