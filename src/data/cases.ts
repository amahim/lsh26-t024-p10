import rawData from "../../P10_prepaid_meter_public.json";
import { TestCaseData } from "@/types/meter";

export const PUBLIC_CASES: TestCaseData[] = rawData.cases as TestCaseData[];

export const DEFAULT_CASE: TestCaseData =
  PUBLIC_CASES.find((c) => c.case_id === "PUB-01") || PUBLIC_CASES[0];

export const PRESET_CASES = [
  {
    id: "PUB-01",
    label: "Scenario A: 6-Month Household (Winter Lull -> Summer Spike -> Late Recharge)",
    description: "Starts in Jan with low 3-5 units/day, spikes to 19 units/day in May heatwave, and features large recharges in late June.",
  },
  {
    id: "PUB-05",
    label: "Scenario B: Heavy Summer AC Spikes (Reaches Tier 6 - 600+ kWh)",
    description: "Rapid transitions into the highest tariff tier (৳10.70/unit) with high daily demand.",
  },
  {
    id: "PUB-11",
    label: "Scenario C: Extended 8-Month High-Balance Buffer",
    description: "Over 230 days of consecutive readings with 20 recharge events.",
  },
];
