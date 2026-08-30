"use client";

import React, { useState, useMemo } from "react";
import { PUBLIC_CASES, PRESET_CASES, DEFAULT_CASE } from "@/data/cases";
import {
  simulateMeterHistory,
  simulateHabitComparison,
  getSlabProximity,
} from "@/lib/meter-engine";
import { Navbar } from "@/components/Navbar";
import { TariffModal } from "@/components/TariffModal";
import { OverviewMetrics } from "@/components/OverviewMetrics";
import { SlabRadar } from "@/components/SlabRadar";
import { BalanceChart } from "@/components/BalanceChart";
import { PredictorCards } from "@/components/PredictorCards";
import { HabitComparator } from "@/components/HabitComparator";
import { HistoryLedger } from "@/components/HistoryLedger";
import { MonthlyBillInvoice } from "@/components/MonthlyBillInvoice";
import { CustomDataReconciler } from "@/components/CustomDataReconciler";
import { Zap, Sparkles, ShieldCheck, CheckCircle, Info, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("PUB-01");
  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  // Find active case
  const activeCase = useMemo(() => {
    return PUBLIC_CASES.find((c) => c.case_id === selectedCaseId) || DEFAULT_CASE;
  }, [selectedCaseId]);

  // Run core history simulation
  const historyResult = useMemo(() => {
    const openingBal = parseFloat(activeCase.opening_balance_bdt);
    return simulateMeterHistory(openingBal, activeCase.days, activeCase.recharges);
  }, [activeCase]);

  // Active month units for slab proximity
  const lastRecord = historyResult.timeline[historyResult.timeline.length - 1];
  const activeMonthUnits = lastRecord ? lastRecord.endOfMonthUnits : 0;

  // Slab proximity radar
  const slabProximity = useMemo(() => {
    return getSlabProximity(activeMonthUnits);
  }, [activeMonthUnits]);

  // Habit Comparison Result
  const habitComparisonResult = useMemo(() => {
    return simulateHabitComparison(activeCase.comparison, activeCase.days);
  }, [activeCase]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-16 selection:bg-emerald-500 selection:text-slate-900">
      {/* Top Navigation */}
      <Navbar
        cases={PUBLIC_CASES}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
      />

      {/* Tariff Rules Modal */}
      <TariffModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-5 sm:space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-0">
        {/* Curated Preset Scenario Selector */}
        <section className="glass-panel p-3 sm:p-5 rounded-2xl border-slate-800 print:hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Curated Household Case Scenarios
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Selected: <strong className="text-emerald-400">{activeCase.case_id}</strong> ({activeCase.days.length} days)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {PRESET_CASES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedCaseId(preset.id)}
                className={`p-3.5 rounded-xl text-left border transition cursor-pointer ${
                  selectedCaseId === preset.id
                    ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${
                    selectedCaseId === preset.id ? "text-emerald-400" : "text-slate-200"
                  }`}>
                    {preset.id}
                  </span>
                  {selectedCaseId === preset.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-semibold text-white mb-0.5 sm:mb-1">{preset.label}</div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{preset.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Bonus 1: Live Slab Proximity Radar */}
        <section className="print:hidden">
          <SlabRadar proximity={slabProximity} />
        </section>

        {/* Core KPI Metrics */}
        <section className="print:hidden">
          <OverviewMetrics history={historyResult} caseId={activeCase.case_id} />
        </section>

        {/* MVP 2: Reconstructed Meter Balance Interactive Chart */}
        <section className="print:hidden">
          <BalanceChart timeline={historyResult.timeline} />
        </section>

        {/* MVP 3: Question A (Run-Out Date) & Question B (Target Date Recharge Breakdown) */}
        <section className="print:hidden">
          <PredictorCards
            currentBalance={historyResult.finalBalance}
            todayDate={activeCase.today}
            defaultDailyUnits={activeCase.usual_daily_units}
            defaultTargetDate={activeCase.target_date}
            currentMonthUnits={activeMonthUnits}
          />
        </section>

        {/* MVP 4: Recharge Habits Comparative Simulation */}
        <section className="print:hidden">
          <HabitComparator
            comparisonResult={habitComparisonResult}
            comparisonMonths={activeCase.comparison.months}
          />
        </section>

        {/* Single-Month Itemized Tariff Bill */}
        <section className="print:m-0 print:p-0">
          <MonthlyBillInvoice timeline={historyResult.timeline} />
        </section>

        {/* Granular History Ledger (All recorded days) */}
        <section className="print:hidden">
          <HistoryLedger timeline={historyResult.timeline} />
        </section>

        {/* Bonus 2: Custom Data Reconciler & CSV Importer */}
        <section className="print:hidden">
          <CustomDataReconciler />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dhaka Prepaid Electricity Advisor • 100% Deterministic Domestic Tariff Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Domestic LT-A Tariff Verified</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
