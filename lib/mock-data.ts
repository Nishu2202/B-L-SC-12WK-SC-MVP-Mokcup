export type SkuStatus = "on-track" | "warning" | "high-deviation" | "needs-review";
export type ForecastEngine = "Blue Yonder" | "OPAL" | "Blue Yonder + Planner" | "OPAL + Planner";
export type RecommendedAction = "increase" | "decrease" | "hold" | "rebalance";

export interface DailyDataPoint {
  date: string;
  expected: number;
  actual: number;
  forecast?: number;
  lower?: number;
  upper?: number;
}

export interface SkuData {
  id: string;
  name: string;
  code: string;
  segment: string;
  deviationPct: number;
  forecastAccuracy: number;
  volume: number;
  variability: "Low" | "Medium" | "High";
  variabilityScore: number;
  recommendedAction: RecommendedAction;
  status: SkuStatus;
  forecastEngine: ForecastEngine;
  rationale: string;
  currentMonthForecast: number;
  currentMonthActual: number;
  suggestedAdjustmentPct: number;
  confidenceScore: number;
  explanation: string;
  history: DailyDataPoint[];
}

// Generate 30-day history with deterministic seeded random for consistency
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function genHistory(
  base: number,
  variance: number,
  spikeDays: number[],
  spikeMag: number,
  trend: number = 0,
  seed: number = 42
): DailyDataPoint[] {
  const points: DailyDataPoint[] = [];
  const today = new Date(2025, 3, 28); // April 28 2025
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayTrend = base + trend * (29 - i);
    const randExp = seededRandom(seed + i * 100);
    const randAct = seededRandom(seed + i * 100 + 50);
    const expected = Math.round(dayTrend + (randExp - 0.5) * variance * 0.2);
    
    // Apply spike to last 2 days (i <= 1) with clear magnitude
    const isSpike = spikeDays.includes(i) && i <= 2;
    let actual: number;
    if (isSpike) {
      // Make spike very visible - multiply base by spike magnitude
      actual = Math.round(dayTrend * spikeMag + (randAct - 0.5) * variance * 0.1);
    } else {
      // Normal days: actual tracks expected with small variance
      actual = Math.round(expected + (randAct - 0.5) * variance * 0.4);
    }
    
    const lower = Math.round(expected * 0.88);
    const upper = Math.round(expected * 1.12);
    const forecast = i === 0 ? Math.round(expected * 1.08) : undefined;
    points.push({ date: label, expected, actual, lower, upper, forecast });
  }
  return points;
}

export const skus: SkuData[] = [
  {
    id: "sku-001",
    name: "Biotrue ONEday 90pk",
    code: "BT-90-US",
    segment: "High Volume / Low Var",
    deviationPct: 24.3,
    forecastAccuracy: 73,
    volume: 142500,
    variability: "Low",
    variabilityScore: 0.42,
    recommendedAction: "increase",
    status: "high-deviation",
    forecastEngine: "Blue Yonder + Planner",
    rationale: "Spike detected in last 2 Days; accuracy below threshold. Planner review needed.",
    currentMonthForecast: 138000,
    currentMonthActual: 142500,
    suggestedAdjustmentPct: 8,
    confidenceScore: 87,
    explanation:
      "Daily orders exceeded the expected consumption profile by 24% in the last 2 Days, driven by a surge in US East region. The spike distribution is front-loaded, suggesting a pull-forward from May. Recommend increasing current-month forecast by 8% and monitoring daily fill rate.",
    history: genHistory(4800, 600, [2, 1, 0], 1.35, 15, 101),
  },
  {
    id: "sku-006",
    name: "PureVision Multi-Focal 30pk",
    code: "PV-MF-30-US",
    segment: "Specialty / Low Var",
    deviationPct: 4.3,
    forecastAccuracy: 91,
    volume: 42300,
    variability: "Low",
    variabilityScore: 0.38,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Premium segment stable. Specialty demand consistent.",
    currentMonthForecast: 40500,
    currentMonthActual: 42300,
    suggestedAdjustmentPct: 0,
    confidenceScore: 93,
    explanation:
      "Premium specialty segment performing stably with high forecast accuracy. Orders tracking within expected range. Maintain current forecast and supply strategy.",
    history: genHistory(1480, 300, [], 1.0, 0, 606),
  },
  {
    id: "sku-003",
    name: "Purevision 2 HD 30pk",
    code: "PV-HD-30-US",
    segment: "Low Volume / Low Var",
    deviationPct: 2.1,
    forecastAccuracy: 94,
    volume: 56700,
    variability: "Low",
    variabilityScore: 0.31,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Steady performer. Close to expected profile with excellent accuracy.",
    currentMonthForecast: 55500,
    currentMonthActual: 56700,
    suggestedAdjustmentPct: 0,
    confidenceScore: 96,
    explanation:
      "Orders tracking precisely to expected profile. Excellent forecast accuracy with minimal variance. No action required — continue current forecast and replenishment strategy.",
    history: genHistory(2280, 250, [], 1.0, 4, 303),
  },
  {
    id: "sku-004",
    name: "Frequency 55 Toric 6pk",
    code: "FQ-TOR-6-US",
    segment: "High Volume / Med Var",
    deviationPct: 18.7,
    forecastAccuracy: 71,
    volume: 112350,
    variability: "Medium",
    variabilityScore: 0.74,
    recommendedAction: "increase",
    status: "warning",
    forecastEngine: "OPAL + Planner",
    rationale: "Recent spike in Toric segment. OPAL needs manual review for seasonal shift.",
    currentMonthForecast: 94500,
    currentMonthActual: 112350,
    suggestedAdjustmentPct: 5,
    confidenceScore: 76,
    explanation:
      "Toric orders rising ahead of seasonal promotion ramp. Historical accuracy suggests pull-forward activity. Increase forecast by 5% and monitor promotional impact.",
    history: genHistory(3850, 400, [2, 1, 0], 1.25, 8, 404),
  },
  {
    id: "sku-005",
    name: "SofLens Daily 90pk",
    code: "SL-DAILY-90-US",
    segment: "Declining / Low Var",
    deviationPct: -15.6,
    forecastAccuracy: 88,
    volume: 34200,
    variability: "Low",
    variabilityScore: 0.29,
    recommendedAction: "decrease",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Continued decline in daily disposables segment. Model updated.",
    currentMonthForecast: 40500,
    currentMonthActual: 34200,
    suggestedAdjustmentPct: -12,
    confidenceScore: 89,
    explanation:
      "Orders declining as expected in legacy daily segment. Market shift to Biotrue continues. Decrease forecast by 12% to align with structural decline and reduce excess inventory.",
    history: genHistory(950, 400, [], 1.0, -25, 505),
  },
  {
    id: "sku-002",
    name: "Lacelle 55 6-pk",
    code: "LC-55-6-US",
    segment: "Medium Volume / Med Var",
    deviationPct: -8.2,
    forecastAccuracy: 82,
    volume: 89400,
    variability: "Medium",
    variabilityScore: 0.68,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "OPAL",
    rationale: "Performance within expected bounds. Slight underperformance vs. expected, but within 1-sigma.",
    currentMonthForecast: 97400,
    currentMonthActual: 89400,
    suggestedAdjustmentPct: 0,
    confidenceScore: 91,
    explanation:
      "Orders tracking slightly below expected profile, but within normal variance bands. No anomalies detected. Maintain current forecast and continue standard monitoring.",
    history: genHistory(3400, 700, [], 1.0, -12, 202),
  },
];

// Aggregate daily data (sum of all SKUs)
export function getAggregateHistory(): DailyDataPoint[] {
  const len = skus[0].history.length;
  const agg: DailyDataPoint[] = [];
  for (let i = 0; i < len; i++) {
    let expected = 0,
      actual = 0,
      lower = 0,
      upper = 0;
    for (const sku of skus) {
      expected += sku.history[i].expected;
      actual += sku.history[i].actual;
      lower += sku.history[i].lower ?? 0;
      upper += sku.history[i].upper ?? 0;
    }
    agg.push({
      date: skus[0].history[i].date,
      expected,
      actual,
      lower,
      upper,
    });
  }
  return agg;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  bullets?: string[];
  confidence?: number;
  basis?: "rule" | "trend" | "anomaly";
}

export const copilotPromptSuggestions = [
  "What caused this spike?",
  "Which SKUs should we increase this month?",
  "Which items should stay on Blue Yonder Forecast?",
  "Show me the highest-risk segments",
  "Why did this SKU move outside normal range?",
];

export const copilotResponses: Record<string, CopilotMessage> = {
  "What caused this spike?": {
    id: "r1",
    role: "assistant",
    content:
      "The demand spike was driven by Biotrue ONEday 90pk (BT-90-US) in the US East region, where orders exceeded the expected daily consumption profile by 24.3% over the last 48 hours.",
    action: "Increase BT-90-US current-month forecast by 8% and confirm DC inventory.",
    bullets: [
      "Pull-forward from May appears likely based on order clustering pattern",
      "B+L ULTRA (BLU-MF-US) also spiked +18.7%, likely seasonal",
      "No supply disruptions flagged — this is a demand signal, not a constraint",
    ],
    confidence: 87,
    basis: "anomaly",
  },
  "Which SKUs should we increase this month?": {
    id: "r2",
    role: "assistant",
    content:
      "Two SKUs are recommended for upward forecast revision this month based on current order velocity and deviation analysis.",
    action: "Increase BT-90-US by +8% and BLU-MF-US by +6%.",
    bullets: [
      "BT-90-US: +24.3% deviation, concentrated in last 2 Days, high confidence",
      "BLU-MF-US: +18.7% deviation, seasonal alignment, moderate confidence",
      "PureVision2 HD (+7.8%) is within tolerance — hold and monitor",
    ],
    confidence: 84,
    basis: "trend",
  },
  "Which items should stay on Blue Yonder Forecast?": {
    id: "r3",
    role: "assistant",
    content:
      "Two SKUs currently meet the criteria for retained Blue Yonder Forecast: forecast accuracy above 80%, high volume, and low demand variability.",
    action: "Retain Blue Yonder for SLD-30-EMEA and BLU-MF-US. No changes needed.",
    bullets: [
      "SofLens Daily Disposable (SLD-30-EMEA): 84% accuracy, low variability — strong candidate",
      "B+L ULTRA (BLU-MF-US): 78% accuracy, low variability — acceptable",
      "All other SKUs fall below threshold and require planner or OPAL support",
    ],
    confidence: 93,
    basis: "rule",
  },
  "Show me the highest-risk segments": {
    id: "r4",
    role: "assistant",
    content:
      "The highest-risk segment is Low Volume / High Variability, currently represented by ReNu MultiPlus 360mL (RNU-360-LA) with a -31.5% deviation and 44% forecast accuracy.",
    action: "Rebalance weekly distribution for RNU-360-LA. Engage regional planner for manual override.",
    bullets: [
      "RNU-360-LA: largest absolute deviation, lowest accuracy in portfolio",
      "ULT-TORIC-NA (High Volume / High Var): softer demand, but scale makes it material",
      "Both SKUs are on OPAL + Planner — ensure planner engagement is active",
    ],
    confidence: 91,
    basis: "rule",
  },
  "Why did this SKU move outside normal range?": {
    id: "r5",
    role: "assistant",
    content:
      "Based on the selected SKU context, the deviation is driven by an order pattern shift that fell outside the ±12% confidence band established from the prior 90-day rolling average.",
    action: "Review order clustering, confirm if demand is structural or transient, then adjust.",
    bullets: [
      "Daily order shape deviates from the expected weekly distribution curve",
      "The spike is concentrated in specific distribution zones — not uniform",
      "Recommend comparing against same-period last year before committing to a revision",
    ],
    confidence: 78,
    basis: "anomaly",
  },
};
