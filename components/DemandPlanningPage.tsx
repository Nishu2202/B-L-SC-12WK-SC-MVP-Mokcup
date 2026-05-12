"use client";

import { Zap } from "lucide-react";
import KpiCards from "./KpiCards";
import DemandChart from "./DemandChart";
import RecommendationPanel from "./RecommendationPanel";
import SegmentationMatrix from "./SegmentationMatrix";

export default function DemandPlanningPage() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Agent status banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0e7490]/10 border border-[#0e7490]/20 rounded-xl text-[11px]">
        <Zap className="w-3.5 h-3.5 text-[#0e7490] flex-shrink-0" />
        <span className="text-[#0e7490] font-medium">
          Demand Planning Agent is active.
        </span>
        <span className="text-[#475569]">
          Last scan completed 4 minutes ago · 1 spike detected · 3 SKUs flagged for review.
        </span>
        <span className="ml-auto text-[10px] text-[#94a3b8]">May 12, 2025 · 09:41 UTC</span>
      </div>

      {/* KPI Summary Row */}
      <KpiCards />

      {/* Main two-column layout */}
      <div className="flex gap-4 min-h-0">
        {/* Left: chart */}
        <div className="flex-1 min-w-0">
          <DemandChart />
        </div>

        {/* Right: recommendation + SKU list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto">
          <RecommendationPanel />
        </div>
      </div>

      {/* Segmentation Matrix */}
      <SegmentationMatrix />
    </div>
  );
}
