"use client";

import React, { createContext, useContext, useState } from "react";
import { SKU, SKU_DATA } from "./mock-data";

export type NavPage =
  | "executive-overview"
  | "demand-planning"
  | "supply-planning"
  | "nrr-agent"
  | "copilot"
  | "policies"
  | "sc-parameters";

export type ChartView = "aggregate" | "sku" | "month" | "history";

interface AppState {
  currentPage: NavPage;
  setCurrentPage: (p: NavPage) => void;
  selectedSKU: SKU | null;
  setSelectedSKU: (s: SKU | null) => void;
  chartView: ChartView;
  setChartView: (v: ChartView) => void;
  copilotOpen: boolean;
  setCopilotOpen: (o: boolean) => void;
  regionFilter: string;
  setRegionFilter: (r: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<NavPage>("demand-planning");
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(SKU_DATA[0]);
  const [chartView, setChartView] = useState<ChartView>("aggregate");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  return (
    <AppStateContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedSKU,
        setSelectedSKU,
        chartView,
        setChartView,
        copilotOpen,
        setCopilotOpen,
        regionFilter,
        setRegionFilter,
        categoryFilter,
        setCategoryFilter,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
