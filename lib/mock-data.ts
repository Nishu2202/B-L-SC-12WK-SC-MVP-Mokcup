// ─── Types ────────────────────────────────────────────────────────────────────

export type ForecastEngine =
  | "Blue Yonder Forecast"
  | "OPAL Forecast"
  | "Blue Yonder + Planner"
  | "OPAL + Planner";

export type SegmentColor = "green" | "amber" | "blue" | "red";

export type RecommendedAction =
  | "increase"
  | "decrease"
  | "hold"
  | "rebalance";

export interface DailyPoint {
  date: string;
  expected: number;
  actual: number;
  lower?: number;
  upper?: number;
  spike?: boolean;
}

export interface SKU {
  id: string;
  name: string;
  category: string;
  segment: string;
  deviationPct: number;
  forecastAccuracy: number;
  volume: number;
  variability: "Low" | "Medium" | "High";
  recommendedAction: RecommendedAction;
  adjustmentPct: number;
  currentMonthForecast: number;
  currentMonthActual: number;
  projectedMonthEnd: number;
  forecastGap: number;
  confidence: number;
  forecastEngine: ForecastEngine;
  segmentColor: SegmentColor;
  rationale: string;
  nextAction: string;
  whyFlagged: string;
  explanation: string;
  dailyData: DailyPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateDailyData(
  baseMean: number,
  variance: number,
  spikeDay: number,
  spikeMultiplier: number,
  days = 30
): DailyPoint[] {
  const start = new Date("2025-04-01");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const expected = Math.round(baseMean + (Math.random() - 0.5) * variance);
    const isSpike = i >= spikeDay && i <= spikeDay + 2;
    const actualMultiplier = isSpike ? spikeMultiplier : 1 + (Math.random() - 0.5) * 0.12;
    const actual = Math.round(expected * actualMultiplier);
    const band = Math.round(expected * 0.12);
    return {
      date: dateStr,
      expected,
      actual,
      lower: expected - band,
      upper: expected + band,
      spike: isSpike,
    };
  });
}

// ─── SKU Mock Data ─────────────────────────────────────────────────────────────

export const SKU_DATA: SKU[] = [
  {
    id: "SKU-BL-7741",
    name: "SofLens Daily Disposable",
    category: "Contact Lenses",
    segment: "A – High Volume / Low Variability",
    deviationPct: 34,
    forecastAccuracy: 62,
    volume: 148200,
    variability: "Low",
    recommendedAction: "increase",
    adjustmentPct: 8,
    currentMonthForecast: 148200,
    currentMonthActual: 163580,
    projectedMonthEnd: 171400,
    forecastGap: 23200,
    confidence: 87,
    forecastEngine: "Blue Yonder + Planner",
    segmentColor: "amber",
    rationale: "Spike in actuals detected in last 48 hours; forecast accuracy below threshold.",
    nextAction: "Increase current month forecast by 8%. Review distribution across weeks 3–4.",
    whyFlagged:
      "Actual orders exceeded expected profile by 34% over the last 48 hours, driven by a retailer bulk order in EMEA.",
    explanation:
      "The system detected a sharp deviation from the expected daily demand shape starting April 27. The spike aligns with a promotional event in Germany and UK retail channels. Current month-end projection exceeds the standing forecast by ~23,000 units. Recommend increasing the monthly plan and front-loading supply to avoid a late-month shortage.",
    dailyData: generateDailyData(4800, 600, 26, 1.38),
  },
  {
    id: "SKU-BL-3312",
    name: "Biotrue ONEday",
    category: "Contact Lenses",
    segment: "A – High Volume / Low Variability",
    deviationPct: 21,
    forecastAccuracy: 83,
    volume: 126500,
    variability: "Low",
    recommendedAction: "increase",
    adjustmentPct: 5,
    currentMonthForecast: 126500,
    currentMonthActual: 134100,
    projectedMonthEnd: 139200,
    forecastGap: 12700,
    confidence: 82,
    forecastEngine: "Blue Yonder Forecast",
    segmentColor: "green",
    rationale: "Forecast accuracy > 80%; volume high; variability low. Retain Blue Yonder.",
    nextAction: "Monitor; minor upward adjustment of 5% may be warranted.",
    whyFlagged: "Steady outperformance of expected profile over last 5 days in APAC region.",
    explanation:
      "Biotrue ONEday has consistently tracked above expected demand this month. The deviation is modest but sustained, suggesting a structural shift rather than a one-time event. Blue Yonder Forecast remains the right engine; a small upward revision will align month-end targets.",
    dailyData: generateDailyData(4100, 400, 24, 1.22),
  },
  {
    id: "SKU-BL-5509",
    name: "Ultra for Presbyopia",
    category: "Specialty Lenses",
    segment: "B – Medium Volume / High Variability",
    deviationPct: -18,
    forecastAccuracy: 55,
    volume: 38400,
    variability: "High",
    recommendedAction: "decrease",
    adjustmentPct: -12,
    currentMonthForecast: 38400,
    currentMonthActual: 31100,
    projectedMonthEnd: 32800,
    forecastGap: -5600,
    confidence: 71,
    forecastEngine: "OPAL + Planner",
    segmentColor: "red",
    rationale: "High variability and below-threshold accuracy. OPAL + Planner required.",
    nextAction: "Decrease current month forecast by 12%. Rebalance supply to other SKUs.",
    whyFlagged:
      "Actuals tracking significantly below expected profile; risk of excess inventory build.",
    explanation:
      "Ultra for Presbyopia is underperforming its monthly forecast. Demand has softened in North America following a competitor launch. Projected month-end actuals will leave ~5,600 units of over-forecast. Reducing the plan now prevents downstream inventory risk and frees distribution capacity.",
    dailyData: generateDailyData(1240, 280, 18, 0.72),
  },
  {
    id: "SKU-BL-8803",
    name: "Lotemax SM Eye Drops",
    category: "Pharmaceutical",
    segment: "A – High Volume / Low Variability",
    deviationPct: 27,
    forecastAccuracy: 78,
    volume: 95700,
    variability: "Low",
    recommendedAction: "increase",
    adjustmentPct: 7,
    currentMonthForecast: 95700,
    currentMonthActual: 106300,
    projectedMonthEnd: 112100,
    forecastGap: 16400,
    confidence: 85,
    forecastEngine: "Blue Yonder + Planner",
    segmentColor: "amber",
    rationale: "Strong actuals; accuracy slightly below 80% — planner review recommended.",
    nextAction: "Increase current month forecast by 7%. Coordinate with logistics on lead time.",
    whyFlagged:
      "Sudden demand surge in US hospital channel. Expected profile based on prior seasonal pattern does not reflect current dynamics.",
    explanation:
      "Lotemax SM has seen a notable acceleration in hospital and clinic orders over the past week, likely driven by new formulary additions in two large US health systems. The standing forecast was built on Q1 seasonality and does not capture this channel shift. An upward revision of 7% aligns the plan with current order flow.",
    dailyData: generateDailyData(3090, 350, 25, 1.31),
  },
  {
    id: "SKU-BL-2241",
    name: "Alrex Ophthalmic Suspension",
    category: "Pharmaceutical",
    segment: "C – Low Volume / High Variability",
    deviationPct: -9,
    forecastAccuracy: 48,
    volume: 14200,
    variability: "High",
    recommendedAction: "hold",
    adjustmentPct: 0,
    currentMonthForecast: 14200,
    currentMonthActual: 12800,
    projectedMonthEnd: 13400,
    forecastGap: -800,
    confidence: 58,
    forecastEngine: "OPAL Forecast",
    segmentColor: "blue",
    rationale: "Low volume, high variability. Use OPAL Forecast; monitor for 48 hours.",
    nextAction: "Hold forecast. Monitor for 48 hours before adjusting.",
    whyFlagged:
      "Minor negative deviation; insufficient signal strength to recommend adjustment at this time.",
    explanation:
      "Alrex shows a mild tracking-below trend but the deviation is within acceptable noise bands for this SKU. OPAL Forecast is the right engine given high variability. No action recommended for 48 hours; if the trend persists, a small downward adjustment may be warranted.",
    dailyData: generateDailyData(460, 180, 20, 0.88),
  },
  {
    id: "SKU-BL-6670",
    name: "Stellaris Elite System",
    category: "Surgical Equipment",
    segment: "D – Low Volume / Low Variability",
    deviationPct: 15,
    forecastAccuracy: 71,
    volume: 8900,
    variability: "Low",
    recommendedAction: "rebalance",
    adjustmentPct: 0,
    currentMonthForecast: 8900,
    currentMonthActual: 9800,
    projectedMonthEnd: 10200,
    forecastGap: 1300,
    confidence: 76,
    forecastEngine: "OPAL Forecast",
    segmentColor: "blue",
    rationale: "Moderate accuracy; low volume surgical equipment. OPAL Forecast recommended.",
    nextAction: "Rebalance distribution across weeks 3–4. Monthly total appears sufficient.",
    whyFlagged:
      "Orders concentrated in first half of month; weekly distribution profile needs rebalancing.",
    explanation:
      "Stellaris Elite system orders have front-loaded in the first two weeks. The monthly total is tracking close to forecast, but the weekly shape is skewed. Recommend rebalancing distribution to smooth supply chain flow and avoid a late-month bottleneck at regional distribution centers.",
    dailyData: generateDailyData(288, 120, 5, 1.18),
  },
];

// ─── Aggregate Daily Data ──────────────────────────────────────────────────────

export const AGGREGATE_DAILY_DATA: DailyPoint[] = (() => {
  const days = 30;
  const start = new Date("2025-04-01");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    // Sum all SKUs
    const expected = SKU_DATA.reduce((sum, sku) => {
      const pt = sku.dailyData[i];
      return sum + (pt?.expected ?? 0);
    }, 0);
    const actual = SKU_DATA.reduce((sum, sku) => {
      const pt = sku.dailyData[i];
      return sum + (pt?.actual ?? 0);
    }, 0);
    const band = Math.round(expected * 0.08);
    const spike = i >= 25 && i <= 27;
    return { date: dateStr, expected, actual, lower: expected - band, upper: expected + band, spike };
  });
})();

// ─── KPI Summary ──────────────────────────────────────────────────────────────

export const KPI_SUMMARY = {
  demandSpike: {
    label: "Demand Spike Detected",
    value: "+34%",
    sub: "SofLens Daily · Last 48 hrs",
    status: "warning" as const,
  },
  topSKUsAtRisk: {
    label: "Top SKUs at Risk",
    value: "3",
    sub: "Requiring immediate review",
    status: "danger" as const,
  },
  forecastAdjustment: {
    label: "Forecast Adjustment",
    value: "+8%",
    sub: "Recommended for current month",
    status: "info" as const,
  },
  confidence: {
    label: "Confidence Level",
    value: "87%",
    sub: "SofLens Daily prediction",
    status: "success" as const,
  },
  timeToDetect: {
    label: "Time to Detect",
    value: "4.2 hrs",
    sub: "Vs. 48 hrs manual baseline",
    status: "success" as const,
  },
  forecastBias: {
    label: "Forecast Bias",
    value: "+12.6%",
    sub: "Aggregate deviation this month",
    status: "warning" as const,
  },
};

// ─── Copilot Prompts ──────────────────────────────────────────────────────────

export const COPILOT_PROMPTS = [
  "What caused this spike?",
  "Which SKUs should we increase this month?",
  "Which items should stay on Blue Yonder Forecast?",
  "Show me the highest-risk segments",
  "Why did this SKU move outside normal range?",
];

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  summary?: string;
  action?: string;
  bullets?: string[];
  confidence?: number;
  basis?: "rule" | "trend" | "anomaly";
}

export const COPILOT_RESPONSES: Record<string, CopilotMessage> = {
  "What caused this spike?": {
    role: "assistant",
    content: "What caused this spike?",
    summary:
      "A bulk promotional order in EMEA pushed SofLens Daily actuals 34% above the expected daily profile over April 27–29.",
    action: "Increase SofLens Daily monthly forecast by 8% and expedite supply to EMEA DC.",
    bullets: [
      "Germany and UK retail channels placed non-standard orders tied to a regional promo event.",
      "The spike is concentrated in days 27–29, deviating outside the ±12% normal band.",
      "No supply risk currently — DC stock is sufficient for a 9-day cover if orders sustain.",
    ],
    confidence: 87,
    basis: "anomaly",
  },
  "Which SKUs should we increase this month?": {
    role: "assistant",
    content: "Which SKUs should we increase this month?",
    summary:
      "Three SKUs are recommended for upward revision: SofLens Daily (+8%), Lotemax SM (+7%), and Biotrue ONEday (+5%).",
    action: "Apply adjustments in the planning system before the next MPS run.",
    bullets: [
      "SofLens Daily: EMEA promotional demand spike, high confidence.",
      "Lotemax SM: US hospital channel formulary additions driving sustained uplift.",
      "Biotrue ONEday: Consistent APAC outperformance over 5 days — structural demand shift.",
    ],
    confidence: 84,
    basis: "rule",
  },
  "Which items should stay on Blue Yonder Forecast?": {
    role: "assistant",
    content: "Which items should stay on Blue Yonder Forecast?",
    summary:
      "Biotrue ONEday is the only SKU in the current view meeting all criteria for Blue Yonder Forecast retention.",
    action: "Retain Biotrue ONEday on Blue Yonder. Review others on next monthly segmentation cycle.",
    bullets: [
      "Blue Yonder Forecast requires: accuracy > 80%, high volume, and low variability.",
      "Biotrue ONEday meets all three criteria (83% accuracy, 126K units, Low variability).",
      "SofLens Daily is close (78% accuracy) — one clean month could qualify it.",
    ],
    confidence: 91,
    basis: "rule",
  },
  "Show me the highest-risk segments": {
    role: "assistant",
    content: "Show me the highest-risk segments",
    summary:
      "Segment C (Low Volume / High Variability) and Segment B (Medium / High Variability) carry the highest planning risk this month.",
    action: "Prioritize planner review for Ultra for Presbyopia and Alrex. Consider safety stock buffer.",
    bullets: [
      "Ultra for Presbyopia: -18% deviation, forecast accuracy 55% — excess inventory risk.",
      "Alrex Ophthalmic: -9% deviation, high variability, low signal strength.",
      "Both SKUs are on OPAL-based engines — ensure planner override capacity is available.",
    ],
    confidence: 79,
    basis: "trend",
  },
  "Why did this SKU move outside normal range?": {
    role: "assistant",
    content: "Why did this SKU move outside normal range?",
    summary:
      "SofLens Daily exceeded the ±12% daily band on April 27, driven by a non-recurring retailer bulk order.",
    action: "Separate event demand from baseline; do not embed the spike into the long-term statistical model.",
    bullets: [
      "The spike is a one-time event, not a step-change in underlying demand.",
      "Embedding it in the model would inflate the forward forecast by ~3% permanently.",
      "Recommend tagging as 'event demand' in Blue Yonder before the next model refresh.",
    ],
    confidence: 83,
    basis: "anomaly",
  },
};
