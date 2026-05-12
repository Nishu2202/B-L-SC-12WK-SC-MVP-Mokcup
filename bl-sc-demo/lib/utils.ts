import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPct(n: number, showPlus = true): string {
  const s = Math.abs(n).toFixed(1) + "%";
  if (n > 0 && showPlus) return "+" + s;
  if (n < 0) return "-" + s;
  return s;
}
