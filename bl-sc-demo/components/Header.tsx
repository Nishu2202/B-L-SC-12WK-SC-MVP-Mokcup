"use client";

import { Bell, Search, ChevronDown, Bot } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { useState } from "react";

const REGIONS = ["All Regions", "North America", "EMEA", "APAC", "LATAM"];
const CATEGORIES = ["All Categories", "Contact Lenses", "Pharmaceutical", "Surgical Equipment", "Specialty Lenses"];
const PRODUCTS = ["All Products", "SofLens Daily", "Biotrue ONEday", "Lotemax SM", "Ultra for Presbyopia"];

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs text-[#334155] hover:border-[#94a3b8] transition-colors"
      >
        <span className="text-[10px] font-medium text-[#64748b]">{label}:</span>
        <span className="font-medium truncate max-w-24">{value}</span>
        <ChevronDown className="w-3 h-3 text-[#94a3b8] ml-0.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#e2e8f0] rounded-lg shadow-lg min-w-40 py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-[#f1f5f9] transition-colors",
                value === opt ? "text-[#0e7490] font-semibold" : "text-[#334155]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "executive-overview": { title: "Executive Overview", sub: "Consolidated planning summary · May 2025" },
  "demand-planning": { title: "Demand Planning Agent", sub: "AI-driven demand sensing & forecast correction · May 2025" },
  "supply-planning": { title: "Supply Planning", sub: "Capacity & supply balancing · May 2025" },
  "nrr-agent": { title: "NRR Agent", sub: "Net revenue realization intelligence · May 2025" },
  "copilot": { title: "Copilot", sub: "AI planning assistant · May 2025" },
  "policies": { title: "Policies & Engine Settings", sub: "Forecast engine configuration · May 2025" },
  "sc-parameters": { title: "SC Parameters Drift", sub: "Parameter drift monitoring & recalibration · May 2025" },
};

export default function Header() {
  const {
    currentPage,
    setCopilotOpen,
    regionFilter,
    setRegionFilter,
    categoryFilter,
    setCategoryFilter,
  } = useAppState();
  const [product, setProduct] = useState("All Products");
  const pageInfo = PAGE_TITLES[currentPage] ?? PAGE_TITLES["demand-planning"];

  return (
    <header className="flex items-center gap-4 h-14 px-5 bg-white border-b border-[#e2e8f0] flex-shrink-0">
      {/* Page title */}
      <div className="flex-shrink-0">
        <h1 className="text-sm font-semibold text-[#0f172a] leading-tight">{pageInfo.title}</h1>
        <p className="text-[10px] text-[#94a3b8] leading-tight">{pageInfo.sub}</p>
      </div>

      <div className="w-px h-7 bg-[#e2e8f0] mx-1" />

      {/* Search */}
      <div className="relative flex-1 max-w-52">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Search SKUs, categories..."
          className="w-full pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#334155] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]/20"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <FilterDropdown
          label="Region"
          options={REGIONS}
          value={regionFilter}
          onChange={setRegionFilter}
        />
        <FilterDropdown
          label="Category"
          options={CATEGORIES}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <FilterDropdown
          label="Product"
          options={PRODUCTS}
          value={product}
          onChange={setProduct}
        />
      </div>

      <div className="flex-1" />

      {/* Copilot button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e7490] text-white rounded-lg text-xs font-medium hover:bg-[#0c6680] transition-colors"
      >
        <Bot className="w-3.5 h-3.5" />
        Ask Copilot
      </button>

      {/* Notifications */}
      <button className="relative p-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors">
        <Bell className="w-4 h-4 text-[#64748b]" />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8f0]">
        <div className="w-7 h-7 rounded-full bg-[#0e7490] flex items-center justify-center text-white text-xs font-semibold">
          SM
        </div>
        <div className="hidden lg:block">
          <p className="text-xs font-medium text-[#0f172a] leading-tight">S. Mitchell</p>
          <p className="text-[10px] text-[#94a3b8] leading-tight">VP Supply Chain</p>
        </div>
      </div>
    </header>
  );
}
