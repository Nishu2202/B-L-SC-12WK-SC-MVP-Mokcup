"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Repeat2,
  MessageSquareMore,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";

export type NavView =
  | "overview"
  | "demand-planning"
  | "supply-planning"
  | "nrr-agent"
  | "copilot"
  | "policy-settings"
  | "sc-parameters";

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
  { id: "demand-planning", label: "Demand Planning Agent", icon: TrendingUp },
  { id: "supply-planning", label: "Supply Planning", icon: Package },
  { id: "nrr-agent", label: "NRR Agent", icon: Repeat2 },
  { id: "copilot", label: "Copilot", icon: MessageSquareMore },
  { id: "policy-settings", label: "Policies & Engine Settings", icon: Settings2 },
  { id: "sc-parameters", label: "SC Parameters Drift", icon: SlidersHorizontal },
];

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-screen bg-[var(--color-sidebar-bg)] border-r border-slate-800 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)]">
          <span className="text-white text-xs font-bold tracking-tight">B+L</span>
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">Bausch + Lomb</div>
          <div className="text-slate-500 text-[10px] leading-tight mt-0.5">Supply Chain AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="mb-2 px-3">
          <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest">
            Planning
          </span>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group",
                    isActive
                      ? "bg-[var(--color-sidebar-active-bg)] text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-[var(--color-primary)]" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span className="text-xs font-medium leading-tight min-w-0">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] ml-auto flex-shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800" />
    </aside>
  );
}
