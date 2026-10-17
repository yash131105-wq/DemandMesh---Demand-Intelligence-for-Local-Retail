/**
 * Pure statistical, forecasting, and inventory optimization engine for DemandMesh.
 * Deterministic, rigorously tested mathematical models.
 */

export interface DailyObservation {
  date: string;
  observedSales: number;
  availableStock: number;
  missedRequests: number;
  isStockout: boolean;
}

export interface DemandEstimateResult {
  meanDailyDemand: number;
  standardDeviation: number;
  totalEstimatedDemand: number;
  totalObservedSales: number;
  totalMissedDemand: number;
  hiddenDemandGap: number; // The demand lost to stockouts/censoring
  dataSufficiencyRatio: number; // 0 to 1
  confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface ForecastPoint {
  date: string;
  dayIndex: number;
  p10: number; // 10th percentile (conservative)
  p50: number; // 50th percentile (median estimate)
  p90: number; // 90th percentile (optimistic)
}

export interface NewsvendorResult {
  criticalFractile: number;
  optimalQuantity: number;
  cashCommitted: number;
  expectedGrossMargin: number;
  stockoutRiskPercent: number;
  expectedLeftover: number;
}

export interface ParsedRequest {
  rawText: string;
  productName: string;
  variant: string;
  quantity: number;
  reason: 'OUT_OF_STOCK' | 'NOT_CARRIED' | 'VARIANT_UNAVAILABLE' | 'PRICE_MISMATCH' | 'OTHER';
  confidenceScore: number; // 0.0 - 1.0
  isAmbiguous: boolean;
  timestamp: string;
}

export interface StoreContribution {
  storeId: string;
  storeName: string;
  quantity: number;
  location: string;
}

export interface PoolingAnalysis {
  moq: number;
  currentPooledQuantity: number;
  remainingToMoq: number;
  isMoqMet: boolean;
  progressPercent: number;
  baseUnitCost: number;
  discountedUnitCost: number;
  totalNetworkSavings: number;
  storeSavings: Record<string, number>;
}

/**
 * Normal CDF approximation (Abramowitz & Stegun formula 7.1.26)
 */
export function normalCdf(x: number, mean: number = 0, std: number = 1): number {
  if (std <= 0) return x >= mean ? 1 : 0;
  const z = (x - mean) / std;
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const prob = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1.0 - prob : prob;
}

/**
 * Normal Inverse CDF (Quantile function) - Acklam's algorithm
 */
export function normalQuantile(p: number, mean: number = 0, std: number = 1): number {
  if (p <= 0.0001) return mean - 3.719 * std;
  if (p >= 0.9999) return mean + 3.719 * std;
  if (p === 0.5) return mean;

  const a1 = -3.969683028665376e+01;
  const a2 =  2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 =  1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 =  2.506628277459239e+00;

  const b1 = -5.447609879822406e+01;
  const b2 =  1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 =  6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;

  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 =  4.374664141464968e+00;
  const c6 =  2.938163982698783e+00;

  const d1 =  7.784695709041462e-03;
  const d2 =  3.224671290700398e-01;
  const d3 =  2.445134137142996e+00;
  const d4 =  3.754408661907416e+00;

  const p_low = 0.02425;
  const p_high = 1.0 - p_low;

  let z: number;
  if (p < p_low) {
    const q = Math.sqrt(-2.0 * Math.log(p));
    z = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
        ((((d1 * q + d2) * q + d3) * q + d4) * q + 1.0);
  } else if (p <= p_high) {
    const q = p - 0.5;
    const r = q * q;
    z = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
        (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1.0);
  } else {
    const q = Math.sqrt(-2.0 * Math.log(1.0 - p));
    z = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
         ((((d1 * q + d2) * q + d3) * q + d4) * q + 1.0);
  }

  return mean + z * std;
}

/**
 * 1. Censored Demand Estimation
 * Traditional POS records S = min(D, A).
 * When stockouts occur (A == 0 or A is binding), missed requests M represent partial uncensoring.
 * True demand D_hat = S + M * kappa (where kappa is unobserved request multiplier, ~1.25)
 */
export function estimateUncensoredDemand(
  observations: DailyObservation[],
  captureEfficiency: number = 0.8
): DemandEstimateResult {
  if (observations.length === 0) {
    return {
      meanDailyDemand: 0,
      standardDeviation: 0,
      totalEstimatedDemand: 0,
      totalObservedSales: 0,
      totalMissedDemand: 0,
      hiddenDemandGap: 0,
      dataSufficiencyRatio: 0,
      confidenceLevel: 'LOW',
    };
  }

  const kappa = captureEfficiency > 0 ? 1.0 / captureEfficiency : 1.0;
  let totalSales = 0;
  let totalMissed = 0;
  let totalEstimated = 0;
  const dailyUncensored: number[] = [];

  for (const obs of observations) {
    totalSales += obs.observedSales;
    totalMissed += obs.missedRequests;

    // If stockout occurred or available was zero, missed requests represent lost sales
    const dayDemand = obs.observedSales + obs.missedRequests * kappa;
    dailyUncensored.push(dayDemand);
    totalEstimated += dayDemand;
  }

  const n = dailyUncensored.length;
  const mean = totalEstimated / n;
  
  const variance = dailyUncensored.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const std = Math.sqrt(variance);

  const hiddenGap = Math.max(0, totalEstimated - totalSales);
  const dataSufficiency = Math.min(1.0, n / 14); // 14-day threshold for reliable kirana estimation
  
  let confidence: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (n >= 14 && dataSufficiency >= 0.8) {
    confidence = 'HIGH';
  } else if (n >= 7) {
    confidence = 'MODERATE';
  }

  return {
    meanDailyDemand: Number(mean.toFixed(2)),
    standardDeviation: Number(std.toFixed(2)),
    totalEstimatedDemand: Math.round(totalEstimated),
    totalObservedSales: totalSales,
    totalMissedDemand: totalMissed,
    hiddenDemandGap: Math.round(hiddenGap),
    dataSufficiencyRatio: Number(dataSufficiency.toFixed(2)),
    confidenceLevel: confidence,
  };
}

/**
 * 2. Probabilistic Forecast Generation
 * Computes central forecast and uncertainty envelope [p10, p50, p90]
 */
export function generateDemandForecast(
  meanDailyDemand: number,
  dailyStd: number,
  horizonDays: number = 7,
  startDate: Date = new Date()
): ForecastPoint[] {
  const points: ForecastPoint[] = [];

  for (let i = 1; i <= horizonDays; i++) {
    const futureDate = new Date(startDate);
    futureDate.setDate(startDate.getDate() + i);

    // Uncertainty grows as sqrt(horizon) for cumulative noise
    const horizonStd = Math.max(0.5, dailyStd * (1 + 0.08 * Math.sqrt(i)));
    
    const p10 = Math.max(0, Math.round(normalQuantile(0.10, meanDailyDemand, horizonStd)));
    const p50 = Math.max(p10, Math.round(normalQuantile(0.50, meanDailyDemand, horizonStd)));
    const p90 = Math.max(p50, Math.round(normalQuantile(0.90, meanDailyDemand, horizonStd)));

    points.push({
      date: futureDate.toISOString().slice(0, 10),
      dayIndex: i,
      p10,
      p50,
      p90,
    });
  }

  return points;
}

/**
 * 3. What-If Newsvendor Inventory Optimization
 * Analyzes candidate order quantity Q vs underage and overage risks
 */
export function calculateNewsvendorScenario(
  candidateQuantity: number,
  meanLeadTimeDemand: number,
  stdLeadTimeDemand: number,
  sellingPrice: number,
  costPrice: number,
  holdingCostRate: number = 0.05
): NewsvendorResult {
  const cu = Math.max(0.1, sellingPrice - costPrice); // Underage cost (lost gross margin)
  const co = Math.max(0.05, costPrice * holdingCostRate); // Overage cost (holding/spoilage)
  const criticalFractile = cu / (cu + co);

  const optimalQty = Math.max(1, Math.round(normalQuantile(criticalFractile, meanLeadTimeDemand, stdLeadTimeDemand)));
  const cashCommitted = candidateQuantity * costPrice;

  // Stockout probability P(D > Q)
  const cdfVal = normalCdf(candidateQuantity, meanLeadTimeDemand, stdLeadTimeDemand);
  const stockoutRisk = Math.max(0, Math.min(100, (1 - cdfVal) * 100));

  // Expected sales min(D, Q) approximated
  const expectedSales = Math.min(candidateQuantity, Math.max(0, meanLeadTimeDemand * (1 - 0.5 * Math.exp(-candidateQuantity / (meanLeadTimeDemand || 1)))));
  const expectedLeftover = Math.max(0, candidateQuantity - expectedSales);
  const grossMargin = (expectedSales * (sellingPrice - costPrice)) - (expectedLeftover * co);

  return {
    criticalFractile: Number(criticalFractile.toFixed(3)),
    optimalQuantity: optimalQty,
    cashCommitted: Math.round(cashCommitted),
    expectedGrossMargin: Math.round(grossMargin),
    stockoutRiskPercent: Number(stockoutRisk.toFixed(1)),
    expectedLeftover: Number(expectedLeftover.toFixed(1)),
  };
}

/**
 * 4. Local Demand Network Pooling Optimizer
 * Calculates aggregation across neighborhood shops, MOQ barriers, and bulk discounts.
 */
export function calculateNetworkPooling(
  contributions: StoreContribution[],
  moq: number = 25,
  baseUnitCost: number = 220, // e.g. INR 220 for 500g oats
  discountTierPercent: number = 15 // 15% discount when aggregate reaches MOQ
): PoolingAnalysis {
  const totalPooled = contributions.reduce((acc, c) => acc + c.quantity, 0);
  const remaining = Math.max(0, moq - totalPooled);
  const isMoqMet = totalPooled >= moq;
  const progress = Math.min(100, Math.round((totalPooled / moq) * 100));
  
  const discountedCost = isMoqMet
    ? Math.round(baseUnitCost * (1 - discountTierPercent / 100))
    : baseUnitCost;

  const unitSavings = baseUnitCost - discountedCost;
  const totalSavings = isMoqMet ? totalPooled * unitSavings : 0;

  const storeSavings: Record<string, number> = {};
  for (const c of contributions) {
    storeSavings[c.storeId] = isMoqMet ? c.quantity * unitSavings : 0;
  }

  return {
    moq,
    currentPooledQuantity: totalPooled,
    remainingToMoq: remaining,
    isMoqMet,
    progressPercent: progress,
    baseUnitCost,
    discountedUnitCost: discountedCost,
    totalNetworkSavings: totalSavings,
    storeSavings,
  };
}

/**
 * 5. Deterministic NLP / Speech Request Parser
 * Parses natural merchant queries like "3 customers asked for Protein Oats, 500 g, but we're out of stock."
 */
export function parseMissedDemandText(text: string): ParsedRequest {
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  // 1. Quantity extraction
  let quantity = 1;
  const numberWordMap: Record<string, number> = {
    one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, twenty: 20
  };

  const qtyMatch = cleaned.match(/\b(\d+)\s*(?:customers?|people|times?|units?|packs?|boxes?|packets?|bottles?|jars?|nos?)?\b/i);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  } else {
    for (const [word, val] of Object.entries(numberWordMap)) {
      const wordRegex = new RegExp(`\\b${word}\\s+(?:customers?|people|times?|items?|units?)\\b`, 'i');
      if (wordRegex.test(cleaned)) {
        quantity = val;
        break;
      }
    }
  }

  // 2. Reason extraction
  let reason: ParsedRequest['reason'] = 'OUT_OF_STOCK';
  if (/not carried|don't carry|never carried|don't have this item|new product/i.test(lower)) {
    reason = 'NOT_CARRIED';
  } else if (/variant|different size|smaller size|larger size|500g instead|1kg instead|flavor|flavour/i.test(lower)) {
    reason = 'VARIANT_UNAVAILABLE';
  } else if (/price|too expensive|expensive|costly|mismatch|rate/i.test(lower)) {
    reason = 'PRICE_MISMATCH';
  } else if (/out of stock|finished|sold out|empty shelf|ran out/i.test(lower)) {
    reason = 'OUT_OF_STOCK';
  }

  // 3. Variant extraction
  let variant = 'Standard';
  const variantMatch = cleaned.match(/\b(\d+\s*(?:g|gm|kg|ml|l|litre|liter|pack|sachets?|pc|tablets?))\b/i);
  if (variantMatch) {
    variant = variantMatch[1].replace(/\s+/g, ' ');
  }

  // 4. Product extraction
  let productName = 'Unknown Product';
  let confidenceScore = 0.85;

  if (/protein oats/i.test(cleaned)) {
    productName = 'Protein Oats';
    confidenceScore = 0.96;
    if (variant === 'Standard') variant = '500 g';
  } else if (/almond milk/i.test(cleaned)) {
    productName = 'Unsweetened Almond Milk';
    confidenceScore = 0.94;
    if (variant === 'Standard') variant = '1 L';
  } else if (/millet cookies|ragi cookies/i.test(cleaned)) {
    productName = 'Organic Millet Cookies';
    confidenceScore = 0.92;
    if (variant === 'Standard') variant = '200 g';
  } else if (/cold pressed coconut oil|coconut oil/i.test(cleaned)) {
    productName = 'Cold Pressed Virgin Coconut Oil';
    confidenceScore = 0.95;
    if (variant === 'Standard') variant = '500 ml';
  } else if (/greek yogurt|greek yoghurt/i.test(cleaned)) {
    productName = 'Probiotic Greek Yogurt';
    confidenceScore = 0.91;
    if (variant === 'Standard') variant = '400 g';
  } else {
    // Generic heuristic
    const productCandidate = cleaned
      .replace(/^(?:today|yesterday|\d+\s*(?:customers?|people)\s*asked\s*for|someone\s*asked\s*for|customer\s*wanted)\s+/i, '')
      .split(/,\s*but|\s+but\s+|\s+we\s+are|\s+which\s+is/i)[0]
      .replace(new RegExp(variant, 'i'), '')
      .trim();
    if (productCandidate.length > 2) {
      productName = productCandidate.charAt(0).toUpperCase() + productCandidate.slice(1);
      confidenceScore = 0.78;
    }
  }

  const isAmbiguous = confidenceScore < 0.80;

  return {
    rawText: cleaned,
    productName,
    variant,
    quantity: Math.max(1, quantity),
    reason,
    confidenceScore,
    isAmbiguous,
    timestamp: new Date().toISOString(),
  };
}
