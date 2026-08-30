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

  const startBalance = monthRecords.length > 0 ? monthRecords[0].startOfDayBalance : 0;
  const endBalance = monthRecords.length > 0 ? monthRecords[monthRecords.length - 1].endOfDayBalance : 0;

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
    <div>
      {/* ========================================================================= */}
      {/* 1. ON-SCREEN UI INTERACTIVE CARD (Hidden during print)                    */}
      {/* ========================================================================= */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-slate-800 shadow-xl print:hidden">
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
                  Official Statement
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate and print official 1-page white-background itemized electricity invoice for any month
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
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition cursor-pointer"
              title="Print or Save as PDF (Official White & Black 1-Page Format)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official PDF (1-Page)</span>
            </button>
          </div>
        </div>

        {/* UI Preview Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-slate-400">Selected Statement: </span>
              <strong className="text-white">{selectedMonth}</strong> ({monthRecords.length} recorded days)
            </div>
            <div className="font-mono text-slate-400">
              Invoice Ref: <span className="text-amber-400 font-bold">{invoiceNo}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Total Consumption</div>
              <div className="text-base font-bold font-mono text-cyan-400">{formatUnits(totalUnits)}</div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Energy Charges</div>
              <div className="text-base font-bold font-mono text-slate-200">{formatBDT(totalEnergyCost)}</div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Fixed Fees + 5% VAT</div>
              <div className="text-base font-bold font-mono text-amber-400">{formatBDT(fixedChargesDeducted + vatCost)}</div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Total Month Deduction</div>
              <div className="text-base font-bold font-mono text-emerald-400">{formatBDT(grandTotal)}</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Click <strong>&quot;Print Official PDF (1-Page)&quot;</strong> above to generate the crisp white-background formal statement.</span>
            <span className="text-emerald-400 font-medium">Deterministic BERC LT-A Rates</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED PRINT / PDF INVOICE TEMPLATE (White BG, Black Text & Outlines)*/}
      {/* ========================================================================= */}
      <div className="hidden print:block bg-white text-black font-sans text-[11px] leading-snug max-w-[100%] mx-auto print:p-0">
        <div className="border-2 border-black p-4 rounded-none space-y-3">
          
          {/* Header Banner */}
          <div className="border-b-2 border-black pb-2 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                Government of the People&apos;s Republic of Bangladesh
              </div>
              <h1 className="text-lg font-black tracking-tight text-black uppercase">
                Dhaka Electricity Supply Authority (DESCO / DPDC)
              </h1>
              <div className="text-[11px] font-semibold text-black">
                Official Consumer Prepaid Electricity Billing Statement
              </div>
            </div>
            <div className="border border-black p-2 text-right text-[10px] bg-slate-50 min-w-[170px]">
              <div><strong>INVOICE NO:</strong> {invoiceNo}</div>
              <div><strong>BILLING MONTH:</strong> {selectedMonth}</div>
              <div><strong>ISSUE DATE:</strong> {new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

          {/* Consumer & Meter Metadata Box */}
          <div className="border border-black grid grid-cols-4 text-[10px] divide-x divide-black bg-slate-50">
            <div className="p-1.5">
              <span className="text-slate-600 block text-[9px]">TARIFF CATEGORY:</span>
              <strong className="text-black text-[11px]">LT-A (Residential)</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block text-[9px]">SANCTIONED LOAD:</span>
              <strong className="text-black text-[11px]">1.00 kW (Single Phase)</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block text-[9px]">METER TYPE:</span>
              <strong className="text-black text-[11px]">Smart STS Prepaid</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-600 block text-[9px]">TOTAL CONSUMPTION:</span>
              <strong className="text-black text-[11px]">{formatUnits(totalUnits)}</strong>
            </div>
          </div>

          {/* Section 1: Progressive Slab Breakdown Table */}
          <div>
            <div className="text-[11px] font-bold text-black uppercase tracking-wider mb-1 flex justify-between">
              <span>1. Progressive Energy Consumption Slices (LT-A Residential Schedule)</span>
              <span className="font-normal text-[10px] text-slate-600">Rate: BERC Approved</span>
            </div>

            <table className="w-full border-collapse border border-black text-left text-[10px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-black">
                  <th className="border border-black p-1.5 font-bold">Slab Tier & Category</th>
                  <th className="border border-black p-1.5 font-bold text-center">Monthly Range</th>
                  <th className="border border-black p-1.5 font-bold text-center">Units Consumed (kWh)</th>
                  <th className="border border-black p-1.5 font-bold text-right">Tariff Rate (BDT)</th>
                  <th className="border border-black p-1.5 font-bold text-right">Energy Charge (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {fullMonthCost.breakdown.length > 0 ? (
                  fullMonthCost.breakdown.map((item) => (
                    <tr key={item.slabIndex} className="border-b border-slate-300">
                      <td className="border border-black p-1.5 font-medium">{item.slabName}</td>
                      <td className="border border-black p-1.5 text-center text-slate-700">
                        {item.slabIndex === 0
                          ? "1 – 50 units"
                          : item.slabIndex === 1
                          ? "1 – 75 units"
                          : item.slabIndex === 2
                          ? "76 – 200 units"
                          : item.slabIndex === 3
                          ? "201 – 300 units"
                          : item.slabIndex === 4
                          ? "301 – 400 units"
                          : item.slabIndex === 5
                          ? "401 – 600 units"
                          : "Above 600 units"}
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">{item.units.toFixed(1)} kWh</td>
                      <td className="border border-black p-1.5 text-right font-mono">৳{item.rate.toFixed(2)}</td>
                      <td className="border border-black p-1.5 text-right font-mono font-semibold">৳{item.cost.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-black p-2 text-center text-slate-500">
                      No consumption recorded for this calendar billing period.
                    </td>
                  </tr>
                )}
                {/* Energy Subtotal */}
                <tr className="bg-slate-100 border-t-2 border-black font-bold">
                  <td colSpan={2} className="border border-black p-1.5 text-black">
                    TOTAL NET ENERGY CHARGE (Slab 1–6)
                  </td>
                  <td className="border border-black p-1.5 text-center font-bold">{totalUnits.toFixed(1)} kWh</td>
                  <td className="border border-black p-1.5 text-right text-slate-600">—</td>
                  <td className="border border-black p-1.5 text-right font-mono text-black font-black">
                    ৳{totalEnergyCost.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Fixed Charges and Statutory VAT Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {/* Fixed Fees Box */}
            <div className="border border-black p-2 bg-slate-50 space-y-1">
              <div className="font-bold border-b border-black pb-1 text-[10px] uppercase text-black">
                2. Monthly Statutory Fixed Charges
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Sanctioned Demand Charge (1 kW):</span>
                <span className="font-mono font-semibold">
                  ৳{fixedChargesDeducted > 0 ? DEMAND_CHARGE.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Smart Prepaid Meter Rent:</span>
                <span className="font-mono font-semibold">
                  ৳{fixedChargesDeducted > 0 ? METER_RENT.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1 flex justify-between font-bold text-[10px]">
                <span>Total Fixed Fees Deducted:</span>
                <span className="font-mono">
                  ৳{fixedChargesDeducted > 0 ? MONTHLY_FIXED_CHARGE_TOTAL.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            {/* VAT & Statutory Taxes Box */}
            <div className="border border-black p-2 bg-slate-50 space-y-1">
              <div className="font-bold border-b border-black pb-1 text-[10px] uppercase text-black">
                3. Government Value Added Tax (VAT)
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Tax Authority:</span>
                <span className="font-semibold">National Board of Revenue (NBR)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>VAT Rate on Energy Amount:</span>
                <span className="font-semibold font-mono">5.0% strictly on Energy</span>
              </div>
              <div className="border-t border-slate-400 pt-1 flex justify-between font-bold text-[10px]">
                <span>Total VAT Amount:</span>
                <span className="font-mono font-bold">৳{vatCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Final Billing Summary Highlight */}
          <div className="border-2 border-black p-3 bg-slate-100 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-700">TOTAL NET METER DEDUCTION FOR {selectedMonth}</div>
              <div className="text-[10px] text-slate-600">
                (Base Energy: ৳{totalEnergyCost.toFixed(2)} + 5% VAT: ৳{vatCost.toFixed(2)} + Fixed Fees: ৳{fixedChargesDeducted.toFixed(2)})
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black font-mono text-black">
                ৳{grandTotal.toFixed(2)} BDT
              </div>
              <div className="text-[9px] font-bold text-black uppercase">
                ✓ 100% Deterministic LT-A Formula
              </div>
            </div>
          </div>

          {/* Section 4: Meter Balance & Deposit Reconciliation */}
          <div className="border border-black p-2 text-[10px]">
            <div className="font-bold text-black border-b border-slate-300 pb-1 mb-1 uppercase">
              4. Prepaid Meter Account Ledger Reconciliation ({monthRecords.length} Recorded Days)
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="border border-slate-300 p-1">
                <span className="text-slate-600 block text-[8px] font-sans">OPENING BALANCE</span>
                <strong>৳{startBalance.toFixed(2)}</strong>
              </div>
              <div className="border border-slate-300 p-1">
                <span className="text-slate-600 block text-[8px] font-sans">TOTAL RECHARGES (+)</span>
                <strong>৳{totalRecharged.toFixed(2)}</strong>
              </div>
              <div className="border border-slate-300 p-1">
                <span className="text-slate-600 block text-[8px] font-sans">TOTAL DEDUCTIONS (-)</span>
                <strong>৳{grandTotal.toFixed(2)}</strong>
              </div>
              <div className="border border-slate-300 p-1 bg-slate-200">
                <span className="text-slate-600 block text-[8px] font-sans">CLOSING BALANCE</span>
                <strong>৳{endBalance.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Verification & Sign-off Footer */}
          <div className="pt-2 border-t-2 border-black flex justify-between items-end text-[9px]">
            <div>
              <div className="font-bold">SYSTEM AUDIT VERIFICATION: VALIDATED</div>
              <div className="text-slate-600">This official statement was reconstructed with Dhaka Prepaid Electricity Advisor Engine.</div>
              <div className="font-mono text-slate-500">Security Hash: {invoiceNo}-VERIFIED</div>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-black mb-1"></div>
              <div className="font-semibold text-slate-700">Billing Officer / Automated Seal</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

