"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import KpiCards from "./KpiCards";
import DemandChart from "./DemandChart";
import RecommendationPanel from "./RecommendationPanel";
import { skus, getAggregateHistory } from "@/lib/mock-data";
import type { SkuData } from "@/lib/mock-data";

const aggregateData = getAggregateHistory();

type SheetTab = "spiking-declining" | "segmentation";

const sheetTabs: { id: SheetTab; label: string; icon: React.ElementType }[] = [
  { id: "spiking-declining", label: "Spiking/Declining SKU", icon: TrendingUp },
  { id: "segmentation", label: "SKU Segmentation & Forecast Strategy", icon: Grid3X3 },
];

export default function DemandPlanningPage() {
  const [selectedSku, setSelectedSku] = useState<SkuData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<SheetTab>("spiking-declining");

  const handleSelectSku = (sku: SkuData) => {
    setSelectedSku((prev) => (prev?.id === sku.id ? null : sku));
    setToast(`Viewing ${sku.name}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-background)]">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-sidebar-bg)] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg border border-slate-700"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-5 pb-8 space-y-5 max-w-[1600px]">
        {/* Section label */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--color-foreground)]">
              Demand Planning Agent
            </h2>
            <p className="text-xs text-[var(--color-foreground-muted)] mt-0.5">
              Planning cycle: April 2025 · Region: Global · Category: All Lenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">Spike detected · 2 Days</span>
            </div>
            <div className="text-xs text-[var(--color-foreground-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1.5">
              Last refreshed: 2 min ago
            </div>
          </div>
        </div>

        {/* Sheet tabs - prominent style */}
        <div className="flex items-center gap-2">
          {sheetTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSheet === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSheet(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 text-sm font-semibold rounded-xl transition-all",
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
                    : "bg-[var(--color-surface)] text-[var(--color-foreground-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sheet 1: Spiking/Declining SKU */}
        {activeSheet === "spiking-declining" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* KPI cards - only on Sheet 1 */}
            <KpiCards selectedSku={selectedSku} allSkus={skus} />

            {/* Main layout: SKU list (left) + Graph & AI recommendation (right) */}
            <div className="grid grid-cols-[280px_1fr] gap-4">
              {/* Left: SKU list */}
              <RecommendationPanel
                selectedSku={selectedSku}
                allSkus={skus}
                onSelectSku={handleSelectSku}
                view="sku-list"
              />
              
              {/* Right: Graph on top, AI recommendation below */}
              <div className="flex flex-col gap-4">
                <DemandChart selectedSku={selectedSku} aggregateData={aggregateData} />
                <RecommendationPanel
                  selectedSku={selectedSku}
                  allSkus={skus}
                  onSelectSku={handleSelectSku}
                  view="details"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Sheet 2: SKU Segmentation & Forecast Strategy */}
        {activeSheet === "segmentation" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center max-w-md">
              <Grid3X3 size={48} className="mx-auto text-[var(--color-foreground-muted)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                SKU Segmentation & Forecast Strategy
              </h3>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Metrics and visualizations for this sheet will be configured soon.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
