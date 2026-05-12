import { cn } from "@/lib/utils";
import type { SkuStatus, RecommendedAction } from "@/lib/mock-data";

const statusConfig: Record<SkuStatus, { label: string; className: string; dot: string }> = {
  "on-track": {
    label: "On Track",
    className: "bg-[var(--color-success-light)] text-[var(--color-success)] border-green-200",
    dot: "bg-[var(--color-success)]",
  },
  warning: {
    label: "Warning",
    className: "bg-[var(--color-warning-light)] text-[var(--color-warning)] border-amber-200",
    dot: "bg-[var(--color-warning)]",
  },
  "high-deviation": {
    label: "High Deviation",
    className: "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-red-200",
    dot: "bg-[var(--color-danger)]",
  },
  "needs-review": {
    label: "Needs Review",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
};

const actionConfig: Record<RecommendedAction, { label: string; className: string }> = {
  increase: { label: "Increase forecast", className: "bg-blue-50 text-blue-700 border-blue-200" },
  decrease: { label: "Decrease forecast", className: "bg-amber-50 text-amber-700 border-amber-200" },
  hold: { label: "Hold & monitor", className: "bg-slate-100 text-slate-600 border-slate-200" },
  rebalance: { label: "Rebalance dist.", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

interface StatusChipProps {
  status?: SkuStatus;
  action?: RecommendedAction;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusChip({ status, action, size = "sm", className }: StatusChipProps) {
  if (status) {
    const cfg = statusConfig[status];
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-medium",
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          cfg.className,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
        {cfg.label}
      </span>
    );
  }
  if (action) {
    const cfg = actionConfig[action];
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          cfg.className,
          className
        )}
      >
        {cfg.label}
      </span>
    );
  }
  return null;
}
