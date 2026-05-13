"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Sidebar, { type NavView } from "@/components/Sidebar";
import Header from "@/components/Header";
import DemandPlanningPage from "@/components/DemandPlanningPage";
import PlaceholderPage from "@/components/PlaceholderPage";
import CopilotDrawer from "@/components/CopilotDrawer";
import type { SkuData } from "@/lib/mock-data";

const pageConfig: Record<NavView, { title: string; subtitle?: string }> = {
  overview: { title: "Executive Overview", subtitle: "Global supply chain performance summary" },
  "demand-planning": {
    title: "Demand Planning Agent",
    subtitle: "Agent-Led Supply Chain Planning & Orchestration",
  },
  "supply-planning": { title: "Supply Planning", subtitle: "Supply network and inventory positioning" },
  "nrr-agent": { title: "NRR Agent", subtitle: "Net revenue realization and trade analytics" },
  copilot: { title: "Copilot", subtitle: "AI assistant for supply chain decision support" },
  "policy-settings": {
    title: "Policies & Engine Settings",
    subtitle: "Forecast engine rules and planning policies",
  },
  "sc-parameters": {
    title: "SC Parameters Drift",
    subtitle: "Monitor and recalibrate planning parameters",
  },
};

const placeholderDescriptions: Partial<Record<NavView, string>> = {
  overview:
    "The Executive Overview provides a consolidated view of global supply chain KPIs, regional performance, and top-level planning health across all categories.",
  "supply-planning":
    "Supply Planning will provide full network optimization, inventory positioning recommendations, and replenishment signal management across the B+L distribution network.",
  "nrr-agent":
    "The NRR Agent monitors net revenue realization, trade spend efficiency, and deduction patterns to surface revenue protection opportunities.",
  copilot: undefined,
  "policy-settings":
    "Policies & Engine Settings allows planners to configure forecast engine rules, segmentation thresholds, and approval workflows across the planning stack.",
  "sc-parameters":
    "SC Parameters Drift tracks changes in lead times, safety stock norms, and demand signal parameters — alerting planners when recalibration is needed.",
};

export default function Home() {
  const [activeView, setActiveView] = useState<NavView>("demand-planning");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<SkuData | null>(null);

  const page = pageConfig[activeView];

  const handleNavigate = (view: NavView) => {
    if (view === "copilot") {
      setCopilotOpen(true);
    } else {
      setActiveView(view);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* AI Banner */}
        <div className="flex items-center justify-center gap-2 bg-[var(--color-primary)] px-4 py-1.5 flex-shrink-0">
          <Sparkles size={12} className="text-white opacity-80" />
          <span className="text-[11px] font-medium text-white">
            AI-enabled planning, autonomous execution support, and decision intelligence for B&L.
          </span>
          <Sparkles size={12} className="text-white opacity-80" />
        </div>

        <Header title={page.title} subtitle={page.subtitle} />

        {activeView === "demand-planning" ? (
          <DemandPlanningPage />
        ) : (
          <PlaceholderPage
            title={page.title}
            description={placeholderDescriptions[activeView]}
          />
        )}
      </div>

      <CopilotDrawer
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        selectedSku={selectedSku}
      />
    </div>
  );
}
