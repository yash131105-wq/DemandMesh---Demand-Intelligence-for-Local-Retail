import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';
import { 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  Percent, 
  Calendar, 
  Layers, 
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';

interface WeeklySpendPoint {
  period: string;
  weekIndex: number;
  currentSpend: number;
  optimizedSpend: number;
  savings: number;
  cumulativeSavings: number;
}

export const BudgetOptimizationWidget: React.FC = () => {
  const { selectedProduct, demandEstimate, poolingAnalysis } = useDemandMesh();

  const [horizonWeeks, setHorizonWeeks] = useState<4 | 8 | 12>(8);
  const [discountTier, setDiscountTier] = useState<number>(15); // 15% default pooled tier

  // Weekly demand estimation in units
  const weeklyDemandUnits = useMemo(() => {
    return Math.max(8, Math.round(demandEstimate.meanDailyDemand * 7));
  }, [demandEstimate]);

  // Generate weekly comparative spend data
  const spendData: WeeklySpendPoint[] = useMemo(() => {
    const points: WeeklySpendPoint[] = [];
    let cumSavings = 0;

    const baseUnitCost = selectedProduct.costPrice; // e.g. INR 220
    const optimizedUnitCost = Math.round(baseUnitCost * (1 - discountTier / 100)); // e.g. INR 187 (-15%)

    for (let w = 1; w <= horizonWeeks; w++) {
      // Natural slight week-to-week kirana variability (+/- 8%)
      const variability = 1 + 0.06 * Math.sin(w * 1.3);
      const unitsThisWeek = Math.round(weeklyDemandUnits * variability);

      // Current spend: Solo distributor orders, emergency spot replenishment, higher holding buffer (+12% overhead)
      const unoptimizedCostPerUnit = baseUnitCost * 1.08; 
      const currentSpend = Math.round(unitsThisWeek * unoptimizedCostPerUnit);

      // Optimized spend: DemandMesh pooled batch orders at wholesale discount tier + calibrated buffer
      const optimizedSpend = Math.round(unitsThisWeek * optimizedUnitCost);

      const weeklySavings = Math.max(0, currentSpend - optimizedSpend);
      cumSavings += weeklySavings;

      points.push({
        period: `Wk ${w}`,
        weekIndex: w,
        currentSpend,
        optimizedSpend,
        savings: weeklySavings,
        cumulativeSavings: cumSavings,
      });
    }

    return points;
  }, [horizonWeeks, weeklyDemandUnits, selectedProduct, discountTier]);

  // Aggregate KPI summary
  const totals = useMemo(() => {
    const totalCurrent = spendData.reduce((acc, p) => acc + p.currentSpend, 0);
    const totalOptimized = spendData.reduce((acc, p) => acc + p.optimizedSpend, 0);
    const totalSavings = totalCurrent - totalOptimized;
    const savingsPercent = totalCurrent > 0 ? Number(((totalSavings / totalCurrent) * 100).toFixed(1)) : 0;

    return {
      totalCurrent,
      totalOptimized,
      totalSavings,
      savingsPercent,
    };
  }, [spendData]);

  // Custom Recharts Tooltip with brand palette & vector RupeeSign
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload.find((p: any) => p.dataKey === 'currentSpend')?.value || 0;
      const optimized = payload.find((p: any) => p.dataKey === 'optimizedSpend')?.value || 0;
      const delta = current - optimized;
      const deltaPct = current > 0 ? Math.round((delta / current) * 100) : 0;

      return (
        <div className="bg-[#0B1730] text-white p-3.5 rounded-xl shadow-xl border border-[#101F3B] text-xs font-mono min-w-[220px]">
          <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
            <span>{label} Spend Comparison</span>
            <span className="text-[10px] text-[#31D5CD]">Procurement Lab</span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#607087]" />
                <span>Current Spend:</span>
              </span>
              <span className="font-bold text-slate-200 flex items-center">
                <RupeeSign className="w-3 h-3 text-slate-400 mr-0.5" />
                <span>{formatNumber(current)}</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-[#31D5CD]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0BA69C]" />
                <span>Predicted Optimized:</span>
              </span>
              <span className="font-bold text-[#31D5CD] flex items-center">
                <RupeeSign className="w-3 h-3 text-[#31D5CD] mr-0.5" />
                <span>{formatNumber(optimized)}</span>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-emerald-400 font-bold">
              <span>Weekly Cost Reduction:</span>
              <span className="flex items-center">
                <span>-</span>
                <RupeeSign className="w-3 h-3 text-emerald-400 mx-0.5" />
                <span>{formatNumber(delta)} ({deltaPct}%)</span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-5">
      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0BA69C] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0B1730]">
                  Budget Optimization & Procurement Savings
                </h3>
                <DemoDataBadge />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Recharts predictive spend trajectory: Current unpooled purchases vs. DemandMesh optimized procurement
              </p>
            </div>
          </div>
        </div>

        {/* Horizon & Discount Selectors */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Horizon Picker */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-mono text-[11px]">
            <span className="text-slate-400 pl-1.5 pr-0.5">
              <Calendar className="w-3 h-3" />
            </span>
            {([4, 8, 12] as const).map(w => (
              <button
                key={w}
                onClick={() => setHorizonWeeks(w)}
                className={`px-2 py-1 rounded-md transition-all ${
                  horizonWeeks === w
                    ? 'bg-white text-[#0B1730] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {w}W
              </button>
            ))}
          </div>

          {/* Discount Tier Picker */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-mono text-[11px]">
            <span className="text-slate-400 pl-1.5 pr-0.5">
              <Percent className="w-3 h-3" />
            </span>
            {[10, 15, 20].map(tier => (
              <button
                key={tier}
                onClick={() => setDiscountTier(tier)}
                className={`px-2 py-1 rounded-md transition-all ${
                  discountTier === tier
                    ? 'bg-[#0BA69C] text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tier}% Tier
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Analytical KPI Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Tile 1: Current Spend */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
            Projected Current Spend
          </span>
          <div className="text-lg font-bold font-mono text-slate-700 mt-1 flex items-center">
            <RupeeSign className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
            <span>{formatNumber(totals.totalCurrent)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Solo retail orders + stockout buffer
          </div>
        </div>

        {/* Tile 2: Predicted Optimized Spend */}
        <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100/80">
          <span className="text-[10px] font-mono text-[#0BA69C] uppercase tracking-wide font-bold">
            Predicted Optimized Spend
          </span>
          <div className="text-lg font-bold font-mono text-[#0BA69C] mt-1 flex items-center">
            <RupeeSign className="w-3.5 h-3.5 text-[#0BA69C] mr-0.5" />
            <span>{formatNumber(totals.totalOptimized)}</span>
          </div>
          <div className="text-[11px] text-teal-700/80 mt-0.5">
            Pooled MOQ + uncensored stocking
          </div>
        </div>

        {/* Tile 3: Net Procurement Savings */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wide font-bold">
            Total Capital Saved
          </span>
          <div className="text-lg font-bold font-mono text-emerald-700 mt-1 flex items-center">
            <span>-</span>
            <RupeeSign className="w-3.5 h-3.5 text-emerald-700 mx-0.5" />
            <span>{formatNumber(totals.totalSavings)}</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-bold">
            {totals.savingsPercent}% budget reduction
          </div>
        </div>

        {/* Tile 4: Working Capital Velocity */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
            Working Capital Freed
          </span>
          <div className="text-lg font-bold font-mono text-[#0B1730] mt-1 flex items-center">
            <RupeeSign className="w-3.5 h-3.5 text-slate-600 mr-0.5" />
            <span>{formatNumber(Math.round(totals.totalSavings * 0.85))}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Redirectable to fast-turn SKUs
          </div>
        </div>
      </div>

      {/* Recharts Comparative Line Chart */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={spendData}
            margin={{ top: 15, right: 25, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            
            <XAxis 
              dataKey="period" 
              stroke="#94A3B8" 
              fontSize={11} 
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#DFE7EB' }}
            />
            
            <YAxis 
              stroke="#94A3B8" 
              fontSize={11} 
              fontFamily="JetBrains Mono, monospace"
              tickLine={false}
              axisLine={{ stroke: '#DFE7EB' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '-10px' }}
              formatter={(value) => (
                <span className="text-slate-700 font-medium">
                  {value === 'currentSpend' ? 'Current Spend (Solo / Spot Replenish)' : 'Predicted Optimized Spend (DemandMesh Pooled)'}
                </span>
              )}
            />

            {/* Current Spend Line (Slate / Deep navy line with hollow markers) */}
            <Line
              type="monotone"
              dataKey="currentSpend"
              name="currentSpend"
              stroke="#607087"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: '#FFFFFF', stroke: '#607087', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#607087', stroke: '#FFFFFF', strokeWidth: 2 }}
            />

            {/* Predicted Optimized Spend Line (Teal #0BA69C with vibrant cyan active dots) */}
            <Line
              type="monotone"
              dataKey="optimizedSpend"
              name="optimizedSpend"
              stroke="#0BA69C"
              strokeWidth={3}
              dot={{ r: 4.5, fill: '#0BA69C', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#31D5CD', stroke: '#0B1730', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rationale & Procurement Mechanism */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#0BA69C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#0B1730]">How Optimization Lowers Spend:</strong> DemandMesh eliminates safety-stock bloat by substituting blind buffer inventory with exact uncensored customer demand signals. Furthermore, aggregating {selectedProduct.name} purchases across the 7 Indiranagar network stores unlocks the distributor's {discountTier}% wholesale bracket, slashing weekly outlay from <span className="font-mono font-semibold text-slate-800 inline-flex items-center"><RupeeSign className="w-3 h-3 text-slate-500 mr-0.5" />{formatNumber(spendData[0]?.currentSpend || 0)}</span> to <span className="font-mono font-semibold text-[#0BA69C] inline-flex items-center"><RupeeSign className="w-3 h-3 text-[#0BA69C] mr-0.5" />{formatNumber(spendData[0]?.optimizedSpend || 0)}</span>.
        </p>
      </div>
    </div>
  );
};
