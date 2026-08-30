export interface SlabTier {
  id: number;
  name: string;
  minUnit: number; // 1-indexed start unit (inclusive)
  maxUnit: number | null; // null for unbounded (601+)
  rate: number; // BDT per unit
}

export interface DayReading {
  date: string; // YYYY-MM-DD
  units: number;
}

export interface RechargeRecord {
  date: string; // YYYY-MM-DD
  amount_bdt: string | number;
}

export interface SlabBreakdownItem {
  slabIndex: number;
  slabName: string;
  units: number;
  rate: number;
  cost: number;
}

export interface DaySimulationRecord {
  date: string;
  dayIndex: number;
  units: number;
  startOfMonthUnits: number;
  endOfMonthUnits: number;
  energyCost: number;
  vatCost: number;
  totalDailyCost: number; // energyCost + vatCost
  rechargeAmount: number;
  fixedChargesDeducted: number; // 82 if first recharge of month, else 0
  netRechargeAdded: number; // rechargeAmount - fixedChargesDeducted
  startOfDayBalance: number;
  endOfDayBalance: number;
  activeSlabId: number;
  activeSlabRate: number;
  isFirstRechargeOfMonth: boolean;
  recharges: { amount: number }[];
}

export interface SimulationHistoryResult {
  timeline: DaySimulationRecord[];
  totalUnitsConsumed: number;
  totalEnergyCost: number;
  totalVatCost: number;
  totalFixedCharges: number;
  totalCostConsumed: number; // energy + vat + fixed
  totalRecharged: number;
  finalBalance: number;
  openingBalance: number;
  rechargeEventsCount: number;
}

export interface RunOutPrediction {
  runOutDate: string | null;
  daysRemaining: number;
  isExhausted: boolean;
  timeline: {
    date: string;
    dayIndex: number;
    units: number;
    monthUnits: number;
    cost: number;
    balance: number;
  }[];
}

export interface TargetRechargeBreakdown {
  targetDate: string;
  startDate: string;
  totalDays: number;
  totalUnits: number;
  baseEnergyCost: number; // Calculated at base slab rate (4.63 BDT)
  higherSlabSurcharge: number; // Extra energy cost due to crossing into higher slabs
  totalEnergyCost: number; // baseEnergyCost + higherSlabSurcharge
  vatCost: number; // 5% on totalEnergyCost
  fixedCharges: number; // Demand (42) + Meter Rent (40) for any first-recharge months
  totalRequiredCost: number; // totalEnergyCost + vatCost + fixedCharges
  currentBalance: number;
  recommendedRechargeToday: number; // Math.max(0, totalRequiredCost - currentBalance)
}

export interface HabitComparisonConfig {
  months: string[]; // e.g. ["2026-04", "2026-05", "2026-06"]
  source: string; // "readings" | "daily_units"
  daily_units: number | null;
  opening_balance_bdt: string | number;
  low_threshold_bdt: string | number;
  low_amount_bdt: string | number;
  monthly_amount_bdt: string | number;
}

export interface HabitMonthlySummary {
  month: string;
  units: number;
  energyCost: number;
  vatCost: number;
  fixedCharges: number;
  rechargesCount: number;
  totalRecharged: number;
  totalCost: number;
  endBalance: number;
}

export interface HabitSimulationRun {
  habitName: "low_balance" | "monthly_1st";
  title: string;
  description: string;
  totalUnits: number;
  totalEnergyCost: number;
  totalVatCost: number;
  totalFixedCharges: number;
  totalCostConsumed: number; // Total meter consumption = energy + vat + fixed
  totalRecharged: number;
  finalBalance: number;
  monthlySummaries: HabitMonthlySummary[];
  timeline: DaySimulationRecord[];
}

export interface HabitComparisonResult {
  lowBalanceHabit: HabitSimulationRun;
  monthlyHabit: HabitSimulationRun;
  costDifference: number; // lowBalance - monthly
  cheaperHabit: "low_balance" | "monthly_1st" | "equal";
  explanation: string;
}

export interface SlabProximityInfo {
  currentSlab: SlabTier;
  nextSlab: SlabTier | null;
  currentMonthUnits: number;
  unitsInCurrentSlab: number;
  unitsToNextSlab: number | null;
  percentageToNextSlab: number;
  isNearNextSlab: boolean; // true if within 15 units of crossing
  nextUnitCost: number;
}

export interface TestCaseData {
  case_id: string;
  opening_balance_bdt: string;
  days: DayReading[];
  recharges: RechargeRecord[];
  today: string;
  usual_daily_units: number;
  target_date: string;
  comparison: HabitComparisonConfig;
}
