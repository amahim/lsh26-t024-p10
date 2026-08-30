import * as fs from "fs";
import * as path from "path";
import {
  simulateMeterHistory,
  predictRunOutDate,
  calculateRechargeForTargetDate,
  simulateHabitComparison,
  getSlabProximity,
} from "../src/lib/meter-engine";
import { TestCaseData } from "../src/types/meter";

interface PublicDataset {
  schema_version: string;
  problem_id: string;
  cases: TestCaseData[];
}

function runBenchmark() {
  console.log("🚀 Starting verification of benchmark dataset...");
  const jsonPath = path.resolve(__dirname, "../public/data/P10_prepaid_meter_public.json");

  if (!fs.existsSync(jsonPath)) {
    console.error(`Dataset not found at ${jsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data: PublicDataset = JSON.parse(raw);

  console.log(`Found ${data.cases.length} cases in ${data.problem_id} (schema ${data.schema_version})`);

  let passed = 0;
  let failed = 0;

  for (const c of data.cases) {
    try {
      const openingBal = parseFloat(c.opening_balance_bdt);

      // 1. Test History Reconstruction
      const history = simulateMeterHistory(openingBal, c.days, c.recharges);
      if (history.timeline.length !== c.days.length) {
        throw new Error(
          `Timeline length mismatch: got ${history.timeline.length}, expected ${c.days.length}`
        );
      }

      // Check for finite numbers
      if (isNaN(history.finalBalance) || isNaN(history.totalCostConsumed)) {
        throw new Error(`NaN in history results for case ${c.case_id}`);
      }

      // 2. Test Question A (Run Out Prediction)
      const lastDay = history.timeline[history.timeline.length - 1];
      const lastMonthUnits = lastDay ? lastDay.endOfMonthUnits : 0;
      const prediction = predictRunOutDate(
        history.finalBalance,
        c.usual_daily_units,
        c.today,
        lastMonthUnits
      );

      if (prediction.daysRemaining < 0) {
        throw new Error(`Negative days remaining in prediction for case ${c.case_id}`);
      }

      // 3. Test Question B (Target Date Recharge Breakdown)
      const targetBreakdown = calculateRechargeForTargetDate(
        history.finalBalance,
        c.target_date,
        c.usual_daily_units,
        c.today,
        lastMonthUnits,
        false
      );

      if (
        isNaN(targetBreakdown.recommendedRechargeToday) ||
        targetBreakdown.recommendedRechargeToday < 0
      ) {
        throw new Error(`Invalid recommended recharge in case ${c.case_id}`);
      }

      // 4. Test Habit Comparison
      const habitComparison = simulateHabitComparison(c.comparison, c.days);
      if (!habitComparison.lowBalanceHabit || !habitComparison.monthlyHabit) {
        throw new Error(`Habit comparison missing results for case ${c.case_id}`);
      }

      // 5. Test Slab Proximity
      const proximity = getSlabProximity(lastMonthUnits);
      if (!proximity.currentSlab) {
        throw new Error(`Proximity radar failed for case ${c.case_id}`);
      }

      passed++;
      console.log(
        `✅ [${c.case_id}] Passed! Days: ${c.days.length}, Recharges: ${c.recharges.length}, End Balance: ৳${history.finalBalance.toFixed(2)}, Run-out: ${prediction.runOutDate || "Indefinite"}, Target Req: ৳${targetBreakdown.recommendedRechargeToday.toFixed(2)}`
      );
    } catch (err) {
      failed++;
      console.error(`❌ [${c.case_id}] Failed:`, err);
    }
  }

  console.log("\n==========================================");
  console.log(`Summary: ${passed}/${data.cases.length} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBenchmark();
