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
  revenuePerUnit: number;
  ebitdaMarginPct: number;
  topCustomers: string[];
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
    revenuePerUnit: 28.5,
    ebitdaMarginPct: 34,
    topCustomers: ["Walmart US", "CVS Pharmacy", "Walgreens"],
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
    revenuePerUnit: 42.0,
    ebitdaMarginPct: 41,
    topCustomers: ["1-800 Contacts", "LensCrafters", "Target Optical"],
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
    revenuePerUnit: 22.0,
    ebitdaMarginPct: 29,
    topCustomers: ["Sam's Club", "Costco", "Amazon"],
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
    revenuePerUnit: 31.0,
    ebitdaMarginPct: 36,
    topCustomers: ["Walmart US", "Pearle Vision", "America's Best"],
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
    revenuePerUnit: 19.5,
    ebitdaMarginPct: 22,
    topCustomers: ["Rite Aid", "Target", "Walgreens"],
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
    revenuePerUnit: 26.0,
    ebitdaMarginPct: 31,
    topCustomers: ["GlassesUSA", "Clearly", "National Vision"],
  },
  {
    id: "sku-007",
    name: "B+L ULTRA 6-pk",
    code: "BLU-MF-US",
    segment: "High Volume / Med Var",
    deviationPct: 18.7,
    forecastAccuracy: 78,
    volume: 98200,
    variability: "Medium",
    variabilityScore: 0.61,
    recommendedAction: "increase",
    status: "warning",
    forecastEngine: "Blue Yonder + Planner",
    rationale: "Seasonal demand ramp ahead of summer. Volume tracking above expected.",
    currentMonthForecast: 82700,
    currentMonthActual: 98200,
    suggestedAdjustmentPct: 6,
    confidenceScore: 81,
    explanation: "B+L ULTRA orders rising ahead of summer promotion window. Increase forecast by 6% to cover anticipated uplift and protect service levels.",
    history: genHistory(3300, 500, [2, 1, 0], 1.22, 10, 707),
    revenuePerUnit: 33.5,
    ebitdaMarginPct: 38,
    topCustomers: ["Walmart US", "Costco", "CVS Pharmacy"],
  },
  {
    id: "sku-008",
    name: "ReNu MultiPlus 360mL",
    code: "RNU-360-LA",
    segment: "Low Volume / High Var",
    deviationPct: -31.5,
    forecastAccuracy: 44,
    volume: 21800,
    variability: "High",
    variabilityScore: 0.92,
    recommendedAction: "rebalance",
    status: "high-deviation",
    forecastEngine: "OPAL + Planner",
    rationale: "Highest deviation in portfolio. Planner manual override required.",
    currentMonthForecast: 31800,
    currentMonthActual: 21800,
    suggestedAdjustmentPct: -15,
    confidenceScore: 52,
    explanation: "ReNu MultiPlus is experiencing structural demand erosion in LATAM. Weekly distribution rebalance required alongside a -15% forecast reduction.",
    history: genHistory(730, 800, [], 1.0, -35, 808),
    revenuePerUnit: 14.0,
    ebitdaMarginPct: 18,
    topCustomers: ["Farmacia del Ahorro", "Drogasil", "Cruz Verde"],
  },
  {
    id: "sku-009",
    name: "ULTRA Toric 6-pk",
    code: "ULT-TORIC-NA",
    segment: "High Volume / High Var",
    deviationPct: -11.4,
    forecastAccuracy: 67,
    volume: 76500,
    variability: "High",
    variabilityScore: 0.87,
    recommendedAction: "hold",
    status: "warning",
    forecastEngine: "OPAL",
    rationale: "Toric volume softening. Monitoring for further deterioration before action.",
    currentMonthForecast: 86400,
    currentMonthActual: 76500,
    suggestedAdjustmentPct: 0,
    confidenceScore: 63,
    explanation: "ULTRA Toric demand is running below expected but within a watchlist threshold. Hold for one more cycle before committing to a downward revision.",
    history: genHistory(2550, 700, [], 1.0, -8, 909),
    revenuePerUnit: 35.0,
    ebitdaMarginPct: 39,
    topCustomers: ["Walmart US", "LensCrafters", "Visionworks"],
  },
  {
    id: "sku-010",
    name: "SofLens Toric 6-pk",
    code: "SLT-6-EMEA",
    segment: "Medium Volume / Low Var",
    deviationPct: 6.8,
    forecastAccuracy: 89,
    volume: 54300,
    variability: "Low",
    variabilityScore: 0.35,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Performing well in EMEA. Minor upside deviation within tolerance.",
    currentMonthForecast: 50800,
    currentMonthActual: 54300,
    suggestedAdjustmentPct: 0,
    confidenceScore: 92,
    explanation: "SofLens Toric orders in EMEA are trending slightly above expected, within acceptable bounds. Continue current forecast strategy.",
    history: genHistory(1810, 280, [], 1.0, 3, 1010),
    revenuePerUnit: 24.0,
    ebitdaMarginPct: 28,
    topCustomers: ["Specsavers UK", "Vision Express", "Boots Opticians"],
  },
  {
    id: "sku-011",
    name: "Biotrue ONEday 30pk",
    code: "BT-30-APAC",
    segment: "High Volume / Low Var",
    deviationPct: 21.2,
    forecastAccuracy: 69,
    volume: 118700,
    variability: "Low",
    variabilityScore: 0.44,
    recommendedAction: "increase",
    status: "high-deviation",
    forecastEngine: "Blue Yonder + Planner",
    rationale: "APAC orders spiking. Distribution centre stockouts risk if not addressed.",
    currentMonthForecast: 97900,
    currentMonthActual: 118700,
    suggestedAdjustmentPct: 10,
    confidenceScore: 83,
    explanation: "Biotrue ONEday 30pk in APAC is significantly outperforming forecast. Increase by 10% immediately and expedite replenishment from Singapore DC.",
    history: genHistory(3960, 550, [2, 1, 0], 1.30, 18, 1111),
    revenuePerUnit: 27.0,
    ebitdaMarginPct: 33,
    topCustomers: ["OWNDAYS Japan", "Paris Miki", "Aeon Wellness"],
  },
  {
    id: "sku-012",
    name: "ReNu Fresh 240mL",
    code: "RFR-240-NA",
    segment: "Declining / Low Var",
    deviationPct: -19.3,
    forecastAccuracy: 85,
    volume: 28100,
    variability: "Low",
    variabilityScore: 0.27,
    recommendedAction: "decrease",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Consistent decline. Category substitution to multipurpose solutions ongoing.",
    currentMonthForecast: 34800,
    currentMonthActual: 28100,
    suggestedAdjustmentPct: -14,
    confidenceScore: 90,
    explanation: "ReNu Fresh 240mL continues structural decline driven by category shift. Reduce forecast by 14% and align safety stock to lower demand baseline.",
    history: genHistory(937, 350, [], 1.0, -28, 1212),
    revenuePerUnit: 12.5,
    ebitdaMarginPct: 16,
    topCustomers: ["CVS Pharmacy", "Rite Aid", "Dollar General"],
  },
  {
    id: "sku-013",
    name: "ULTRA Multifocal 3-pk",
    code: "ULT-MF-3-US",
    segment: "Specialty / Med Var",
    deviationPct: 9.1,
    forecastAccuracy: 77,
    volume: 38900,
    variability: "Medium",
    variabilityScore: 0.58,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "OPAL",
    rationale: "Steady growth in multifocal segment. Variance within model tolerance.",
    currentMonthForecast: 35600,
    currentMonthActual: 38900,
    suggestedAdjustmentPct: 0,
    confidenceScore: 79,
    explanation: "ULTRA Multifocal 3-pk growing steadily within expected variance. No immediate action needed — hold and reassess at next cycle.",
    history: genHistory(1297, 420, [], 1.0, 5, 1313),
    revenuePerUnit: 38.5,
    ebitdaMarginPct: 43,
    topCustomers: ["LensCrafters", "MyEyeDr", "Walmart Vision"],
  },
  {
    id: "sku-014",
    name: "Lacelle Circle 30pk",
    code: "LC-CIR-30-AS",
    segment: "Medium Volume / High Var",
    deviationPct: -22.8,
    forecastAccuracy: 55,
    volume: 31600,
    variability: "High",
    variabilityScore: 0.89,
    recommendedAction: "decrease",
    status: "high-deviation",
    forecastEngine: "OPAL + Planner",
    rationale: "Highly variable demand in Asia. Model accuracy degraded significantly.",
    currentMonthForecast: 40900,
    currentMonthActual: 31600,
    suggestedAdjustmentPct: -18,
    confidenceScore: 57,
    explanation: "Lacelle Circle demand in Asia Pacific remains highly unpredictable. Reduce forecast by 18% and consider switching to a reactive replenishment model.",
    history: genHistory(1053, 850, [], 1.0, -20, 1414),
    revenuePerUnit: 29.0,
    ebitdaMarginPct: 35,
    topCustomers: ["Watsons Asia", "Guardian Pharmacy", "Lotte Mart"],
  },
  {
    id: "sku-015",
    name: "Optive Lubricant 10mL",
    code: "OPT-LUB-10-EU",
    segment: "Low Volume / Low Var",
    deviationPct: 3.4,
    forecastAccuracy: 93,
    volume: 44700,
    variability: "Low",
    variabilityScore: 0.33,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "OTC segment stable. No disruption signals detected.",
    currentMonthForecast: 43200,
    currentMonthActual: 44700,
    suggestedAdjustmentPct: 0,
    confidenceScore: 95,
    explanation: "Optive Lubricant 10mL performing precisely to model expectations in EU. Maintain forecast and standard replenishment cadence.",
    history: genHistory(1490, 200, [], 1.0, 1, 1515),
    revenuePerUnit: 17.0,
    ebitdaMarginPct: 25,
    topCustomers: ["Boots UK", "Kruidvat", "DM Drogerie"],
  },
  {
    id: "sku-016",
    name: "SofLens Daily Disp. 30pk",
    code: "SLD-30-EMEA",
    segment: "High Volume / Low Var",
    deviationPct: 5.6,
    forecastAccuracy: 84,
    volume: 102400,
    variability: "Low",
    variabilityScore: 0.41,
    recommendedAction: "hold",
    status: "on-track",
    forecastEngine: "Blue Yonder",
    rationale: "Strong performer in EMEA. Minor upside within confidence band.",
    currentMonthForecast: 96900,
    currentMonthActual: 102400,
    suggestedAdjustmentPct: 0,
    confidenceScore: 88,
    explanation: "SofLens Daily Disposable 30pk tracking above forecast but within the upper confidence band. Hold forecast through the next review cycle.",
    history: genHistory(3413, 380, [], 1.0, 2, 1616),
    revenuePerUnit: 23.5,
    ebitdaMarginPct: 28,
    topCustomers: ["Specsavers EU", "Fielmann", "Synoptik"],
  },
  {
    id: "sku-017",
    name: "Biotrue Multi-Purpose 300mL",
    code: "BMP-300-NA",
    segment: "Medium Volume / Med Var",
    deviationPct: -13.7,
    forecastAccuracy: 74,
    volume: 61200,
    variability: "Medium",
    variabilityScore: 0.63,
    recommendedAction: "decrease",
    status: "warning",
    forecastEngine: "OPAL",
    rationale: "Volume declining as market migrates to daily disposables. Adjust forecast.",
    currentMonthForecast: 70900,
    currentMonthActual: 61200,
    suggestedAdjustmentPct: -10,
    confidenceScore: 76,
    explanation: "Biotrue Multi-Purpose solution facing category headwinds as customers switch to daily lenses. Reduce forecast by 10% and adjust safety stock targets.",
    history: genHistory(2040, 600, [], 1.0, -15, 1717),
    revenuePerUnit: 21.0,
    ebitdaMarginPct: 26,
    topCustomers: ["Walmart US", "Target", "Kroger Pharmacy"],
  },
  {
    id: "sku-018",
    name: "ULTRA 6-pk (APAC)",
    code: "ULT-6-APAC",
    segment: "High Volume / Med Var",
    deviationPct: 14.2,
    forecastAccuracy: 72,
    volume: 87300,
    variability: "Medium",
    variabilityScore: 0.66,
    recommendedAction: "increase",
    status: "warning",
    forecastEngine: "Blue Yonder + Planner",
    rationale: "APAC expansion driving incremental volume above plan.",
    currentMonthForecast: 76400,
    currentMonthActual: 87300,
    suggestedAdjustmentPct: 7,
    confidenceScore: 78,
    explanation: "ULTRA 6-pk APAC volume is outperforming due to new market penetration. Increase forecast by 7% and review DC capacity in Singapore.",
    history: genHistory(2910, 520, [2, 1, 0], 1.18, 12, 1818),
    revenuePerUnit: 33.0,
    ebitdaMarginPct: 37,
    topCustomers: ["OWNDAYS", "Owndays Singapore", "Optical 88"],
  },
  {
    id: "sku-019",
    name: "Lacelle 1-Day 30pk",
    code: "LC-1D-30-AS",
    segment: "Specialty / High Var",
    deviationPct: -7.3,
    forecastAccuracy: 61,
    volume: 18400,
    variability: "High",
    variabilityScore: 0.83,
    recommendedAction: "hold",
    status: "needs-review",
    forecastEngine: "OPAL + Planner",
    rationale: "High variability specialty SKU. Needs planner review before adjustment.",
    currentMonthForecast: 19800,
    currentMonthActual: 18400,
    suggestedAdjustmentPct: 0,
    confidenceScore: 59,
    explanation: "Lacelle 1-Day demand in Asia is volatile. Model confidence is low — hold forecast and engage regional planner before making any adjustments.",
    history: genHistory(613, 700, [], 1.0, -5, 1919),
    revenuePerUnit: 32.0,
    ebitdaMarginPct: 38,
    topCustomers: ["Watsons HK", "Sa Sa Cosmetics", "Mannings"],
  },
  {
    id: "sku-020",
    name: "ReNu Advanced 360mL",
    code: "RNU-ADV-360-EU",
    segment: "Medium Volume / Low Var",
    deviationPct: 11.8,
    forecastAccuracy: 80,
    volume: 67500,
    variability: "Low",
    variabilityScore: 0.46,
    recommendedAction: "increase",
    status: "warning",
    forecastEngine: "Blue Yonder",
    rationale: "EU relaunch driving incremental demand. Forecast not yet aligned.",
    currentMonthForecast: 60300,
    currentMonthActual: 67500,
    suggestedAdjustmentPct: 8,
    confidenceScore: 82,
    explanation: "ReNu Advanced relaunched in EU markets is driving orders above plan. Increase forecast by 8% and align with regional trade marketing calendar.",
    history: genHistory(2250, 420, [2, 1, 0], 1.15, 9, 2020),
    revenuePerUnit: 20.5,
    ebitdaMarginPct: 27,
    topCustomers: ["DM Drogerie", "Rossmann", "Müller"],
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
      "The demand spike was driven by Biotrue ONEday 90pk (BT-90-US) in the US East region, where orders exceeded the expected daily consumption profile by 24.3% over the last 2 Days.",
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
