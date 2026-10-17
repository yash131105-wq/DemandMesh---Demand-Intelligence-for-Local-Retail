import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalCdf,
  normalQuantile,
  estimateUncensoredDemand,
  generateDemandForecast,
  calculateNewsvendorScenario,
  calculateNetworkPooling,
  parseMissedDemandText,
} from './math.ts';
import type { DailyObservation, StoreContribution } from './math.ts';

test('normal CDF and Quantile functions give accurate standard values', () => {
  // CDF at mean is 0.5
  assert.equal(Math.round(normalCdf(0, 0, 1) * 100) / 100, 0.5);
  // Quantile at median is mean
  assert.equal(Math.round(normalQuantile(0.5, 10, 2)), 10);
  // 97.5% quantile for N(0,1) is approx 1.96
  const q975 = normalQuantile(0.975, 0, 1);
  assert.ok(Math.abs(q975 - 1.96) < 0.05);
});

test('estimateUncensoredDemand uncovers lost demand during stockouts', () => {
  const observations: DailyObservation[] = [
    { date: '2026-10-01', observedSales: 4, availableStock: 10, missedRequests: 0, isStockout: false },
    { date: '2026-10-02', observedSales: 5, availableStock: 8, missedRequests: 0, isStockout: false },
    { date: '2026-10-03', observedSales: 0, availableStock: 0, missedRequests: 3, isStockout: true }, // Stockout day!
    { date: '2026-10-04', observedSales: 0, availableStock: 0, missedRequests: 2, isStockout: true }, // Stockout day!
  ];

  const result = estimateUncensoredDemand(observations, 0.8);
  assert.equal(result.totalObservedSales, 9);
  assert.equal(result.totalMissedDemand, 5);
  // Estimated demand uncensored with kappa=1.25 -> 9 + 5*1.25 = 15.25 -> rounded ~15
  assert.ok(result.totalEstimatedDemand > result.totalObservedSales);
  assert.ok(result.hiddenDemandGap > 0);
});

test('generateDemandForecast generates coherent [p10, p50, p90] bounds', () => {
  const forecast = generateDemandForecast(5, 1.2, 7, new Date('2026-10-15'));
  assert.equal(forecast.length, 7);
  for (const pt of forecast) {
    assert.ok(pt.p10 <= pt.p50, 'p10 should be <= p50');
    assert.ok(pt.p50 <= pt.p90, 'p50 should be <= p90');
    assert.ok(pt.p10 >= 0, 'p10 non-negative');
  }
});

test('calculateNewsvendorScenario computes critical fractile and risk metrics', () => {
  // Selling price 320, cost price 220 => Cu = 100, Co = 220*0.05 = 11 => CF = 100/111 = ~0.90
  const scenario = calculateNewsvendorScenario(12, 10, 2.5, 320, 220, 0.05);
  assert.ok(scenario.criticalFractile > 0.8 && scenario.criticalFractile < 1.0);
  assert.equal(scenario.cashCommitted, 12 * 220);
  assert.ok(scenario.stockoutRiskPercent >= 0 && scenario.stockoutRiskPercent <= 100);
});

test('calculateNetworkPooling determines MOQ thresholds and savings', () => {
  const contributions: StoreContribution[] = [
    { storeId: 's1', storeName: 'Anand Supermarket', quantity: 8, location: 'Indiranagar' },
    { storeId: 's2', storeName: 'Krishna Kirana', quantity: 6, location: 'Domlur' },
    { storeId: 's3', storeName: 'Metro Daily', quantity: 5, location: 'Koramangala' },
  ]; // Total = 19

  // MOQ 25: not yet met
  const analysisPartial = calculateNetworkPooling(contributions, 25, 200, 15);
  assert.equal(analysisPartial.currentPooledQuantity, 19);
  assert.equal(analysisPartial.remainingToMoq, 6);
  assert.equal(analysisPartial.isMoqMet, false);
  assert.equal(analysisPartial.totalNetworkSavings, 0);

  // Add more to exceed MOQ 25
  const contributionsMet: StoreContribution[] = [
    ...contributions,
    { storeId: 's4', storeName: 'Green Grocers', quantity: 7, location: 'HAL' },
  ]; // Total = 26
  const analysisMet = calculateNetworkPooling(contributionsMet, 25, 200, 15);
  assert.equal(analysisMet.isMoqMet, true);
  assert.equal(analysisMet.remainingToMoq, 0);
  assert.equal(analysisMet.discountedUnitCost, 170); // 200 * 0.85
  assert.equal(analysisMet.totalNetworkSavings, 26 * 30); // 780 INR saved
});

test('parseMissedDemandText parses the golden demo scenario', () => {
  const parsed = parseMissedDemandText('3 customers asked for Protein Oats, 500 g, but we are out of stock.');
  assert.equal(parsed.productName, 'Protein Oats');
  assert.equal(parsed.variant, '500 g');
  assert.equal(parsed.quantity, 3);
  assert.equal(parsed.reason, 'OUT_OF_STOCK');
  assert.equal(parsed.confidenceScore, 0.96);
  assert.equal(parsed.isAmbiguous, false);
});
