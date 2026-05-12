"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Target,
  MessageSquare,
  Settings,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState, NavPage } from "@/lib/app-state";

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "executive-overview",
    label: "Executive Overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "demand-planning",
    label: "Demand Planning Agent",
    icon: <TrendingUp className="w-4 h-4" />,
    badge: "Active",
  },
  {
    id: "supply-planning",
    label: "Supply Planning",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "nrr-agent",
    label: "NRR Agent",
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: "copilot",
    label: "Copilot",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    id: "policies",
    label: "Policies & Engine Settings",
    icon: <Settings className="w-4 h-4" />,
  },
  {
    id: "sc-parameters",
    label: "SC Parameters Drift",
    icon: <GitBranch className="w-4 h-4" />,
  },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, setCopilotOpen } = useAppState();

  function handleNav(item: NavItem) {
    if (item.id === "copilot") {
      setCopilotOpen(true);
      return;
    }
    setCurrentPage(item.id);
  }

  return (
    <aside className="flex flex-col w-56 min-w-56 h-full bg-[#0f172a] border-r border-[#1e293b]">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e293b]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0e7490] text-white font-bold text-sm">
          B+L
        </div>
        <div>
          <p className="text-[#f1f5f9] text-xs font-semibold leading-tight">Bausch + Lomb</p>
          <p className="text-[#64748b] text-[10px] leading-tight">Supply Chain AI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
          Planning Modules
        </p>
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item)}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                    isActive
                      ? "bg-[#0e7490]/20 text-[#22d3ee] border border-[#0e7490]/30"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#e2e8f0]"
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-[#22d3ee]" : "text-[#64748b] group-hover:text-[#94a3b8]"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 text-xs font-medium leading-tight">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#0e7490]/30 text-[#22d3ee] border border-[#0e7490]/40">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <ChevronRight className="w-3 h-3 text-[#22d3ee]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] text-[#475569]">Agent running · Live data</p>
        </div>
        <p className="mt-1 text-[10px] text-[#334155]">
          Planning cycle: May 2025
        </p>
      </div>
    </aside>
  );
}
