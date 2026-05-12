"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useAppState } from "@/lib/app-state";
import {
  COPILOT_PROMPTS,
  COPILOT_RESPONSES,
  CopilotMessage,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const BASIS_CONFIG = {
  rule: { label: "Rule-based", color: "text-emerald-700", bg: "bg-emerald-50" },
  trend: { label: "Trend signal", color: "text-sky-700", bg: "bg-sky-50" },
  anomaly: { label: "Anomaly detected", color: "text-amber-700", bg: "bg-amber-50" },
};

function ConfidenceChip({ value }: { value: number }) {
  const color =
    value >= 80 ? "text-emerald-700 bg-emerald-50" : value >= 65 ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", color)}>
      {value}% confidence
    </span>
  );
}

function AssistantCard({ msg }: { msg: CopilotMessage }) {
  const basisCfg = msg.basis ? BASIS_CONFIG[msg.basis] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-2.5"
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0e7490] flex items-center justify-center mt-0.5">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Summary */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-[#0e7490]">Summary</span>
            {msg.confidence && <ConfidenceChip value={msg.confidence} />}
            {basisCfg && (
              <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full ml-auto", basisCfg.bg, basisCfg.color)}>
                {basisCfg.label}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#334155] leading-relaxed">{msg.summary}</p>
        </div>

        {/* Recommended action */}
        {msg.action && (
          <div className="bg-[#f0fdff] rounded-xl border border-[#0e7490]/20 p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#0e7490] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-[#0e7490] mb-0.5">Recommended action</p>
                <p className="text-[11px] text-[#475569] leading-relaxed">{msg.action}</p>
              </div>
            </div>
          </div>
        )}

        {/* Supporting bullets */}
        {msg.bullets && msg.bullets.length > 0 && (
          <div className="bg-[#f8fafc] rounded-xl border border-[#f1f5f9] p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-[#64748b] mb-1.5">Supporting detail</p>
            {msg.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#94a3b8] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#475569] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 justify-end">
      <div className="bg-[#0e7490] rounded-xl px-3 py-2 max-w-[80%]">
        <p className="text-[11px] text-white leading-relaxed">{text}</p>
      </div>
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center mt-0.5">
        <User className="w-3 h-3 text-[#64748b]" />
      </div>
    </div>
  );
}

interface Thread {
  question: string;
  response: CopilotMessage;
}

export default function CopilotDrawer() {
  const { copilotOpen, setCopilotOpen, selectedSKU } = useAppState();
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [threads, thinking]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setInput("");

    const key = Object.keys(COPILOT_RESPONSES).find((k) =>
      text.toLowerCase().includes(k.toLowerCase().slice(0, 12))
    );
    const response = key
      ? COPILOT_RESPONSES[key]
      : {
          role: "assistant" as const,
          content: text,
          summary: `Based on current demand data${selectedSKU ? ` for ${selectedSKU.name}` : ""}, the system has no specific rule-based answer for this query. Please consult the planning team or run a manual analysis.`,
          action: "Review the segmentation matrix and compare against historical data.",
          bullets: [
            "Ensure the forecast engine is aligned with SKU variability profile.",
            "Cross-reference with EMEA/APAC regional actuals for context.",
          ],
          confidence: 62,
          basis: "trend" as const,
        };

    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setThreads((prev) => [...prev, { question: text, response }]);
    }, 900 + Math.random() * 600);
  }

  return (
    <AnimatePresence>
      {copilotOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCopilotOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-[#f8fafc] border-l border-[#e2e8f0] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[#e2e8f0]">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0e7490]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0f172a]">Planning Copilot</h2>
                <p className="text-[10px] text-[#94a3b8]">
                  {selectedSKU
                    ? `Context: ${selectedSKU.name}`
                    : "AI supply chain assistant"}
                </p>
              </div>
              <button
                onClick={() => setCopilotOpen(false)}
                className="ml-auto p-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                <X className="w-4 h-4 text-[#64748b]" />
              </button>
            </div>

            {/* Prompt suggestions */}
            {threads.length === 0 && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-2.5">
                  Suggested questions
                </p>
                <div className="space-y-1.5">
                  {COPILOT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[11px] text-[#334155] hover:border-[#0e7490]/40 hover:bg-[#f0fdff] transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{prompt}</span>
                        <ChevronRight className="w-3 h-3 text-[#94a3b8] group-hover:text-[#0e7490] transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {threads.map((t, i) => (
                <div key={i} className="space-y-3">
                  <UserBubble text={t.question} />
                  <AssistantCard msg={t.response} />
                </div>
              ))}

              {thinking && (
                <div className="flex gap-2.5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0e7490] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] px-3 py-2.5 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#0e7490]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 bg-white border-t border-[#e2e8f0]">
              {threads.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {COPILOT_PROMPTS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-[9px] font-medium px-2 py-1 bg-[#f1f5f9] text-[#64748b] rounded-full hover:bg-[#e2e8f0] transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                  placeholder={`Ask about ${selectedSKU?.name ?? "demand planning"}...`}
                  className="flex-1 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#334155] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]/20"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || thinking}
                  className="p-2 bg-[#0e7490] text-white rounded-lg hover:bg-[#0c6680] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
