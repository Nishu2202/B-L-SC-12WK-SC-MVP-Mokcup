"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex-shrink-0">
      {/* Title */}
      <div className="flex-shrink-0">
        <h1 className="text-sm font-semibold text-[var(--color-foreground)] leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-[var(--color-foreground-muted)] leading-tight mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="h-5 w-px bg-[var(--color-border)] mx-1" />

      {/* Search */}
      <div className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 w-52">
        <Search size={13} className="text-[var(--color-foreground-subtle)] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search SKUs, regions..."
          className="bg-transparent text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-subtle)] outline-none flex-1 min-w-0"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["Region", "Category", "Product"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-foreground-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)] transition-colors"
          >
            {f}
            <ChevronDown size={11} />
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button className="relative p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors">
          <Bell size={16} className="text-[var(--color-foreground-muted)]" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[var(--color-danger)] border-2 border-white" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[var(--color-border-strong)] transition-colors">
          <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">BF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[var(--color-foreground)] leading-tight">Breda Furlong</span>
            <span className="text-[10px] text-[var(--color-foreground-muted)] leading-tight">VP Supply Chain</span>
          </div>
          <ChevronDown size={11} className="text-[var(--color-foreground-subtle)]" />
        </div>
      </div>
    </header>
  );
}
