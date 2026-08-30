import React from "react";
import { AlertCircle, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { SlabProximityInfo } from "@/types/meter";
import { VAT_RATE } from "@/lib/meter-engine";

interface SlabRadarProps {
  proximity: SlabProximityInfo;
}

export const SlabRadar: React.FC<SlabRadarProps> = ({ proximity }) => {
  const {
    currentSlab,
    nextSlab,
    currentMonthUnits,
    unitsToNextSlab,
    percentageToNextSlab,
    isNearNextSlab,
  } = proximity;

  const currentRateWithVat = currentSlab.rate * (1 + VAT_RATE);
  const nextRateWithVat = nextSlab ? nextSlab.rate * (1 + VAT_RATE) : null;
  const priceJumpPercent = nextSlab
    ? (((nextSlab.rate - currentSlab.rate) / currentSlab.rate) * 100).toFixed(1)
    : "0.0";

  return (
    <div className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ${
      isNearNextSlab
        ? "bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20"
        : "glass-panel glass-panel-hover"
    }`}>
      <div className="flex flex-col gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isNearNextSlab
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Slab Proximity Radar
              </h3>
              {isNearNextSlab && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider animate-bounce">
                  Approaching Escalation
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Active Tier: <span className="font-semibold text-slate-200">Slab {currentSlab.id} ({currentSlab.name})</span> @ ৳{currentSlab.rate.toFixed(2)}/unit
            </p>
          </div>
        </div>

        {/* Next Unit Cost Tag */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-[11px] text-slate-400">Next Unit Cost (inc. VAT):</span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            ৳{currentRateWithVat.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex flex-col xs:flex-row xs:justify-between gap-0.5 text-[10px] sm:text-xs text-slate-400 font-mono">
          <span>{currentMonthUnits} kWh used this month</span>
          <span>
            {nextSlab ? (
              unitsToNextSlab !== null && unitsToNextSlab > 0 ? (
                <span className={isNearNextSlab ? "text-amber-400 font-bold" : ""}>
                  {unitsToNextSlab} kWh until Slab {nextSlab.id}
                </span>
              ) : (
                "At upper threshold"
              )
            ) : (
              <span className="text-rose-400 font-bold">Top Tier Slab 6 Active (10.70 BDT)</span>
            )}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isNearNextSlab
                ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-sm shadow-rose-500/50"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`}
            style={{ width: `${percentageToNextSlab}%` }}
          />
        </div>
      </div>

      {/* Escalation Warning / Comparison Strip */}
      {nextSlab ? (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs pt-1 border-t border-slate-800/80 text-slate-400">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Next Bracket: <strong>Slab {nextSlab.id}</strong> (৳{nextSlab.rate.toFixed(2)} + 5% VAT = ৳{nextRateWithVat?.toFixed(3)})</span>
          </div>
          <div className="text-amber-400 font-medium">
            Rate Hike: <span className="font-bold">+{priceJumpPercent}%</span> per unit
          </div>
        </div>
      ) : (
        <div className="text-xs text-rose-400 pt-1 border-t border-slate-800/80">
          ⚠️ You have reached the highest residential rate (৳10.70/kWh). Every unit consumes maximum meter balance until the 1st of next month.
        </div>
      )}
    </div>
  );
};
