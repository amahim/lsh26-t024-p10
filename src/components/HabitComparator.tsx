"use client";

import React, { useState } from "react";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { HabitComparisonResult, DayReading } from "@/types/meter";
import { formatBDT } from "@/lib/utils";

interface HabitComparatorProps {
  comparisonResult: HabitComparisonResult;
  comparisonMonths: string[];
}

export const HabitComparator: React.FC<HabitComparatorProps> = ({
  comparisonResult,
  comparisonMonths,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "chart" | "monthly">("summary");
  const { lowBalanceHabit, monthlyHabit, costDifference, cheaperHabit, explanation } =
    comparisonResult;

  // Merge timelines for dual-curve chart
  const chartData = lowBalanceHabit.timeline.map((lowDay, idx) => {
    const monthDay = monthlyHabit.timeline[idx];
    return {
      date: lowDay.date,
      dayIndex: lowDay.dayIndex,
      units: lowDay.units,
      lowBalance: lowDay.endOfDayBalance,
      monthlyBalance: monthDay ? monthDay.endOfDayBalance : 0,
      lowRecharge: lowDay.rechargeAmount,
      monthlyRecharge: monthDay ? monthDay.rechargeAmount : 0,
    };
  });

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border-slate-800 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Recharge Habits Comparative Simulation
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 hidden sm:inline">
                Behavior Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identical 3-Month Consumption Run ({comparisonMonths.join(", ")}) • Low Balance vs. 1st-of-Month Schedule
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 text-[11px] sm:text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-2 sm:px-3 py-1.5 rounded-md transition font-medium whitespace-nowrap ${
              activeTab === "summary"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Overview & Verdict
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-2 sm:px-3 py-1.5 rounded-md transition font-medium whitespace-nowrap ${
              activeTab === "chart"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dual Trajectory Graph
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-2 sm:px-3 py-1.5 rounded-md transition font-medium whitespace-nowrap ${
              activeTab === "monthly"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Monthly Itemizer
          </button>
        </div>
      </div>

      {/* Habit Comparison Guidance Banner */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] sm:text-xs text-slate-300 flex items-start gap-2 sm:gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">How Meter Billing Works:</span> Both habits use identical daily consumption and the same calendar month slab counter. Recharge timing cannot create an energy rate saving. Total cost represents the money deducted by the meter (Energy + 5% VAT + Applicable Monthly Fixed Charges), not the gross amount deposited.
        </div>
      </div>

      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Habit A: Low Balance Panic Recharge */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Habit A: Low Balance Trigger
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Reactive Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{lowBalanceHabit.description}</p>

              <div className="space-y-2.5 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Units Consumed:</span>
                  <span className="font-mono font-semibold text-slate-200">{lowBalanceHabit.totalUnits} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Cost:</span>
                  <span className="font-mono text-slate-200">{formatBDT(lowBalanceHabit.totalEnergyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VAT (5% on Energy):</span>
                  <span className="font-mono text-slate-200">{formatBDT(lowBalanceHabit.totalVatCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fixed Charges (Demand + Rent):</span>
                  <span className="font-mono text-slate-200">{formatBDT(lowBalanceHabit.totalFixedCharges)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Meter Cost:</span>
                  <span className="font-mono text-amber-400">{formatBDT(lowBalanceHabit.totalCostConsumed)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Total Deposited: <strong>{formatBDT(lowBalanceHabit.totalRecharged)}</strong></span>
                <span>Ending Balance: <strong>{formatBDT(lowBalanceHabit.finalBalance)}</strong></span>
              </div>
            </div>

            {/* Habit B: 1st of Month Planned Recharge */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Habit B: 1st of Month Planned
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Proactive Schedule
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{monthlyHabit.description}</p>

              <div className="space-y-2.5 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Units Consumed:</span>
                  <span className="font-mono font-semibold text-slate-200">{monthlyHabit.totalUnits} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Cost:</span>
                  <span className="font-mono text-slate-200">{formatBDT(monthlyHabit.totalEnergyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VAT (5% on Energy):</span>
                  <span className="font-mono text-slate-200">{formatBDT(monthlyHabit.totalVatCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fixed Charges (Demand + Rent):</span>
                  <span className="font-mono text-slate-200">{formatBDT(monthlyHabit.totalFixedCharges)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Meter Cost:</span>
                  <span className="font-mono text-emerald-400">{formatBDT(monthlyHabit.totalCostConsumed)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Total Deposited: <strong>{formatBDT(monthlyHabit.totalRecharged)}</strong></span>
                <span>Ending Balance: <strong>{formatBDT(monthlyHabit.finalBalance)}</strong></span>
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950/40 border border-violet-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Habit Comparison Verdict
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs">
              <span className="text-slate-400">
                Energy Cost Saving from Timing: <strong className="text-emerald-400">৳0.00 (Identical Rate Curves)</strong>
              </span>
              <span className="text-violet-300 font-medium">
                Deduction Difference: <strong>{formatBDT(Math.abs(costDifference))}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "chart" && (
        <div className="space-y-4">
          <div className="h-[240px] sm:h-[280px] lg:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val: string) => val.slice(5)}
                  minTickGap={20}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val: number) => `৳${Math.round(val)}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5 w-60">
                          <div className="font-bold text-white border-b border-slate-800 pb-1">
                            {data.date} (Day {data.dayIndex})
                          </div>
                          <div className="flex justify-between text-amber-400">
                            <span>Low Balance Habit:</span>
                            <span className="font-mono font-bold">{formatBDT(data.lowBalance)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>1st of Month Habit:</span>
                            <span className="font-mono font-bold">{formatBDT(data.monthlyBalance)}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] pt-1">
                            Daily Consumption: {data.units} kWh
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="lowBalance"
                  name="Habit A: Low Balance Trigger"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="monthlyBalance"
                  name="Habit B: 1st of Month"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-[10px] sm:text-xs min-w-[600px]">
            <thead className="bg-slate-800/80 text-slate-300">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3">Consumption</th>
                <th className="p-3">Habit A Recharges</th>
                <th className="p-3">Habit A Cost</th>
                <th className="p-3">Habit B Recharges</th>
                <th className="p-3">Habit B Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {lowBalanceHabit.monthlySummaries.map((lowMonth, idx) => {
                const monthlyMonth = monthlyHabit.monthlySummaries[idx];
                return (
                  <tr key={lowMonth.month} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{lowMonth.month}</td>
                    <td className="p-3 font-mono">{lowMonth.units} kWh</td>
                    <td className="p-3 font-mono text-amber-400">{formatBDT(lowMonth.totalRecharged)} ({lowMonth.rechargesCount}x)</td>
                    <td className="p-3 font-mono">{formatBDT(lowMonth.totalCost)}</td>
                    <td className="p-3 font-mono text-emerald-400">{formatBDT(monthlyMonth?.totalRecharged || 0)} ({monthlyMonth?.rechargesCount || 0}x)</td>
                    <td className="p-3 font-mono">{formatBDT(monthlyMonth?.totalCost || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
