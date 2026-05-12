"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KpiCards from "./KpiCards";
import DemandChart from "./DemandChart";
import RecommendationPanel from "./RecommendationPanel";
import SegmentationMatrix from "./SegmentationMatrix";
import { skus, getAggregateHistory } from "@/lib/mock-data";
import type { SkuData } from "@/lib/mock-data";

const aggregateData = getAggregateHistory();

export default function DemandPlanningPage() {
  const [selectedSku, setSelectedSku] = useState<SkuData | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Demand Planning Agent
            </h2>
            <p className="text-[11px] text-[var(--color-foreground-muted)] mt-0.5">
              Planning cycle: April 2025 · Region: Global · Category: All Lenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-amber-700">Spike detected · 48h</span>
            </div>
            <div className="text-[11px] text-[var(--color-foreground-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1">
              Last refreshed: 2 min ago
            </div>
          </div>
        </div>

        {/* KPI cards */}
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

        {/* Segmentation matrix */}
        <SegmentationMatrix
          skus={skus}
          selectedSku={selectedSku}
          onSelectSku={handleSelectSku}
        />
      </div>
    </div>
  );
}
