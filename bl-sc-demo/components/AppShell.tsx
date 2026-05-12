"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DemandPlanningPage from "./DemandPlanningPage";
import CopilotDrawer from "./CopilotDrawer";
import PlaceholderPage, { PLACEHOLDER_PAGES } from "./PlaceholderPage";

function MainContent() {
  const { currentPage } = useAppState();

  return (
    <AnimatePresence mode="wait">
      {currentPage === "demand-planning" ? (
        <motion.div
          key="demand-planning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-4 min-h-0"
        >
          <DemandPlanningPage />
        </motion.div>
      ) : (
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-4 min-h-0"
        >
          {PLACEHOLDER_PAGES[currentPage] ? (
            <PlaceholderPage {...PLACEHOLDER_PAGES[currentPage]} />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Shell() {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top announcement banner */}
        <div className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 bg-[#0f172a] text-[10px] text-[#94a3b8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
          <span>
            AI-enabled planning, autonomous execution support, and decision intelligence for B&L.
          </span>
        </div>
        <Header />
        <MainContent />
      </div>
      <CopilotDrawer />
    </div>
  );
}

export default function AppShell() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
