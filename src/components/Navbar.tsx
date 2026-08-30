import React from "react";
import { Zap, ShieldCheck, HelpCircle, Activity } from "lucide-react";
import { TestCaseData } from "@/types/meter";

interface NavbarProps {
  cases: TestCaseData[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  onOpenTariffModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  onOpenTariffModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[56px] sm:h-16 flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-0">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 shrink-0">
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-sm sm:text-lg text-white tracking-tight truncate">
                DESCO / DPDC
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium hidden xs:inline whitespace-nowrap">
                Prepaid Meter Advisor
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block truncate">
              Dhaka Domestic Tariff • 6-Tier Slab Rebuilder & Forecasting Engine
            </p>
          </div>
        </div>

        {/* Right: Case Selector & Tariff Info */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs">
            <span className="text-slate-400 hidden md:inline">Dataset Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer max-w-[120px] sm:max-w-none"
            >
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id} className="bg-slate-900 text-slate-200">
                  {c.case_id} ({c.days.length}d, {c.recharges.length}r)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenTariffModal}
            className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 sm:px-3 py-2 rounded-lg border border-slate-700 transition"
            title="View Official Tariff Slabs & Rules"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tariff Rules</span>
          </button>
        </div>
      </div>
    </header>
  );
};
