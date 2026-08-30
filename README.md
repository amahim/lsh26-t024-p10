# ⚡ Dhaka Prepaid Electricity Meter Advisor (Problem 10)

> An intelligent forecasting engine, tariff optimizer, and day-by-day balance rebuilder designed for domestic prepaid electricity meters under the official DESCO / DPDC multi-tier slab tariff.

---

## 🌟 Overview

In Dhaka, residential electricity is billed on a progressive 6-tier slab tariff that resets on the 1st of every calendar month. Households frequently face rapid balance depletion late in the month because cumulative usage crosses into high-tier penalty rates (e.g. ৳9.30 – ৳10.70/kWh) without their knowledge.

**The Dhaka Prepaid Meter Advisor** solves this by:
1. **Rebuilding the day-by-day meter balance** from daily readings and recharge records with 100% tariff fidelity.
2. **Predicting the exact run-out date** based on current balance and consumption patterns (Question 1).
3. **Calculating the exact required recharge** to last until any chosen target date with a 4-way itemized cost breakdown (Question 2).
4. **Simulating and comparing recharge habits** (Low-Balance panic vs. 1st-of-Month schedule) on identical consumption adhering strictly to **Judge Rulings R-16 & R-33**.
5. **Bonus Features**: Live Slab Proximity Radar, CSV/JSON custom recharge reconciler, and Itemized Single-Month Official Electricity Statement.

---

## 🎯 MVP Requirements Coverage

| Requirement | Implementation Status | How to Verify in UI |
|---|:---:|---|
| **MVP 1: 6-Month Household Model** | ✅ Complete | Select **PUB-01** (or scenarios A/B/C) to explore 180–245 days featuring a light winter lull (Jan), summer heatwave spike (May), and late-month recharge (June). |
| **MVP 2: Day-by-Day Rebuilt Ledger** | ✅ Complete | View the interactive **Reconstructed Balance Ledger Area Chart** with hover tooltips, green recharge event markers, and the granular transaction table. |
| **MVP 3.A: Run-Out Date Predictor** | ✅ Complete | Interact with **Question 1 Card**: adjust daily usage slider (kWh/day) to see the exact zero-balance date and days-remaining countdown. |
| **MVP 3.B: Target Date Budget Planner** | ✅ Complete | Interact with **Question 2 Card**: pick a target date to see the required BDT recharge with 4-part itemized breakdown (Base Energy, Higher Slab Surcharge, Fixed Charges, 5% VAT). |
| **MVP 4: Habit Comparative Simulation** | ✅ Complete | Switch between Overview, Dual Trajectory Chart, and Monthly Table in the **Recharge Habits Arena** to compare Low Balance vs. 1st-of-Month schedules under identical consumption (R-16/R-33). |
| **Bonus 1: Slab Proximity Radar** | ✅ Complete | Live radar gauge shows current slab, distance to next tier, and warns when within 15 units of tariff escalation. |
| **Bonus 2: Real History Reconciler** | ✅ Complete | Paste custom recharge & reading history in CSV format to rebuild and audit meter deductions. |
| **Bonus 3: Single-Month Itemized Bill** | ✅ Complete | Select any billing period to view an official DESCO/DPDC style itemized statement with energy slices, demand charge, meter rent, and VAT. |

---

## 📊 Official Tariff Specifications

| Tier | Monthly Consumption | Rate (BDT / kWh) | Rate with 5% VAT |
|---|---|---|---|
| **Slab 1** | $1 - 75$ kWh | **৳4.63** | ৳4.8615 |
| **Slab 2** | $76 - 200$ kWh | **৳5.26** | ৳5.5230 |
| **Slab 3** | $201 - 300$ kWh | **৳5.63** | ৳5.9115 |
| **Slab 4** | $301 - 400$ kWh | **৳5.83** | ৳6.1215 |
| **Slab 5** | $401 - 600$ kWh | **৳9.30** | ৳9.7650 |
| **Slab 6** | $601+$ kWh | **৳10.70** | ৳11.2350 |

* **Fixed Charges**: Demand Charge = **৳42.00**, Meter Rent = **৳40.00** (Total **৳82.00**, deducted once per month on 1st recharge).
* **VAT**: **5%** strictly applied to energy amount.
* **Monthly Counter Reset**: Slab counter resets to 0 on the 1st of every calendar month. Recharges do not reset the counter.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict Mode, `noImplicitAny`, 0 `any` types)
- **Styling**: Tailwind CSS with Cyber-Emerald Glassmorphism theme
- **Visualization**: Recharts (Responsive Composed Area/Line/Bar charts)
- **Icons**: Lucide React (Permissive MIT License)
- **Core Math Engine**: `src/lib/meter-engine.ts` (Pure, immutable, zero external runtime math dependencies)

---

## 💻 Local Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Run the automated benchmark test suite (25/25 public cases)
npx -y tsx scripts/verify-benchmark.ts

# 3. Start local development server
npm run dev

# 4. Build optimized production bundle
npm run build
```

---

## ⚖️ Judge Rulings & Compliance (R-16 & R-33)

* **R-16 Compliance**: Daily consumption and progressive slab advancement are 100% identical between recharge habits. Timing of deposits does not fabricate artificial energy savings.
* **R-33 Compliance**: Meter "Cost" measures actual consumed balance (Energy + VAT + Applicable Fixed Charges deducted), accurately distinguished from gross deposit liquidity.
