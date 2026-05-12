"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CopilotMessage, SkuData } from "@/lib/mock-data";
import {
  copilotPromptSuggestions,
  copilotResponses,
} from "@/lib/mock-data";

interface CopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedSku: SkuData | null;
}

const basisConfig = {
  rule: { label: "Rule-based", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
  trend: { label: "Trend analysis", icon: TrendingUp, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-light)]" },
  anomaly: { label: "Anomaly detection", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
};

export default function CopilotDrawer({ open, onClose, selectedSku }: CopilotDrawerProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello. I'm your B+L Supply Chain Copilot. Ask me about demand spikes, forecast adjustments, SKU segments, or engine recommendations.",
      bullets: [
        "Select a SKU in the main view for context-aware answers",
        "Use the suggested prompts below to get started",
        "Results are grounded in the current planning cycle data",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const matchedKey = Object.keys(copilotResponses).find((k) =>
        text.toLowerCase().includes(k.toLowerCase().slice(0, 10))
      );
      const response = matchedKey
        ? copilotResponses[matchedKey]
        : {
            id: `a-${Date.now()}`,
            role: "assistant" as const,
            content: selectedSku
              ? `Based on the selected SKU — ${selectedSku.name} — the current deviation is ${selectedSku.deviationPct > 0 ? "+" : ""}${selectedSku.deviationPct.toFixed(1)}% versus the expected profile. The recommended action is to ${selectedSku.recommendedAction} the current forecast with ${selectedSku.confidenceScore}% confidence.`
              : "I need more context to answer precisely. Please select a SKU from the main view or try one of the suggested prompts.",
            bullets: selectedSku
              ? [
                  `Forecast accuracy: ${selectedSku.forecastAccuracy}%`,
                  `Suggested adjustment: ${selectedSku.suggestedAdjustmentPct > 0 ? "+" : ""}${selectedSku.suggestedAdjustmentPct}%`,
                  `Current engine: ${selectedSku.forecastEngine}`,
                ]
              : undefined,
            confidence: selectedSku?.confidenceScore,
            basis: "rule" as const,
          };

      setMessages((prev) => [...prev, { ...response, id: `a-${Date.now()}` }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 z-40"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-[380px] bg-[var(--color-surface)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-[var(--shadow-drawer)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] flex-shrink-0">
              <div className="p-1.5 rounded-lg bg-[var(--color-primary-light)]">
                <Sparkles size={14} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--color-foreground)]">SC Copilot</div>
                <div className="text-[10px] text-[var(--color-foreground-muted)]">
                  {selectedSku ? `Context: ${selectedSku.name}` : "No SKU selected"}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <X size={15} className="text-[var(--color-foreground-muted)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] bg-[var(--color-primary)] text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] space-y-2">
                      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-xs text-[var(--color-foreground)] leading-relaxed">{msg.content}</p>

                        {msg.action && (
                          <div className="mt-2 flex items-start gap-2 bg-white border border-[var(--color-border)] rounded-lg px-3 py-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] font-semibold text-[var(--color-primary)] leading-relaxed">
                              {msg.action}
                            </p>
                          </div>
                        )}

                        {msg.bullets && (
                          <ul className="mt-2 space-y-1">
                            {msg.bullets.map((b, i) => (
                              <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--color-foreground-muted)]">
                                <span className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">•</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Confidence + basis */}
                      {(msg.confidence !== undefined || msg.basis) && (
                        <div className="flex items-center gap-2 px-1">
                          {msg.confidence !== undefined && (
                            <span className="text-[10px] text-[var(--color-foreground-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-2 py-0.5">
                              {msg.confidence}% confidence
                            </span>
                          )}
                          {msg.basis && (() => {
                            const bcfg = basisConfig[msg.basis];
                            const BIcon = bcfg.icon;
                            return (
                              <span
                                className={cn(
                                  "text-[10px] font-medium rounded-full px-2 py-0.5 flex items-center gap-1",
                                  bcfg.bg,
                                  bcfg.color
                                )}
                              >
                                <BIcon size={10} />
                                {bcfg.label}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--color-foreground-subtle)]"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts */}
            <div className="px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0">
              <div className="text-[10px] text-[var(--color-foreground-muted)] mb-2 font-medium uppercase tracking-wide">
                Suggested
              </div>
              <div className="flex flex-wrap gap-1.5">
                {copilotPromptSuggestions.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-2.5 py-1 text-[var(--color-foreground-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-5 pt-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 focus-within:border-[var(--color-primary)] transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask a supply chain question..."
                  className="flex-1 bg-transparent text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-subtle)] outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    input.trim()
                      ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                      : "text-[var(--color-foreground-subtle)] cursor-not-allowed"
                  )}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
