"use client";

import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-[var(--color-background)] p-12">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
          <Construction size={22} className="text-[var(--color-foreground-subtle)]" />
        </div>
        <h2 className="text-base font-semibold text-[var(--color-foreground)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--color-foreground-muted)] leading-relaxed mb-6">
          {description ??
            "This module is currently in development. It will provide full planning and decision support capabilities for the B+L supply chain network."}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary-mid)] px-4 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
          <span className="text-xs font-medium text-[var(--color-primary)]">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
