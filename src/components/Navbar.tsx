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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                DESCO / DPDC
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Prepaid Meter Advisor
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Dhaka Domestic Tariff • 6-Tier Slab Rebuilder & Forecasting Engine
            </p>
          </div>
        </div>

        {/* Right: Case Selector & Tariff Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400 hidden md:inline">Dataset Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id} className="bg-slate-900 text-slate-200">
                  {c.case_id} ({c.days.length} days, {c.recharges.length} recharges)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenTariffModal}
            className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition"
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
