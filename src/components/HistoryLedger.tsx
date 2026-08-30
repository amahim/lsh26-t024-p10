"use client";

import React, { useState } from "react";
import { DaySimulationRecord } from "@/types/meter";
import { formatBDT } from "@/lib/utils";
import { Search, Filter, ArrowUpDown, Download, CheckCircle2 } from "lucide-react";

interface HistoryLedgerProps {
  timeline: DaySimulationRecord[];
}

export const HistoryLedger: React.FC<HistoryLedgerProps> = ({ timeline }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "RECHARGES" | "HIGH_SLAB">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredTimeline = timeline.filter((d) => {
    const matchesSearch = d.date.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filterType === "RECHARGES") return d.rechargeAmount > 0;
    if (filterType === "HIGH_SLAB") return d.activeSlabId >= 4;
    return true;
  });

  const totalPages = Math.ceil(filteredTimeline.length / itemsPerPage);
  const paginatedData = filteredTimeline.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border-slate-800 shadow-xl">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Granular Day-by-Day Meter Ledger
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
            Audit every single day's opening balance, progressive tariff slicing, fixed charges, and closing balance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative text-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search date YYYY-MM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
            />
          </div>

          {/* Filter */}
          <div className="flex bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 text-[10px] sm:text-xs overflow-x-auto">
            <button
              onClick={() => {
                setFilterType("ALL");
                setCurrentPage(1);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                filterType === "ALL"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Days ({timeline.length})
            </button>
            <button
              onClick={() => {
                setFilterType("RECHARGES");
                setCurrentPage(1);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                filterType === "RECHARGES"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Recharges Only
            </button>
            <button
              onClick={() => {
                setFilterType("HIGH_SLAB");
                setCurrentPage(1);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                filterType === "HIGH_SLAB"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Slab 4+ Days
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={() => {
              const headers = [
                "Date",
                "Day Index",
                "Opening Balance (BDT)",
                "Recharge Amount (BDT)",
                "Fixed Charges Deducted (BDT)",
                "Daily Consumption (kWh)",
                "Active Slab",
                "Slab Rate (BDT/unit)",
                "Month Cumulative Units (kWh)",
                "Energy Cost (BDT)",
                "VAT 5% (BDT)",
                "Total Daily Deduction (BDT)",
                "Closing Balance (BDT)",
              ];

              const rows = timeline.map((d) => [
                d.date,
                d.dayIndex,
                d.startOfDayBalance.toFixed(2),
                d.rechargeAmount.toFixed(2),
                d.fixedChargesDeducted.toFixed(2),
                d.units.toFixed(2),
                `Slab ${d.activeSlabId}`,
                d.activeSlabRate.toFixed(2),
                d.endOfMonthUnits.toFixed(2),
                d.energyCost.toFixed(2),
                d.vatCost.toFixed(2),
                d.totalDailyCost.toFixed(2),
                d.endOfDayBalance.toFixed(2),
              ]);

              const csvContent =
                "data:text/csv;charset=utf-8," +
                [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute(
                "download",
                `dhaka_prepaid_meter_ledger_${timeline[0]?.date || "export"}.csv`
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
            title="Download complete ledger as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 -mx-1 sm:mx-0">
        <table className="w-full text-left text-[10px] sm:text-xs min-w-[700px]">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Opening Bal</th>
              <th className="p-3">Recharge (+)</th>
              <th className="p-3">Fixed Fee (-)</th>
              <th className="p-3">Daily Units</th>
              <th className="p-3">Active Slab</th>
              <th className="p-3">Month Units</th>
              <th className="p-3">Daily Cost</th>
              <th className="p-3">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
            {paginatedData.map((d) => (
              <tr
                key={d.date}
                className={`hover:bg-slate-800/40 transition ${
                  d.rechargeAmount > 0 ? "bg-emerald-950/20" : ""
                }`}
              >
                <td className="p-3 font-semibold text-slate-200">{d.date}</td>
                <td className="p-3 text-slate-400">{formatBDT(d.startOfDayBalance)}</td>
                <td className="p-3">
                  {d.rechargeAmount > 0 ? (
                    <span className="text-emerald-400 font-bold">
                      +{formatBDT(d.rechargeAmount)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="p-3">
                  {d.fixedChargesDeducted > 0 ? (
                    <span className="text-amber-400 font-semibold">
                      -{formatBDT(d.fixedChargesDeducted)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="p-3 font-sans font-medium text-cyan-300">{d.units} kWh</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                      d.activeSlabId >= 5
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : d.activeSlabId >= 3
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Tier {d.activeSlabId} (৳{d.activeSlabRate.toFixed(2)})
                  </span>
                </td>
                <td className="p-3 text-slate-300">{d.endOfMonthUnits} kWh</td>
                <td className="p-3 text-rose-300 font-semibold">{formatBDT(d.totalDailyCost)}</td>
                <td className="p-3 font-bold text-white">
                  <span
                    className={
                      d.endOfDayBalance < 200 ? "text-amber-400" : "text-emerald-400"
                    }
                  >
                    {formatBDT(d.endOfDayBalance)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredTimeline.length)} of{" "}
            {filteredTimeline.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
