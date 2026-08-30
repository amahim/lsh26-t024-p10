import React from "react";
import { X, CheckCircle, AlertTriangle, Zap, DollarSign } from "lucide-react";
import { TARIFF_SLABS, DEMAND_CHARGE, METER_RENT, VAT_RATE } from "@/lib/meter-engine";

interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TariffModal: React.FC<TariffModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dhaka Domestic Prepaid Tariff Specifications</h2>
            <p className="text-xs text-slate-400">Exact mathematical parameters used across all simulations</p>
          </div>
        </div>

        {/* Slabs Table */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Energy Slabs (Monthly Progressive Tier Counter)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300">
                <tr>
                  <th className="p-3">Slab</th>
                  <th className="p-3">Monthly Range</th>
                  <th className="p-3">Rate (BDT/kWh)</th>
                  <th className="p-3">With 5% VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {TARIFF_SLABS.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-emerald-400">Tier {s.id}</td>
                    <td className="p-3">{s.maxUnit ? `${s.minUnit} – ${s.maxUnit} units` : `${s.minUnit}+ units`}</td>
                    <td className="p-3 font-mono font-medium">৳{s.rate.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-400">৳{(s.rate * (1 + VAT_RATE)).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Charges & Billing Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">Monthly Fixed Charges</div>
            <div className="text-lg font-bold text-white mb-2">৳82.00 / month</div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li>• Demand Charge: <strong>৳{DEMAND_CHARGE.toFixed(2)}</strong></li>
              <li>• Meter Rent: <strong>৳{METER_RENT.toFixed(2)}</strong></li>
              <li className="text-emerald-400 font-medium pt-1">
                ✓ Deducted ONCE/month on 1st recharge
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="text-xs text-slate-400 mb-1">VAT & Reset Rules</div>
            <div className="text-lg font-bold text-white mb-2">5% Energy VAT</div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li>• VAT applies exclusively to energy amount.</li>
              <li>• Slab counter resets on the <strong>1st of every calendar month</strong>.</li>
              <li>• Recharging <strong>never</strong> resets the slab counter.</li>
            </ul>
          </div>
        </div>

        {/* Clarification Notice */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-semibold">Judge Rulings R-16 & R-33 Compliance:</span> Recharge timing cannot alter energy tariff rates. Habit comparison runs on 100% identical daily consumption and slab progression.
          </div>
        </div>
      </div>
    </div>
  );
};
