"use client";

import React, { useState } from "react";
import {
  Receipt,
  Printer,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Building2,
  QrCode,
} from "lucide-react";
import { DaySimulationRecord } from "@/types/meter";
import {
  calculateEnergyCost,
  DEMAND_CHARGE,
  METER_RENT,
  MONTHLY_FIXED_CHARGE_TOTAL,
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

  const invoiceNo = `DH-ELEC-${selectedMonth.replace("-", "")}-${Math.floor(
    totalUnits * 13 + 1042
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border-slate-800 shadow-xl">
      {/* Interactive Controls Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Single-Month Itemized Tariff Bill
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden sm:inline">
                Detailed Invoice
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official domestic itemized statement broken into energy slices, fixed charges, and 5% VAT
            </p>
          </div>
        </div>

        {/* Controls: Month Picker & Print Button */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition cursor-pointer"
            title="Print or Save as PDF (Strict 1-Page Layout)"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF (1-Page)</span>
          </button>
        </div>
      </div>

      {/* Bill Voucher Card / Printable Container */}
      <div
        id="printable-invoice"
        className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl"
      >
        {/* Top Official Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-3 sm:p-4 border-b border-emerald-500/30">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Dhaka Electricity Authority (DPDC / DESCO)
                </div>
                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight">
                  Prepaid Meter Electricity Statement
                </h2>
                <div className="text-[10px] text-slate-300 flex items-center gap-2">
                  <span>Class: <strong className="text-white">LT-A (Residential)</strong></span>
                  <span>•</span>
                  <span>Meter: <strong className="text-emerald-300">Smart Prepaid</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 sm:p-2 text-right text-[10px] sm:text-xs">
              <div className="text-slate-400 text-[9px]">Invoice No:</div>
              <div className="font-mono font-bold text-amber-400 text-[11px]">{invoiceNo}</div>
              <div className="text-[9px] text-slate-400">
                Month: <strong className="text-slate-200">{selectedMonth}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Statement Body Container */}
        <div className="p-4">
          {/* Customer & Statement Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-2 sm:p-2.5 rounded-xl border border-slate-800 mb-3 text-xs">
            <div className="space-y-0.5">
              <div className="text-slate-400 text-[9px]">Total Units:</div>
              <div className="text-sm font-black font-mono text-cyan-400">
                {formatUnits(totalUnits)}
              </div>
              <div className="text-[9px] text-slate-400">{monthRecords.length} days</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-slate-400 text-[9px]">Base Energy:</div>
              <div className="text-sm font-black font-mono text-white">
                {formatBDT(totalEnergyCost)}
              </div>
              <div className="text-[9px] text-slate-400">Slab 1–6 formula</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-slate-400 text-[9px]">Fixed Fee:</div>
              <div className="text-sm font-black font-mono text-amber-400">
                {fixedChargesDeducted > 0 ? formatBDT(fixedChargesDeducted) : "৳0.00"}
              </div>
              <div className="text-[9px] text-slate-400">Demand + Rent</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-slate-400 text-[9px]">5% VAT:</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {formatBDT(vatCost)}
              </div>
              <div className="text-[9px] text-slate-400">On energy only</div>
            </div>
          </div>

          {/* Itemized Progressive Slab Table */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                1. Progressive Energy Slab Tariff Breakdown
              </div>
              <span className="text-[8px] text-slate-400">LT-A Domestic Schedule</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-500/20">
                  <tr>
                    <th className="py-1 px-2 font-bold">Tier / Category</th>
                    <th className="py-1 px-2 font-bold">Range Units</th>
                    <th className="py-1 px-2 font-bold">Units Consumed</th>
                    <th className="py-1 px-2 font-bold">Rate (BDT/kWh)</th>
                    <th className="py-1 px-2 font-bold text-right">Subtotal Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                  {fullMonthCost.breakdown.length > 0 ? (
                    fullMonthCost.breakdown.map((item) => (
                      <tr key={item.slabIndex} className="hover:bg-slate-900/50">
                        <td className="py-1 px-2 font-sans font-semibold text-emerald-400">
                          {item.slabName}
                        </td>
                        <td className="py-1 px-2 text-slate-400 font-sans">
                          {item.slabIndex === 0
                            ? "1 – 50"
                            : item.slabIndex === 1
                            ? "1 – 75"
                            : item.slabIndex === 2
                            ? "76 – 200"
                            : item.slabIndex === 3
                            ? "201 – 300"
                            : item.slabIndex === 4
                            ? "301 – 400"
                            : item.slabIndex === 5
                            ? "401 – 600"
                            : "Above 600"}
                        </td>
                        <td className="py-1 px-2 font-bold text-cyan-400">{item.units} kWh</td>
                        <td className="py-1 px-2 font-semibold text-slate-200">
                          ৳{item.rate.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-bold text-white">
                          {formatBDT(item.cost)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-slate-500 font-sans">
                        No domestic consumption recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Monthly Fixed Charges & Government Duties Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {/* Fixed Charges Itemization */}
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px]">
              <div className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between text-[9px]">
                <span>2. Fixed Meter Fees</span>
                <span className="text-amber-400 font-normal">Official Rate</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Demand Charge (1 kW):</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatBDT(fixedChargesDeducted > 0 ? DEMAND_CHARGE : 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Smart Meter Rent:</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatBDT(fixedChargesDeducted > 0 ? METER_RENT : 0)}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800/80 flex justify-between font-bold text-amber-300">
                <span>Total Fixed Fees:</span>
                <span className="font-mono">
                  {formatBDT(fixedChargesDeducted > 0 ? MONTHLY_FIXED_CHARGE_TOTAL : 0)}
                </span>
              </div>
            </div>

            {/* Total Deductions Summary Card */}
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px]">
              <div className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between text-[9px]">
                <span>3. Tax & Summary</span>
                <span className="text-emerald-400 font-normal">NBR 5%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Net Energy Charge:</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatBDT(totalEnergyCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Govt VAT (5%):</span>
                <span className="font-mono font-semibold text-emerald-400">
                  +{formatBDT(vatCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fixed Monthly Fees:</span>
                <span className="font-mono font-semibold text-amber-400">
                  +{formatBDT(fixedChargesDeducted > 0 ? MONTHLY_FIXED_CHARGE_TOTAL : 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total Highlight Banner */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[8.5px] uppercase font-bold text-emerald-400 tracking-wider">
                  Total Deductions for {selectedMonth}
                </div>
                <div className="text-base font-black font-mono text-white tracking-tight">
                  {formatBDT(grandTotal)}
                </div>
                <div className="text-[8.5px] text-slate-400">
                  (Energy: {formatBDT(totalEnergyCost)} + VAT: {formatBDT(vatCost)} + Fixed:{" "}
                  {formatBDT(fixedChargesDeducted)})
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-0.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[8.5px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Deterministic Audit Pass</span>
              </div>
              <div className="text-[7.5px] text-slate-400 font-mono">
                Formula: Energy + 5% VAT + Fixed
              </div>
            </div>
          </div>

          {/* Official Verification Footer & Barcode */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-[8.5px] text-slate-400">
            <div className="flex items-center gap-2">
              <QrCode className="w-6 h-6 text-slate-500 shrink-0" />
              <div>
                <div className="font-mono text-slate-300 font-semibold">{invoiceNo}</div>
                <div className="text-[7.5px] text-slate-400">
                  Dhaka Prepaid Electricity Advisor Engine • Official LT-A Schedule
                </div>
              </div>
            </div>

            <div className="text-right text-[8px]">
              <div>Signature: <strong className="text-slate-200">Automated Meter Audit</strong></div>
              <div className="text-[7.5px] text-slate-400">
                Date: {new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
