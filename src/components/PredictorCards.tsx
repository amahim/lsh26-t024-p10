"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import {
  predictRunOutDate,
  calculateRechargeForTargetDate,
  addDays,
} from "@/lib/meter-engine";
import { formatBDT } from "@/lib/utils";

interface PredictorCardsProps {
  currentBalance: number;
  todayDate: string;
  defaultDailyUnits: number;
  defaultTargetDate: string;
  currentMonthUnits: number;
}

export const PredictorCards: React.FC<PredictorCardsProps> = ({
  currentBalance,
  todayDate,
  defaultDailyUnits,
  defaultTargetDate,
  currentMonthUnits,
}) => {
  // Question A state
  const [dailyUnits, setDailyUnits] = useState<number>(defaultDailyUnits);

  // Question B state
  const [targetDate, setTargetDate] = useState<string>(
    defaultTargetDate || addDays(todayDate, 25)
  );

  // Re-run predictors
  const runOutResult = predictRunOutDate(
    currentBalance,
    dailyUnits,
    todayDate,
    currentMonthUnits
  );

  const targetBreakdown = calculateRechargeForTargetDate(
    currentBalance,
    targetDate,
    dailyUnits,
    todayDate,
    currentMonthUnits,
    false
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ========================================================= */}
      {/* QUESTION 1: When Does Balance Run Out?                    */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-800 hover:border-cyan-500/30 transition shadow-xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Question 1: Run-Out Date Forecast
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    MVP 3.A
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Given current <strong>{formatBDT(currentBalance)}</strong> balance & daily consumption
                </p>
              </div>
            </div>
          </div>

          {/* Daily Usage Controller */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">Usual Daily Consumption:</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {dailyUnits} kWh / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={dailyUnits}
              onChange={(e) => setDailyUnits(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Light (3–6 u)</span>
              <span>Moderate (8–15 u)</span>
              <span>Heavy AC (20+ u)</span>
            </div>
          </div>

          {/* Forecast Hero Result */}
          <div className={`p-5 rounded-xl border text-center transition ${
            currentBalance <= 0
              ? "bg-rose-950/30 border-rose-500/40"
              : runOutResult.daysRemaining <= 5
              ? "bg-amber-950/30 border-amber-500/40"
              : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800"
          }`}>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              Estimated Run-Out Date
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {runOutResult.runOutDate ? (
                <span>{runOutResult.runOutDate}</span>
              ) : (
                <span className="text-emerald-400">Sufficient Long-Term Balance</span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold flex items-center justify-center gap-1.5">
              {currentBalance <= 0 ? (
                <span className="text-rose-400">⚠️ Balance is already ৳0.00 or negative!</span>
              ) : (
                <span className={runOutResult.daysRemaining <= 5 ? "text-amber-400" : "text-emerald-400"}>
                  ⏳ Balance will last approximately <strong>{runOutResult.daysRemaining} days</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Future projection notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Starting Reference: <strong>{todayDate}</strong></span>
          <span className="text-slate-400">Includes 1st-of-month slab resets</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* QUESTION 2: Required Recharge for Target Date             */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-800 hover:border-emerald-500/30 transition shadow-xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Question 2: Target Date Budget Planner
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    MVP 3.B
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Exact BDT recharge needed today to sustain usage until your target date
                </p>
              </div>
            </div>
          </div>

          {/* Target Date Picker */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Select Target Date:
              </span>
              <input
                type="date"
                value={targetDate}
                min={addDays(todayDate, 1)}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
              <span>Duration: <strong>{targetBreakdown.totalDays} days</strong></span>
              <span>Projected Energy: <strong>{targetBreakdown.totalUnits} kWh</strong></span>
            </div>
          </div>

          {/* Recharge Recommendation Hero Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Required Recharge Today
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  {formatBDT(targetBreakdown.recommendedRechargeToday)}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-slate-400">Total Projected Cost</div>
                <div className="font-mono font-bold text-white">
                  {formatBDT(targetBreakdown.totalRequiredCost)}
                </div>
                <div className="text-[10px] text-slate-400">
                  Minus Current Balance ({formatBDT(targetBreakdown.currentBalance)})
                </div>
              </div>
            </div>
          </div>

          {/* 4-Way Itemized Decomposition Breakdown */}
          <div className="space-y-2 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span>Itemized Cost Decomposition</span>
              <span className="text-[10px] text-emerald-400 font-normal">Mandatory Breakdown</span>
            </div>

            {/* 1. Base Energy */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                1. Base Energy (Tier 1 @ ৳4.63/u):
              </span>
              <span className="font-mono font-medium text-slate-200">
                {formatBDT(targetBreakdown.baseEnergyCost)}
              </span>
            </div>

            {/* 2. Higher Slab Surcharge */}
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2. Higher Slab Surcharge:
              </span>
              <span className="font-mono font-semibold">
                +{formatBDT(targetBreakdown.higherSlabSurcharge)}
              </span>
            </div>

            {/* 3. Fixed Charges */}
            <div className="flex items-center justify-between text-cyan-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                3. Fixed Charges (Demand + Meter Rent):
              </span>
              <span className="font-mono font-semibold">
                +{formatBDT(targetBreakdown.fixedCharges)}
              </span>
            </div>

            {/* 4. VAT */}
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                4. VAT on Energy (5%):
              </span>
              <span className="font-mono font-semibold">
                +{formatBDT(targetBreakdown.vatCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target Date: <strong>{targetDate}</strong></span>
          <span className="text-emerald-400 font-medium">100% Tariff Formula Compliant</span>
        </div>
      </div>
    </div>
  );
};
