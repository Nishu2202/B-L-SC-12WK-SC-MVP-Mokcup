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
    recommendedAction: "increase",
    status: "high-deviation",
    forecastEngine: "Blue Yonder + Planner",
    rationale: "Spike detected in last 48h; accuracy below threshold. Planner review needed.",
    currentMonthForecast: 138000,
    currentMonthActual: 142500,
    suggestedAdjustmentPct: 8,
    confidenceScore: 87,
    explanation:
      "Daily orders exceeded the expected consumption profile by 24% in the last 48 hours, driven by a surge in US East region. The spike distribution is front-loaded, suggesting a pull-forward from May. Recommend increasing current-month forecast by 8% and monitoring daily fill rate.",
    history: genHistory(4800, 600, [2, 1, 0], 1.35, 15, 101),
  },
  {
    id: "sku-002",
    name: "Ultra for Astigmatism",
    code: "ULT-TORIC-NA",
    segment: "High Volume / High Var",
    deviationPct: -12.1,
    forecastAccuracy: 61,
    volume: 98200,
    variability: "High",
    recommendedAction: "decrease",
    status: "warning",
    forecastEngine: "OPAL + Planner",
    rationale: "Demand softer than expected. High variability warrants planner input.",
    currentMonthForecast: 102000,
    currentMonthActual: 89700,
    suggestedAdjustmentPct: -5,
    confidenceScore: 72,
    explanation:
      "Actual orders are running 12% below the monthly forecast. Weekly orders trended down for 3 consecutive weeks. Distribution analysis shows no unusual patterns — this is a broad softening. Recommend reducing current-month forecast by 5% and reviewing safety stock.",
    history: genHistory(3400, 700, [], 1.0, -12, 202),
  },
  {
    id: "sku-003",
    name: "SofLens Daily Disposable",
    code: "SLD-30-EMEA",
    segment: "Mid Volume / Low Var",
    deviationPct: 3.2,
    forecastAccuracy: 84,
    volume: 67400,
    variability: "Low",
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "High accuracy, low variability. Blue Yonder forecast is reliable.",
    currentMonthForecast: 68000,
    currentMonthActual: 67400,
    suggestedAdjustmentPct: 0,
    confidenceScore: 93,
    explanation:
      "Demand is tracking within ±5% of the expected profile. No anomalies detected in the last 7 days. Blue Yonder forecast is performing well for this SKU. Recommend holding current forecast and revisiting at next planning cycle.",
    history: genHistory(2280, 250, [], 1.0, 4, 303),
  },
  {
    id: "sku-004",
    name: "Bausch + Lomb ULTRA",
    code: "BLU-MF-US",
    segment: "High Volume / Low Var",
    deviationPct: 18.7,
    forecastAccuracy: 78,
    volume: 115300,
    variability: "Low",
    recommendedAction: "increase",
    status: "warning",
    forecastEngine: "Blue Yonder",
    rationale: "Moderate spike; accuracy still acceptable. Blue Yonder forecast sufficient.",
    currentMonthForecast: 109000,
    currentMonthActual: 115300,
    suggestedAdjustmentPct: 6,
    confidenceScore: 81,
    explanation:
      "Orders spiked 18.7% versus the expected profile over the last 3 days, concentrated in the Southwest distribution zone. Pattern is consistent with a seasonal uptick observed in prior years. Recommend increasing forecast by 6% and confirming supply coverage with regional DCs.",
    history: genHistory(3850, 400, [2, 1, 0], 1.25, 8, 404),
  },
  {
    id: "sku-005",
    name: "ReNu MultiPlus 360mL",
    code: "RNU-360-LA",
    segment: "Low Volume / High Var",
    deviationPct: -31.5,
    forecastAccuracy: 44,
    volume: 22800,
    variability: "High",
    recommendedAction: "rebalance",
    status: "needs-review",
    forecastEngine: "OPAL + Planner",
    rationale: "Low accuracy, high variability. Significant mismatch. Manual review required.",
    currentMonthForecast: 28000,
    currentMonthActual: 19200,
    suggestedAdjustmentPct: -12,
    confidenceScore: 54,
    explanation:
      "This SKU shows the largest absolute deviation this month. Demand has been highly erratic, with large week-to-week swings that neither engine predicted well. Weekly distribution is misaligned. Recommend rebalancing the weekly distribution across the remaining weeks and engaging regional planner for manual override.",
    history: genHistory(950, 400, [], 1.0, -25, 505),
  },
  {
    id: "sku-006",
    name: "PureVision2 HD",
    code: "PV2-US-WEST",
    segment: "Mid Volume / Medium Var",
    deviationPct: 7.8,
    forecastAccuracy: 71,
    volume: 44100,
    variability: "Medium",
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "OPAL",
    rationale: "Moderate accuracy. OPAL handles variability well for this profile.",
    currentMonthForecast: 43000,
    currentMonthActual: 44100,
    suggestedAdjustmentPct: 2,
    confidenceScore: 76,
    explanation:
      "Demand is marginally above forecast at 7.8%. No structural shift detected. OPAL model is tracking well within tolerance. Recommend holding forecast and observing for the next 5 business days before triggering any adjustment.",
    history: genHistory(1480, 300, [], 1.0, 0, 606),
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
      "BT-90-US: +24.3% deviation, concentrated in last 48h, high confidence",
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
