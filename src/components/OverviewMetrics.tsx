import React from "react";
import { Wallet, Zap, CreditCard, ShieldAlert, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SimulationHistoryResult } from "@/types/meter";
import { formatBDT, formatUnits } from "@/lib/utils";

interface OverviewMetricsProps {
  history: SimulationHistoryResult;
  caseId: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ history, caseId }) => {
  const isLowBalance = history.finalBalance < 200;
  const isNegative = history.finalBalance <= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Rebuilt Current Balance */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isNegative
          ? "bg-rose-950/40 border-rose-500/50"
          : isLowBalance
          ? "bg-amber-950/30 border-amber-500/40"
          : "glass-panel glass-panel-hover"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reconstructed Balance
          </span>
          <div className={`p-2 rounded-xl border ${
            isNegative
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : isLowBalance
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {formatBDT(history.finalBalance)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {isNegative ? (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" /> Balance Exhausted
            </span>
          ) : isLowBalance ? (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" /> Meter Low Balance Warning
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> Active & Operational
            </span>
          )}
          <span className="text-slate-500">| Start: {formatBDT(history.openingBalance)}</span>
        </div>
      </div>

      {/* 2. Total Units Consumed */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Units Consumed
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
          {formatUnits(history.totalUnitsConsumed)}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>{history.timeline.length} Recorded Days</span>
          <span className="text-cyan-400 font-medium">
            ~{(history.totalUnitsConsumed / Math.max(1, history.timeline.length)).toFixed(1)} kWh/day
          </span>
        </div>
      </div>

      {/* 3. Total Money Consumed by Meter */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Meter Deductions
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
          {formatBDT(history.totalCostConsumed)}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Fixed Fees: {formatBDT(history.totalFixedCharges)}</span>
          <span>VAT: {formatBDT(history.totalVatCost)}</span>
        </div>
      </div>

      {/* 4. Total Recharges Deposited */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Recharges Added
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
          {formatBDT(history.totalRecharged)}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>{history.rechargeEventsCount} Recharge Events</span>
          <span className="text-emerald-400 font-medium">
            Net: {formatBDT(history.totalRecharged - history.totalFixedCharges)}
          </span>
        </div>
      </div>
    </div>
  );
};
