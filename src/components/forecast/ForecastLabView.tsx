import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  TrendingUp, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { calculateNewsvendorScenario } from '../../utils/math.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { DemandTrendChart } from '../dashboard/DemandTrendChart.tsx';
import { BudgetOptimizationWidget } from './BudgetOptimizationWidget.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const ForecastLabView: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProductId, 
    products, 
    demandEstimate,
    setIsPooledModalOpen
  } = useDemandMesh();

  const [candidateQty, setCandidateQty] = useState<number>(12);
  const [holdingRate, setHoldingRate] = useState<number>(0.05); // 5% holding cost
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(true);

  // Lead-time demand: mean daily demand * leadTimeDays
  const leadTimeDemand = useMemo(() => {
    return Number((demandEstimate.meanDailyDemand * selectedProduct.leadTimeDays).toFixed(1));
  }, [demandEstimate, selectedProduct]);

  const leadTimeStd = useMemo(() => {
    return Number((demandEstimate.standardDeviation * Math.sqrt(selectedProduct.leadTimeDays)).toFixed(1));
  }, [demandEstimate, selectedProduct]);

  // Compute what-if scenario
  const scenario = useMemo(() => {
    return calculateNewsvendorScenario(
      candidateQty,
      leadTimeDemand,
      leadTimeStd,
      selectedProduct.sellingPrice,
      selectedProduct.costPrice,
      holdingRate
    );
  }, [candidateQty, leadTimeDemand, leadTimeStd, selectedProduct, holdingRate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Stock Planner & What-If Simulator
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculate the exact reorder quantity that balances lost sales vs overstock costs
          </p>
        </div>

        {/* Product SKU Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Item:</span>
          <select
            value={selectedProduct.id}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 border border-slate-200 rounded-lg bg-white text-[#0B1730]"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.defaultVariant})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Censored Sales Mathematical Foundation Card */}
      <div className="bg-[#FAF8F2] border border-[#DFE7EB] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFE7EB]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0BA69C]" />
            <h3 className="text-sm font-semibold text-[#0B1730]">
              How DemandMesh Uncovers Hidden Demand: S = min(D, A)
            </h3>
          </div>
          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-xs text-[#0BA69C] hover:underline font-mono"
          >
            {showFormulaDetails ? 'Hide Details' : 'Explain Math'}
          </button>
        </div>

        {showFormulaDetails && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="font-mono font-bold text-[#0B1730] block mb-1">
                1. The Observation Barrier
              </span>
              Traditional inventory systems observe only completed sales <span className="font-mono text-[#0B1730]">S</span>. If available shelf stock <span className="font-mono text-[#0B1730]">A = 0</span>, recorded sales are identically 0, even if dozens of eager shoppers walk through the door.
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="font-mono font-bold text-[#0B1730] block mb-1">
                2. Uncensoring via DemandMesh
              </span>
              By logging missed requests <span className="font-mono text-[#0B1730]">M</span>, DemandMesh reconstructs underlying true demand:
              <div className="font-mono text-[11px] bg-slate-50 p-1.5 rounded mt-1 border border-slate-100 text-teal-800">
                D_hat = S + M · κ (capture multiplier)
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="font-mono font-bold text-[#0B1730] block mb-1">
                3. Critical Fractile (Newsvendor)
              </span>
              Balances underage margin loss <span className="font-mono text-[#0B1730]">C_u = P - C</span> against overage holding penalty <span className="font-mono text-[#0B1730]">C_o = C · h</span>:
              <div className="font-mono text-[11px] bg-slate-50 p-1.5 rounded mt-1 border border-slate-100 text-teal-800">
                CF* = C_u / (C_u + C_o) = {scenario.criticalFractile}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demand Trend Visualization in Forecast Context */}
      <DemandTrendChart />

      {/* Interactive What-If Inventory Simulator */}
      <div className="bg-white rounded-xl border border-[#DFE7EB] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0BA69C]" />
              <h3 className="text-base font-semibold text-[#0B1730]">
                What-If Scenario Simulator: Candidate Order Size
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate stocking trade-offs before placing distributor POs
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[6, 12, 18, 24].map((qty) => (
              <button
                key={qty}
                onClick={() => setCandidateQty(qty)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  candidateQty === qty
                    ? 'bg-[#0B1730] text-[#31D5CD] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {qty} units
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">
              Candidate Order Quantity: <span className="font-mono text-base font-bold text-[#0BA69C]">{candidateQty} units</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Distributor Pallet MOQ: {selectedProduct.moq} units
            </span>
          </div>

          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={candidateQty}
            onChange={(e) => setCandidateQty(parseInt(e.target.value, 10))}
            className="w-full accent-[#0BA69C] h-2 bg-slate-100 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>2 (Minimal)</span>
            <span>12 (Algorithm Recommendation)</span>
            <span>25 (Supplier MOQ)</span>
            <span>30 (Overstock)</span>
          </div>
        </div>

        {/* 4 Outcome Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Tile 1: Stockout Risk */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Stockout Risk P(D &gt; Q)
            </span>
            <div className={`text-xl font-bold font-mono mt-1 ${
              scenario.stockoutRiskPercent > 40 ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {scenario.stockoutRiskPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Probability of unmet demand during lead-time
            </div>
          </div>

          {/* Tile 2: Expected Leftover */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Expected Leftover Stock
            </span>
            <div className="text-xl font-bold font-mono text-[#0B1730] mt-1">
              {scenario.expectedLeftover} units
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Estimated unsold at end of cycle
            </div>
          </div>

          {/* Tile 3: Cash Committed */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Cash Capital Committed
            </span>
            <div className="text-xl font-bold font-mono text-[#0B1730] mt-1 flex items-center">
              <RupeeSign className="w-4 h-4 text-slate-600 mr-0.5" />
              <span>{formatNumber(scenario.cashCommitted)}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>{candidateQty} × </span>
              <RupeeSign className="w-2.5 h-2.5 text-slate-400 mx-0.5" />
              <span>{selectedProduct.costPrice} wholesale</span>
            </div>
          </div>

          {/* Tile 4: Expected Gross Margin */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Expected Net Gross Margin
            </span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1 flex items-center">
              <span>+</span>
              <RupeeSign className="w-4 h-4 text-emerald-600 mx-0.5" />
              <span>{formatNumber(scenario.expectedGrossMargin)}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Revenue minus holding/depreciation
            </div>
          </div>
        </div>

        {/* Why this option? explanation */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1730]">
              <Info className="w-3.5 h-3.5 text-[#0BA69C]" />
              <span>Statistical Rationale for {candidateQty} Units:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {candidateQty <= 8 ? (
                'Under-ordering risk: High stockout probability (>40%) will cause repeat walkouts among fitness customers. Consider scaling to 12 units.'
              ) : candidateQty <= 14 ? (
                'Balanced Assortment Test: 12 units provides 95% service level during the 3-day lead time with minimal leftover holding risk. Ideal for validating new SKUs.'
              ) : (
                'Over-ordering risk: Exceeding 14 units without network pooling ties up shelf space and exceeds the critical fractile point without supplier volume discounts.'
              )}
            </p>
          </div>

          <button
            onClick={() => setIsPooledModalOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#0B1730] hover:bg-[#101F3B] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <span>Pool This SKU</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recharts Budget Optimization & Procurement Savings Widget */}
      <BudgetOptimizationWidget />
    </div>
  );
};
