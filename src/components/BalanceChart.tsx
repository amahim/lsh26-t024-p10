"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { DaySimulationRecord } from "@/types/meter";
import { formatBDT } from "@/lib/utils";
import { Calendar, Layers, Activity, TrendingUp, Info } from "lucide-react";

interface BalanceChartProps {
  timeline: DaySimulationRecord[];
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ timeline }) => {
  const [viewMode, setViewMode] = useState<"balance" | "daily_units" | "combined">("combined");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("ALL");

  // Extract unique months for filter
  const months = Array.from(new Set(timeline.map((d) => d.date.slice(0, 7))));

  const filteredData =
    selectedMonthFilter === "ALL"
      ? timeline
      : timeline.filter((d) => d.date.startsWith(selectedMonthFilter));

  const totalRechargeEvents = filteredData.filter((d) => d.rechargeAmount > 0).length;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl">
      {/* Chart Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Reconstructed Meter Balance Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MVP 2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous day-by-day balance simulation with pinned recharge events and slab transitions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Months ({months.length})</option>
              {months.map((m) => (
                <option key={m} value={m} className="bg-slate-900">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode("combined")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "combined"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setViewMode("balance")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "balance"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setViewMode("daily_units")}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === "daily_units"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Daily Units
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(val: string) => {
                const parts = val.split("-");
                return `${parts[1]}/${parts[2]}`;
              }}
              minTickGap={28}
            />

            {/* Left Y-Axis: Balance in BDT */}
            {(viewMode === "balance" || viewMode === "combined") && (
              <YAxis
                yAxisId="balance"
                stroke="#10b981"
                fontSize={11}
                tickFormatter={(val: number) => `৳${Math.round(val)}`}
                domain={["auto", "auto"]}
              />
            )}

            {/* Right Y-Axis: Daily Units */}
            {(viewMode === "daily_units" || viewMode === "combined") && (
              <YAxis
                yAxisId="units"
                orientation="right"
                stroke="#06b6d4"
                fontSize={11}
                tickFormatter={(val: number) => `${val}u`}
                domain={[0, "auto"]}
              />
            )}

            {(viewMode === "balance" || viewMode === "combined") && (
              <ReferenceLine
                yAxisId="balance"
                y={0}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "0 BDT", fill: "#ef4444", fontSize: 10, position: "insideBottomLeft" }}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: DaySimulationRecord = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs w-64 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-white text-sm">{data.date}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Day {data.dayIndex}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Closing Balance:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatBDT(data.endOfDayBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Consumption:</span>
                          <span className="font-mono text-cyan-400 font-semibold">
                            {data.units} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active Tariff Slab:</span>
                          <span className="font-mono text-slate-200">
                            Slab {data.activeSlabId} (৳{data.activeSlabRate.toFixed(2)})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Month Running Total:</span>
                          <span className="font-mono text-slate-300">
                            {data.endOfMonthUnits} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Cost (inc. 5% VAT):</span>
                          <span className="font-mono text-rose-300">
                            {formatBDT(data.totalDailyCost)}
                          </span>
                        </div>
                      </div>

                      {/* Highlight Recharges on Day */}
                      {data.rechargeAmount > 0 && (
                        <div className="pt-2 border-t border-slate-800 bg-emerald-950/30 -mx-3.5 -mb-3.5 p-3 rounded-b-xl border border-emerald-500/30">
                          <div className="font-bold text-emerald-400 flex items-center justify-between">
                            <span>⚡ Recharge Event:</span>
                            <span className="font-mono">+{formatBDT(data.rechargeAmount)}</span>
                          </div>
                          {data.fixedChargesDeducted > 0 && (
                            <div className="text-[11px] text-amber-300 mt-1 flex justify-between">
                              <span>1st of Month Fixed Fees:</span>
                              <span className="font-mono">-{formatBDT(data.fixedChargesDeducted)}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-emerald-500/80 mt-0.5">
                            Net Balance Added: +{formatBDT(data.netRechargeAdded)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Daily Units Bars */}
            {(viewMode === "daily_units" || viewMode === "combined") && (
              <Bar
                yAxisId="units"
                dataKey="units"
                fill="url(#unitsGradient)"
                radius={[4, 4, 0, 0]}
                opacity={0.65}
                name="Daily Units"
              />
            )}

            {/* Balance Area Curve */}
            {(viewMode === "balance" || viewMode === "combined") && (
              <Area
                yAxisId="balance"
                type="monotone"
                dataKey="endOfDayBalance"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceGradient)"
                name="Meter Balance (BDT)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.rechargeAmount > 0) {
                    return (
                      <g key={`dot-${payload.date}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="animate-pulse cursor-pointer"
                        />
                      </g>
                    );
                  }
                  return <React.Fragment key={`dot-empty-${payload.date}`} />;
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300 font-medium">Rebuilt Balance (BDT)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-cyan-500/60 inline-block" />
            <span className="text-slate-300 font-medium">Daily Consumption (kWh)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white inline-block animate-pulse" />
            <span className="text-emerald-400 font-semibold">
              Recharge Marker ({totalRechargeEvents} events in view)
            </span>
          </div>
        </div>

        <div className="text-slate-500 italic">
          Tip: Hover over any point or green marker to see granular tariff calculations
        </div>
      </div>
    </div>
  );
};
