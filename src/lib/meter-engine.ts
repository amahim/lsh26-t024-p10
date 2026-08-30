import {
  SlabTier,
  DayReading,
  RechargeRecord,
  SlabBreakdownItem,
  DaySimulationRecord,
  SimulationHistoryResult,
  RunOutPrediction,
  TargetRechargeBreakdown,
  HabitComparisonConfig,
  HabitSimulationRun,
  HabitComparisonResult,
  SlabProximityInfo,
  HabitMonthlySummary,
} from "@/types/meter";

export const TARIFF_SLABS: readonly SlabTier[] = [
  { id: 1, name: "Slab 1 (1–75)", minUnit: 1, maxUnit: 75, rate: 4.63 },
  { id: 2, name: "Slab 2 (76–200)", minUnit: 76, maxUnit: 200, rate: 5.26 },
  { id: 3, name: "Slab 3 (201–300)", minUnit: 201, maxUnit: 300, rate: 5.63 },
  { id: 4, name: "Slab 4 (301–400)", minUnit: 301, maxUnit: 400, rate: 5.83 },
  { id: 5, name: "Slab 5 (401–600)", minUnit: 401, maxUnit: 600, rate: 9.30 },
  { id: 6, name: "Slab 6 (601+)", minUnit: 601, maxUnit: null, rate: 10.70 },
] as const;

export const DEMAND_CHARGE = 42.0;
export const METER_RENT = 40.0;
export const MONTHLY_FIXED_CHARGE_TOTAL = DEMAND_CHARGE + METER_RENT; // 82.00 BDT
export const VAT_RATE = 0.05; // 5% VAT on energy amount

/**
 * Calculates energy cost for consuming `units` starting from `startMonthUnits` in a calendar month.
 * Handles partial and multiple slab crossings cleanly.
 */
export function calculateEnergyCost(
  units: number,
  startMonthUnits: number
): {
  energyCost: number;
  vatCost: number;
  totalCost: number;
  endMonthUnits: number;
  breakdown: SlabBreakdownItem[];
  effectiveSlabRate: number;
} {
  if (units <= 0) {
    const activeSlab = getActiveSlab(startMonthUnits);
    return {
      energyCost: 0,
      vatCost: 0,
      totalCost: 0,
      endMonthUnits: startMonthUnits,
      breakdown: [],
      effectiveSlabRate: activeSlab.rate,
    };
  }

  let unitsRemaining = units;
  let currentUnitPtr = startMonthUnits;
  let totalEnergyCost = 0;
  const breakdown: SlabBreakdownItem[] = [];

  for (const slab of TARIFF_SLABS) {
    if (unitsRemaining <= 0) break;

    const slabStart = slab.minUnit - 1; // 0-indexed start
    const slabEnd = slab.maxUnit !== null ? slab.maxUnit : Infinity;

    if (currentUnitPtr < slabEnd) {
      const unitsAvailableInSlab = slabEnd - currentUnitPtr;
      const unitsInThisSlab = Math.min(unitsRemaining, unitsAvailableInSlab);

      if (unitsInThisSlab > 0) {
        const costForSlab = unitsInThisSlab * slab.rate;
        totalEnergyCost += costForSlab;
        breakdown.push({
          slabIndex: slab.id,
          slabName: slab.name,
          units: unitsInThisSlab,
          rate: slab.rate,
          cost: costForSlab,
        });

        unitsRemaining -= unitsInThisSlab;
        currentUnitPtr += unitsInThisSlab;
      }
    }
  }

  const vatCost = totalEnergyCost * VAT_RATE;
  const totalCost = totalEnergyCost + vatCost;
  const endMonthUnits = startMonthUnits + units;
  const activeSlab = getActiveSlab(endMonthUnits);

  return {
    energyCost: totalEnergyCost,
    vatCost,
    totalCost,
    endMonthUnits,
    breakdown,
    effectiveSlabRate: activeSlab.rate,
  };
}

/**
 * Returns the active slab tier for a given cumulative monthly unit count.
 */
export function getActiveSlab(cumulativeMonthUnits: number): SlabTier {
  const currentUnits = Math.max(1, cumulativeMonthUnits);
  for (const slab of TARIFF_SLABS) {
    if (slab.maxUnit === null || currentUnits <= slab.maxUnit) {
      return slab;
    }
  }
  return TARIFF_SLABS[TARIFF_SLABS.length - 1];
}

/**
 * Parses YYYY-MM-DD into month key YYYY-MM
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * Formats a Date object or string as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds days to a date string YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Difference in calendar days between two YYYY-MM-DD strings (b - a)
 */
export function daysBetween(dateAStr: string, dateBStr: string): number {
  const a = new Date(`${dateAStr}T00:00:00Z`).getTime();
  const b = new Date(`${dateBStr}T00:00:00Z`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Core Reconstruction Engine:
 * Rebuilds meter balance day-by-day with 100% tariff fidelity.
 */
export function simulateMeterHistory(
  openingBalance: number,
  days: DayReading[],
  recharges: RechargeRecord[]
): SimulationHistoryResult {
  const timeline: DaySimulationRecord[] = [];
  let currentBalance = openingBalance;
  let totalUnitsConsumed = 0;
  let totalEnergyCost = 0;
  let totalVatCost = 0;
  let totalFixedCharges = 0;
  let totalRecharged = 0;
  let rechargeEventsCount = 0;

  // Group recharges by date
  const rechargesByDate = new Map<string, number[]>();
  for (const r of recharges) {
    const amt = typeof r.amount_bdt === "string" ? parseFloat(r.amount_bdt) : r.amount_bdt;
    const list = rechargesByDate.get(r.date) || [];
    list.push(amt);
    rechargesByDate.set(r.date, list);
  }

  let currentMonthKey = "";
  let monthCumulativeUnits = 0;
  let monthHasRecharged = false;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dayMonthKey = getMonthKey(day.date);

    // Reset slab counter on the 1st day / new month
    if (dayMonthKey !== currentMonthKey) {
      currentMonthKey = dayMonthKey;
      monthCumulativeUnits = 0;
      monthHasRecharged = false;
    }

    const startOfDayBalance = currentBalance;
    const startOfMonthUnits = monthCumulativeUnits;

    // 1. Process Recharges on this day (applied at start of day)
    const dayRecharges = rechargesByDate.get(day.date) || [];
    let dayRechargeTotal = 0;
    let dayFixedChargesDeducted = 0;
    let isFirstRecharge = false;

    if (dayRecharges.length > 0) {
      for (const amt of dayRecharges) {
        dayRechargeTotal += amt;
        totalRecharged += amt;
        rechargeEventsCount++;

        // Deduct Demand (42) + Meter Rent (40) on the FIRST recharge of the month
        if (!monthHasRecharged) {
          dayFixedChargesDeducted += MONTHLY_FIXED_CHARGE_TOTAL;
          totalFixedCharges += MONTHLY_FIXED_CHARGE_TOTAL;
          monthHasRecharged = true;
          isFirstRecharge = true;
        }
      }
    }

    const netRechargeAdded = dayRechargeTotal - dayFixedChargesDeducted;
    currentBalance += netRechargeAdded;

    // 2. Process Daily Electricity Consumption
    const costResult = calculateEnergyCost(day.units, startOfMonthUnits);
    monthCumulativeUnits = costResult.endMonthUnits;
    totalUnitsConsumed += day.units;
    totalEnergyCost += costResult.energyCost;
    totalVatCost += costResult.vatCost;

    currentBalance -= costResult.totalCost;

    const activeSlab = getActiveSlab(monthCumulativeUnits);

    timeline.push({
      date: day.date,
      dayIndex: i + 1,
      units: day.units,
      startOfMonthUnits,
      endOfMonthUnits: monthCumulativeUnits,
      energyCost: costResult.energyCost,
      vatCost: costResult.vatCost,
      totalDailyCost: costResult.totalCost,
      rechargeAmount: dayRechargeTotal,
      fixedChargesDeducted: dayFixedChargesDeducted,
      netRechargeAdded,
      startOfDayBalance,
      endOfDayBalance: currentBalance,
      activeSlabId: activeSlab.id,
      activeSlabRate: activeSlab.rate,
      isFirstRechargeOfMonth: isFirstRecharge,
      recharges: dayRecharges.map((amount) => ({ amount })),
    });
  }

  const totalCostConsumed = totalEnergyCost + totalVatCost + totalFixedCharges;

  return {
    timeline,
    totalUnitsConsumed,
    totalEnergyCost,
    totalVatCost,
    totalFixedCharges,
    totalCostConsumed,
    totalRecharged,
    finalBalance: currentBalance,
    openingBalance,
    rechargeEventsCount,
  };
}

/**
 * Question A: Given today's balance, when will the meter balance run out (reach <= 0)?
 */
export function predictRunOutDate(
  currentBalance: number,
  usualDailyUnits: number,
  startDateStr: string,
  startMonthUnits = 0
): RunOutPrediction {
  if (currentBalance <= 0) {
    return {
      runOutDate: startDateStr,
      daysRemaining: 0,
      isExhausted: true,
      timeline: [],
    };
  }

  if (usualDailyUnits <= 0) {
    return {
      runOutDate: null,
      daysRemaining: Infinity,
      isExhausted: false,
      timeline: [],
    };
  }

  let simBalance = currentBalance;
  let simDateStr = addDays(startDateStr, 1);
  let currentMonthKey = getMonthKey(simDateStr);
  let monthCumulativeUnits = getMonthKey(startDateStr) === currentMonthKey ? startMonthUnits : 0;
  let dayCount = 0;
  const timeline = [];

  // Simulate up to 365 days max
  const MAX_DAYS = 365;
  while (simBalance > 0 && dayCount < MAX_DAYS) {
    dayCount++;
    const nextMonthKey = getMonthKey(simDateStr);
    if (nextMonthKey !== currentMonthKey) {
      currentMonthKey = nextMonthKey;
      monthCumulativeUnits = 0;
    }

    const costRes = calculateEnergyCost(usualDailyUnits, monthCumulativeUnits);
    monthCumulativeUnits = costRes.endMonthUnits;
    simBalance -= costRes.totalCost;

    timeline.push({
      date: simDateStr,
      dayIndex: dayCount,
      units: usualDailyUnits,
      monthUnits: monthCumulativeUnits,
      cost: costRes.totalCost,
      balance: simBalance,
    });

    if (simBalance <= 0) {
      return {
        runOutDate: simDateStr,
        daysRemaining: dayCount,
        isExhausted: false,
        timeline,
      };
    }

    simDateStr = addDays(simDateStr, 1);
  }

  return {
    runOutDate: simBalance <= 0 ? simDateStr : null,
    daysRemaining: dayCount,
    isExhausted: false,
    timeline,
  };
}

/**
 * Question B: To last until a target date, how much must be recharged today?
 * Breaks down into Base Energy (at base slab), Higher Slab Surcharge, Fixed Charges, and VAT.
 */
export function calculateRechargeForTargetDate(
  currentBalance: number,
  targetDateStr: string,
  dailyUnits: number,
  startDateStr: string,
  startMonthUnits = 0,
  hasRechargedThisMonth = false
): TargetRechargeBreakdown {
  const totalDays = Math.max(0, daysBetween(startDateStr, targetDateStr));
  const totalUnits = totalDays * dailyUnits;
  const baseSlabRate = TARIFF_SLABS[0].rate; // 4.63 BDT
  const baseEnergyCost = totalUnits * baseSlabRate;

  if (totalDays === 0) {
    return {
      targetDate: targetDateStr,
      startDate: startDateStr,
      totalDays: 0,
      totalUnits: 0,
      baseEnergyCost: 0,
      higherSlabSurcharge: 0,
      totalEnergyCost: 0,
      vatCost: 0,
      fixedCharges: 0,
      totalRequiredCost: 0,
      currentBalance,
      recommendedRechargeToday: 0,
    };
  }

  let simDateStr = addDays(startDateStr, 1);
  let currentMonthKey = getMonthKey(startDateStr);
  let monthCumulativeUnits = startMonthUnits;
  let totalActualEnergyCost = 0;
  let fixedChargesAccrued = 0;

  // If recharging today on startDateStr and month hasn't had a recharge yet:
  if (!hasRechargedThisMonth) {
    fixedChargesAccrued += MONTHLY_FIXED_CHARGE_TOTAL;
  }

  const visitedMonths = new Set<string>([currentMonthKey]);

  for (let i = 0; i < totalDays; i++) {
    const dayMonthKey = getMonthKey(simDateStr);
    if (dayMonthKey !== currentMonthKey) {
      currentMonthKey = dayMonthKey;
      monthCumulativeUnits = 0;
      // If crossing into a new calendar month that requires funding, it will need a recharge in that month
      if (!visitedMonths.has(dayMonthKey)) {
        visitedMonths.add(dayMonthKey);
        fixedChargesAccrued += MONTHLY_FIXED_CHARGE_TOTAL;
      }
    }

    const costRes = calculateEnergyCost(dailyUnits, monthCumulativeUnits);
    monthCumulativeUnits = costRes.endMonthUnits;
    totalActualEnergyCost += costRes.energyCost;

    simDateStr = addDays(simDateStr, 1);
  }

  const higherSlabSurcharge = Math.max(0, totalActualEnergyCost - baseEnergyCost);
  const vatCost = totalActualEnergyCost * VAT_RATE;
  const totalRequiredCost = totalActualEnergyCost + vatCost + fixedChargesAccrued;
  const recommendedRechargeToday = Math.max(0, totalRequiredCost - currentBalance);

  return {
    targetDate: targetDateStr,
    startDate: startDateStr,
    totalDays,
    totalUnits,
    baseEnergyCost,
    higherSlabSurcharge,
    totalEnergyCost: totalActualEnergyCost,
    vatCost,
    fixedCharges: fixedChargesAccrued,
    totalRequiredCost,
    currentBalance,
    recommendedRechargeToday,
  };
}

/**
 * Habit Comparison Simulator:
 * Compares "Low Balance" vs "Monthly 1st" recharge habits over identical 3-month consumption.
 * Adheres strictly to Judge Rulings R-16 & R-33.
 */
export function simulateHabitComparison(
  config: HabitComparisonConfig,
  customDays?: DayReading[]
): HabitComparisonResult {
  const openingBalance =
    typeof config.opening_balance_bdt === "string"
      ? parseFloat(config.opening_balance_bdt)
      : config.opening_balance_bdt;
  const lowThreshold =
    typeof config.low_threshold_bdt === "string"
      ? parseFloat(config.low_threshold_bdt)
      : config.low_threshold_bdt;
  const lowAmount =
    typeof config.low_amount_bdt === "string"
      ? parseFloat(config.low_amount_bdt)
      : config.low_amount_bdt;
  const monthlyAmount =
    typeof config.monthly_amount_bdt === "string"
      ? parseFloat(config.monthly_amount_bdt)
      : config.monthly_amount_bdt;

  // Filter or generate days for the 3 comparison months
  let simulationDays: DayReading[] = [];
  if (config.source === "readings" && customDays) {
    simulationDays = customDays.filter((d) => config.months.includes(getMonthKey(d.date)));
  } else if (config.daily_units) {
    // Generate daily readings for each day in the 3 months
    const dailyUnitsVal = config.daily_units;
    for (const monthStr of config.months) {
      const [y, m] = monthStr.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${monthStr}-${String(day).padStart(2, "0")}`;
        simulationDays.push({ date: dayStr, units: dailyUnitsVal });
      }
    }
  }

  // --- 1. Simulate Habit A: "Low Balance" Panic Recharge ---
  const lowBalanceTimeline: DaySimulationRecord[] = [];
  let lowBalCurrent = openingBalance;
  let lowBalTotalUnits = 0;
  let lowBalTotalEnergy = 0;
  let lowBalTotalVat = 0;
  let lowBalTotalFixed = 0;
  let lowBalTotalRecharge = 0;
  let lowMonthKey = "";
  let lowMonthUnits = 0;
  let lowMonthHasRecharged = false;

  const lowMonthlySummaries: Map<string, HabitMonthlySummary> = new Map();

  for (let i = 0; i < simulationDays.length; i++) {
    const day = simulationDays[i];
    const mKey = getMonthKey(day.date);

    if (mKey !== lowMonthKey) {
      lowMonthKey = mKey;
      lowMonthUnits = 0;
      lowMonthHasRecharged = false;
      if (!lowMonthlySummaries.has(mKey)) {
        lowMonthlySummaries.set(mKey, {
          month: mKey,
          units: 0,
          energyCost: 0,
          vatCost: 0,
          fixedCharges: 0,
          rechargesCount: 0,
          totalRecharged: 0,
          totalCost: 0,
          endBalance: 0,
        });
      }
    }

    const mSummary = lowMonthlySummaries.get(mKey)!;
    const startBal = lowBalCurrent;
    let dayRechargeAmt = 0;
    let dayFixedDeducted = 0;
    let isFirst = false;

    // Check if start-of-day balance is below threshold
    if (lowBalCurrent < lowThreshold) {
      dayRechargeAmt = lowAmount;
      lowBalTotalRecharge += lowAmount;
      mSummary.rechargesCount++;
      mSummary.totalRecharged += lowAmount;

      if (!lowMonthHasRecharged) {
        dayFixedDeducted = MONTHLY_FIXED_CHARGE_TOTAL;
        lowBalTotalFixed += MONTHLY_FIXED_CHARGE_TOTAL;
        lowMonthHasRecharged = true;
        isFirst = true;
        mSummary.fixedCharges += MONTHLY_FIXED_CHARGE_TOTAL;
      }
    }

    lowBalCurrent += dayRechargeAmt - dayFixedDeducted;

    const costRes = calculateEnergyCost(day.units, lowMonthUnits);
    lowMonthUnits = costRes.endMonthUnits;
    lowBalTotalUnits += day.units;
    lowBalTotalEnergy += costRes.energyCost;
    lowBalTotalVat += costRes.vatCost;
    lowBalCurrent -= costRes.totalCost;

    mSummary.units += day.units;
    mSummary.energyCost += costRes.energyCost;
    mSummary.vatCost += costRes.vatCost;
    mSummary.totalCost += costRes.totalCost + dayFixedDeducted;
    mSummary.endBalance = lowBalCurrent;

    const slab = getActiveSlab(lowMonthUnits);
    lowBalanceTimeline.push({
      date: day.date,
      dayIndex: i + 1,
      units: day.units,
      startOfMonthUnits: lowMonthUnits - day.units,
      endOfMonthUnits: lowMonthUnits,
      energyCost: costRes.energyCost,
      vatCost: costRes.vatCost,
      totalDailyCost: costRes.totalCost,
      rechargeAmount: dayRechargeAmt,
      fixedChargesDeducted: dayFixedDeducted,
      netRechargeAdded: dayRechargeAmt - dayFixedDeducted,
      startOfDayBalance: startBal,
      endOfDayBalance: lowBalCurrent,
      activeSlabId: slab.id,
      activeSlabRate: slab.rate,
      isFirstRechargeOfMonth: isFirst,
      recharges: dayRechargeAmt > 0 ? [{ amount: dayRechargeAmt }] : [],
    });
  }

  // --- 2. Simulate Habit B: "Monthly 1st" Recharge ---
  const monthlyTimeline: DaySimulationRecord[] = [];
  let monthBalCurrent = openingBalance;
  let monthBalTotalUnits = 0;
  let monthBalTotalEnergy = 0;
  let monthBalTotalVat = 0;
  let monthBalTotalFixed = 0;
  let monthBalTotalRecharge = 0;
  let monthlyCurrentKey = "";
  let monthlyUnits = 0;
  let monthlyHasRecharged = false;

  const monthlySummaries: Map<string, HabitMonthlySummary> = new Map();

  for (let i = 0; i < simulationDays.length; i++) {
    const day = simulationDays[i];
    const mKey = getMonthKey(day.date);

    if (mKey !== monthlyCurrentKey) {
      monthlyCurrentKey = mKey;
      monthlyUnits = 0;
      monthlyHasRecharged = false;
      if (!monthlySummaries.has(mKey)) {
        monthlySummaries.set(mKey, {
          month: mKey,
          units: 0,
          energyCost: 0,
          vatCost: 0,
          fixedCharges: 0,
          rechargesCount: 0,
          totalRecharged: 0,
          totalCost: 0,
          endBalance: 0,
        });
      }
    }

    const mSummary = monthlySummaries.get(mKey)!;
    const startBal = monthBalCurrent;
    let dayRechargeAmt = 0;
    let dayFixedDeducted = 0;
    let isFirst = false;

    // Monthly habit recharges on the 1st of each month (or first available day in that month)
    const isFirstDayOfMonth = day.date.endsWith("-01") || !monthlyHasRecharged;
    if (isFirstDayOfMonth && !monthlyHasRecharged) {
      dayRechargeAmt = monthlyAmount;
      monthBalTotalRecharge += monthlyAmount;
      mSummary.rechargesCount++;
      mSummary.totalRecharged += monthlyAmount;

      dayFixedDeducted = MONTHLY_FIXED_CHARGE_TOTAL;
      monthBalTotalFixed += MONTHLY_FIXED_CHARGE_TOTAL;
      monthlyHasRecharged = true;
      isFirst = true;
      mSummary.fixedCharges += MONTHLY_FIXED_CHARGE_TOTAL;
    }

    monthBalCurrent += dayRechargeAmt - dayFixedDeducted;

    const costRes = calculateEnergyCost(day.units, monthlyUnits);
    monthlyUnits = costRes.endMonthUnits;
    monthBalTotalUnits += day.units;
    monthBalTotalEnergy += costRes.energyCost;
    monthBalTotalVat += costRes.vatCost;
    monthBalCurrent -= costRes.totalCost;

    mSummary.units += day.units;
    mSummary.energyCost += costRes.energyCost;
    mSummary.vatCost += costRes.vatCost;
    mSummary.totalCost += costRes.totalCost + dayFixedDeducted;
    mSummary.endBalance = monthBalCurrent;

    const slab = getActiveSlab(monthlyUnits);
    monthlyTimeline.push({
      date: day.date,
      dayIndex: i + 1,
      units: day.units,
      startOfMonthUnits: monthlyUnits - day.units,
      endOfMonthUnits: monthlyUnits,
      energyCost: costRes.energyCost,
      vatCost: costRes.vatCost,
      totalDailyCost: costRes.totalCost,
      rechargeAmount: dayRechargeAmt,
      fixedChargesDeducted: dayFixedDeducted,
      netRechargeAdded: dayRechargeAmt - dayFixedDeducted,
      startOfDayBalance: startBal,
      endOfDayBalance: monthBalCurrent,
      activeSlabId: slab.id,
      activeSlabRate: slab.rate,
      isFirstRechargeOfMonth: isFirst,
      recharges: dayRechargeAmt > 0 ? [{ amount: dayRechargeAmt }] : [],
    });
  }

  const lowCostConsumed = lowBalTotalEnergy + lowBalTotalVat + lowBalTotalFixed;
  const monthCostConsumed = monthBalTotalEnergy + monthBalTotalVat + monthBalTotalFixed;
  const costDiff = lowCostConsumed - monthCostConsumed;

  let cheaperHabit: "low_balance" | "monthly_1st" | "equal" = "equal";
  if (costDiff > 0.001) cheaperHabit = "monthly_1st";
  else if (costDiff < -0.001) cheaperHabit = "low_balance";

  const lowBalanceHabit: HabitSimulationRun = {
    habitName: "low_balance",
    title: "Low Balance Panic Recharge",
    description: `Recharges ${lowAmount} BDT at start of day whenever balance drops below ${lowThreshold} BDT.`,
    totalUnits: lowBalTotalUnits,
    totalEnergyCost: lowBalTotalEnergy,
    totalVatCost: lowBalTotalVat,
    totalFixedCharges: lowBalTotalFixed,
    totalCostConsumed: lowCostConsumed,
    totalRecharged: lowBalTotalRecharge,
    finalBalance: lowBalCurrent,
    monthlySummaries: Array.from(lowMonthlySummaries.values()),
    timeline: lowBalanceTimeline,
  };

  const monthlyHabit: HabitSimulationRun = {
    habitName: "monthly_1st",
    title: "1st of Month Planned Recharge",
    description: `Recharges ${monthlyAmount} BDT on the 1st of every calendar month.`,
    totalUnits: monthBalTotalUnits,
    totalEnergyCost: monthBalTotalEnergy,
    totalVatCost: monthBalTotalVat,
    totalFixedCharges: monthBalTotalFixed,
    totalCostConsumed: monthCostConsumed,
    totalRecharged: monthBalTotalRecharge,
    finalBalance: monthBalCurrent,
    monthlySummaries: Array.from(monthlySummaries.values()),
    timeline: monthlyTimeline,
  };

  let explanation = "";
  if (Math.abs(costDiff) < 0.01) {
    explanation =
      "Both habits cost exactly the same (R-16 / R-33). Under identical consumption, cumulative slab energy costs and 5% VAT are identical. Fixed monthly charges (82 BDT/mo) were deducted identically.";
  } else if (costDiff > 0) {
    explanation = `The 1st-of-month habit consumed ৳${costDiff.toFixed(2)} less in total meter deductions. Note: energy tariff rates are identical; the difference is driven by fixed charge occurrence differences across months.`;
  } else {
    explanation = `The low-balance habit consumed ৳${Math.abs(costDiff).toFixed(2)} less in total meter deductions due to fixed charge timing.`;
  }

  return {
    lowBalanceHabit,
    monthlyHabit,
    costDifference: costDiff,
    cheaperHabit,
    explanation,
  };
}

/**
 * Bonus Feature 1: Proximity radar to next slab tier
 */
export function getSlabProximity(currentMonthUnits: number): SlabProximityInfo {
  const currentSlab = getActiveSlab(currentMonthUnits);
  let nextSlab: SlabTier | null = null;
  const currentIdx = TARIFF_SLABS.findIndex((s) => s.id === currentSlab.id);

  if (currentIdx >= 0 && currentIdx < TARIFF_SLABS.length - 1) {
    nextSlab = TARIFF_SLABS[currentIdx + 1];
  }

  const unitsInCurrentSlab =
    currentMonthUnits - (currentSlab.minUnit - 1);
  const unitsToNextSlab =
    currentSlab.maxUnit !== null ? Math.max(0, currentSlab.maxUnit - currentMonthUnits) : null;

  const slabSpan =
    currentSlab.maxUnit !== null ? currentSlab.maxUnit - (currentSlab.minUnit - 1) : 100;
  const percentageToNextSlab = Math.min(100, (unitsInCurrentSlab / slabSpan) * 100);

  const isNearNextSlab = unitsToNextSlab !== null && unitsToNextSlab <= 15;
  const nextUnitCost =
    unitsToNextSlab === 0 && nextSlab
      ? nextSlab.rate * (1 + VAT_RATE)
      : currentSlab.rate * (1 + VAT_RATE);

  return {
    currentSlab,
    nextSlab,
    currentMonthUnits,
    unitsInCurrentSlab,
    unitsToNextSlab,
    percentageToNextSlab,
    isNearNextSlab,
    nextUnitCost,
  };
}
