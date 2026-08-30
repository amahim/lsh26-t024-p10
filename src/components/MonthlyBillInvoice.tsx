"use client";

import React, { useState } from "react";
import { Receipt, FileText, Printer, Zap, CheckCircle2 } from "lucide-react";
import { DaySimulationRecord } from "@/types/meter";
import {
  calculateEnergyCost,
  DEMAND_CHARGE,
  METER_RENT,
  MONTHLY_FIXED_CHARGE_TOTAL,
  VAT_RATE,
} from "@/lib/meter-engine";
import { formatBDT, formatUnits } from "@/lib/utils";

interface MonthlyBillInvoiceProps {
  timeline: DaySimulationRecord[];
}

export const MonthlyBillInvoice: React.FC<MonthlyBillInvoiceProps> = ({ timeline }) => {
  const months = Array.from(new Set(timeline.map((d) => d.date.slice(0, 7))));
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || "");

  const monthRecords = timeline.filter((d) => d.date.startsWith(selectedMonth));
  const totalUnits = monthRecords.reduce((sum, d) => sum + d.units, 0);
  const totalRecharged = monthRecords.reduce((sum, d) => sum + d.rechargeAmount, 0);
  const fixedChargesDeducted = monthRecords.reduce(
    (sum, d) => sum + d.fixedChargesDeducted,
    0
  );

  // Compute exact energy slices for the full month from 0 to totalUnits
  const fullMonthCost = calculateEnergyCost(totalUnits, 0);
  const totalEnergyCost = fullMonthCost.energyCost;
  const vatCost = fullMonthCost.vatCost;
  const grandTotal = totalEnergyCost + vatCost + fixedChargesDeducted;

  return (
    <div className="glass-panel p-6 rounded-2xl border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Single-Month Itemized Tariff Bill
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Detailed Invoice
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official domestic itemized statement broken into energy slices, fixed charges, and 5% VAT
            </p>
          </div>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <span>Billing Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
          >
            {months.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-slate-200">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bill Voucher Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden font-sans">
        {/* Top Watermark / Meta */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
              DESCO / DPDC Domestic Electricity Statement
            </div>
            <div className="text-lg font-extrabold text-white">Billing Period: {selectedMonth}</div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Tariff Class: <strong className="text-slate-200">LT-A (Residential)</strong></div>
            <div>Meter Type: <strong className="text-emerald-400">Prepaid Smart Meter</strong></div>
          </div>
        </div>

        {/* Consumption Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 mb-5 text-xs">
          <div>
            <div className="text-slate-400">Total Month Units:</div>
            <div className="text-base font-bold font-mono text-cyan-400">{formatUnits(totalUnits)}</div>
          </div>
          <div>
            <div className="text-slate-400">Days Recorded:</div>
            <div className="text-base font-bold font-mono text-white">{monthRecords.length} days</div>
          </div>
          <div>
            <div className="text-slate-400">Total Recharges:</div>
            <div className="text-base font-bold font-mono text-emerald-400">{formatBDT(totalRecharged)}</div>
          </div>
          <div>
            <div className="text-slate-400">Fixed Fee Applied:</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {fixedChargesDeducted > 0 ? formatBDT(fixedChargesDeducted) : "৳0.00 (No Recharge)"}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-4 mb-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Progressive Energy Slab Breakdown
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2.5">Slab Name</th>
                  <th className="p-2.5">Units Consumed</th>
                  <th className="p-2.5">Tariff Rate</th>
                  <th className="p-2.5 text-right">Subtotal (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {fullMonthCost.breakdown.length > 0 ? (
                  fullMonthCost.breakdown.map((item) => (
                    <tr key={item.slabIndex}>
                      <td className="p-2.5 font-sans font-medium text-emerald-400">{item.slabName}</td>
                      <td className="p-2.5">{item.units} kWh</td>
                      <td className="p-2.5">৳{item.rate.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-semibold">{formatBDT(item.cost)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500 font-sans">
                      No consumption recorded for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Charges & VAT Summary */}
        <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Total Base Energy Charge:</span>
            <span className="font-mono font-semibold text-white">{formatBDT(totalEnergyCost)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Demand Charge (Monthly):</span>
            <span className="font-mono">{formatBDT(fixedChargesDeducted > 0 ? DEMAND_CHARGE : 0)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Meter Rent (Monthly):</span>
            <span className="font-mono">{formatBDT(fixedChargesDeducted > 0 ? METER_RENT : 0)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Govt. VAT (5% on Energy Amount):</span>
            <span className="font-mono font-semibold text-emerald-400">{formatBDT(vatCost)}</span>
          </div>

          <div className="pt-3 border-t border-slate-700/80 flex justify-between text-sm sm:text-base font-extrabold text-white">
            <span>Grand Total Month Deductions:</span>
            <span className="font-mono text-emerald-400">{formatBDT(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
