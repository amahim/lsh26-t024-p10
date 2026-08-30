"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, Layers, FileCode } from "lucide-react";
import { simulateMeterHistory } from "@/lib/meter-engine";
import { DayReading, RechargeRecord, SimulationHistoryResult } from "@/types/meter";
import { formatBDT } from "@/lib/utils";

export const CustomDataReconciler: React.FC = () => {
  const [openingBalanceInput, setOpeningBalanceInput] = useState("500.00");
  const [rechargeInput, setRechargeInput] = useState(
    `2026-07-02, 1000.00\n2026-07-15, 500.00\n2026-07-28, 800.00`
  );
  const [readingsInput, setReadingsInput] = useState(
    `2026-07-01, 8\n2026-07-02, 10\n2026-07-03, 12\n2026-07-04, 9\n2026-07-05, 11\n2026-07-06, 14\n2026-07-07, 10`
  );

  const [simResult, setSimResult] = useState<SimulationHistoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateCustom = () => {
    try {
      setError(null);
      const opening = parseFloat(openingBalanceInput);
      if (isNaN(opening)) throw new Error("Invalid opening balance amount");

      // Parse recharges
      const recharges: RechargeRecord[] = rechargeInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const parts = line.split(/[,\t]/).map((p) => p.trim());
          if (parts.length < 2) throw new Error(`Invalid recharge line: "${line}"`);
          const amt = parseFloat(parts[1]);
          if (isNaN(amt)) throw new Error(`Invalid recharge amount in: "${line}"`);
          return { date: parts[0], amount_bdt: amt };
        });

      // Parse days
      const days: DayReading[] = readingsInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const parts = line.split(/[,\t]/).map((p) => p.trim());
          if (parts.length < 2) throw new Error(`Invalid reading line: "${line}"`);
          const units = parseInt(parts[1], 10);
          if (isNaN(units)) throw new Error(`Invalid unit value in: "${line}"`);
          return { date: parts[0], units };
        });

      if (days.length === 0) throw new Error("Please enter at least one daily reading");

      const result = simulateMeterHistory(opening, days, recharges);
      setSimResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to parse custom data");
      setSimResult(null);
    }
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Real Meter Recharge Reconciler
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline">
              Audit Tool
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste your household's actual recharge dates & daily unit consumption to audit real meter deduction balance
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Opening Balance (BDT)
          </label>
          <input
            type="number"
            value={openingBalanceInput}
            onChange={(e) => setOpeningBalanceInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Recharges (YYYY-MM-DD, Amount)
          </label>
          <textarea
            rows={4}
            value={rechargeInput}
            onChange={(e) => setRechargeInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Daily Readings (YYYY-MM-DD, Units)
          </label>
          <textarea
            rows={4}
            value={readingsInput}
            onChange={(e) => setReadingsInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mb-4 sm:mb-6">
        <button
          onClick={handleSimulateCustom}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-900/30 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Rebuild Custom Meter History
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {simResult && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Reconciliation Summary
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ✓ Successfully Rebuilt {simResult.timeline.length} Days
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-sans">Final Balance:</div>
              <div className="text-base font-bold text-emerald-400">{formatBDT(simResult.finalBalance)}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-sans">Total Energy Cost:</div>
              <div className="text-base font-bold text-slate-200">{formatBDT(simResult.totalEnergyCost)}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-sans">Fixed Charges:</div>
              <div className="text-base font-bold text-amber-400">{formatBDT(simResult.totalFixedCharges)}</div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-sans">5% VAT Deducted:</div>
              <div className="text-base font-bold text-cyan-400">{formatBDT(simResult.totalVatCost)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
