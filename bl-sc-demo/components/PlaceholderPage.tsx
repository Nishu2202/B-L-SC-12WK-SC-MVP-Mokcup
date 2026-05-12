"use client";

import { motion } from "framer-motion";
import { Clock, Wrench } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features: string[];
}

export default function PlaceholderPage({ title, description, features }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full min-h-80 text-center px-8"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] mb-4">
        <Wrench className="w-5 h-5 text-[#94a3b8]" />
      </div>
      <h2 className="text-base font-semibold text-[#0f172a] mb-2">{title}</h2>
      <p className="text-sm text-[#64748b] max-w-md leading-relaxed mb-5">{description}</p>

      <div className="bg-white border border-[#e2e8f0] rounded-xl px-5 py-4 max-w-sm w-full text-left">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">
            Coming soon
          </span>
        </div>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
              <span className="text-[11px] text-[#64748b]">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Page definitions ─────────────────────────────────────────────────────────

export const PLACEHOLDER_PAGES: Record<
  string,
  { title: string; description: string; features: string[] }
> = {
  "executive-overview": {
    title: "Executive Overview",
    description:
      "A consolidated planning summary across all modules — forecast health, supply risk, NRR status, and agent activity.",
    features: [
      "Cross-module KPI rollup",
      "Top risks & decisions dashboard",
      "Planning cycle status tracker",
      "Agent activity log",
    ],
  },
  "supply-planning": {
    title: "Supply Planning",
    description:
      "Capacity balancing, supply constraint detection, and AI-driven procurement recommendations.",
    features: [
      "Supply vs. demand gap analysis",
      "Capacity utilization heatmap",
      "Constraint flagging & resolution",
      "Procurement signal generation",
    ],
  },
  "nrr-agent": {
    title: "NRR Agent",
    description:
      "Net revenue realization intelligence — chargebacks, price deviation analysis, and gross-to-net optimization.",
    features: [
      "Chargeback pattern detection",
      "Price deviation alerts",
      "Gross-to-net modeling",
      "Channel rebate tracking",
    ],
  },
  "policies": {
    title: "Policies & Engine Settings",
    description:
      "Configure forecast engine assignment rules, segmentation thresholds, and planning policy parameters.",
    features: [
      "Forecast engine rule editor",
      "Segmentation threshold configuration",
      "Deviation alert sensitivity",
      "Planner override governance",
    ],
  },
  "sc-parameters": {
    title: "SC Parameters Drift",
    description:
      "Monitor and recalibrate supply chain model parameters as business conditions evolve.",
    features: [
      "Parameter drift detection",
      "Seasonal pattern recalibration",
      "Demand signal freshness tracking",
      "Model performance benchmarking",
    ],
  },
};
