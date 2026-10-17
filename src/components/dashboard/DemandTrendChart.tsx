import React, { useState, useMemo } from 'react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { generateDemandForecast } from '../../utils/math.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { Info, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const DemandTrendChart: React.FC = () => {
  const { dailyObservations, demandEstimate, selectedProduct } = useDemandMesh();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showSales, setShowSales] = useState(true);
  const [showMissed, setShowMissed] = useState(true);
  const [showStockout, setShowStockout] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);

  // Compute 7-day forecast from statistical estimate
  const forecastPoints = useMemo(() => {
    return generateDemandForecast(
      demandEstimate.meanDailyDemand,
      demandEstimate.standardDeviation,
      7,
      new Date('2026-10-17')
    );
  }, [demandEstimate]);

  // Historical moving baseline (average observed sales before stockout period)
  const historicalBaseline = useMemo(() => {
    const preStockout = dailyObservations.filter(d => !d.isStockout);
    if (preStockout.length === 0) return 3.5;
    const avg = preStockout.reduce((acc, d) => acc + d.observedSales, 0) / preStockout.length;
    return Number(avg.toFixed(1));
  }, [dailyObservations]);

  // Combine historical observations and forecast points
  const chartData = useMemo(() => {
    const historical = dailyObservations.map((obs, idx) => {
      // Comparison vs historical baseline
      const totalDemandSignal = obs.observedSales + obs.missedRequests;
      const vsBaselinePercent = historicalBaseline > 0 
        ? Math.round(((totalDemandSignal - historicalBaseline) / historicalBaseline) * 100) 
        : 0;

      return {
        index: idx,
        type: 'historical' as const,
        label: obs.dayLabel,
        date: obs.date,
        sales: obs.observedSales,
        missed: obs.missedRequests,
        stock: obs.availableStock,
        isStockout: obs.isStockout,
        totalDemand: totalDemandSignal,
        vsBaselinePercent,
        lostMargin: obs.missedRequests * (selectedProduct.sellingPrice - selectedProduct.costPrice),
        p10: null,
        p50: null,
        p90: null,
      };
    });

    const startIndex = historical.length;
    const future = forecastPoints.map((pt, idx) => ({
      index: startIndex + idx,
      type: 'forecast' as const,
      label: `+${pt.dayIndex}d`,
      date: pt.date,
      sales: null,
      missed: null,
      stock: null,
      isStockout: false,
      totalDemand: pt.p50,
      vsBaselinePercent: Math.round(((pt.p50 - historicalBaseline) / historicalBaseline) * 100),
      lostMargin: 0,
      p10: pt.p10,
      p50: pt.p50,
      p90: pt.p90,
    }));

    return [...historical, ...future];
  }, [dailyObservations, forecastPoints, historicalBaseline, selectedProduct]);

  // Chart dimensions & scaling
  const width = 850;
  const height = 290;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = 10;
  const totalPoints = chartData.length;
  const stepX = innerWidth / (totalPoints - 1);

  const getX = (idx: number) => padding.left + idx * stepX;
  const getY = (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight;

  const historicalCount = dailyObservations.length;
  const forecastStartIndex = historicalCount - 1;

  // Sales line path (historical only)
  const salesPath = chartData
    .filter(d => d.type === 'historical' && d.sales !== null)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.index)} ${getY(d.sales!)}`)
    .join(' ');

  // Missed requests line path
  const missedPath = chartData
    .filter(d => d.type === 'historical' && d.missed !== null)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.index)} ${getY(d.missed!)}`)
    .join(' ');

  // Baseline reference horizontal line
  const baselineY = getY(historicalBaseline);

  // Forecast envelope area [p10, p90]
  const forecastEnvelopePath = useMemo(() => {
    const fPoints = chartData.filter(d => d.type === 'forecast');
    if (fPoints.length === 0) return '';
    
    const anchor = chartData[historicalCount - 1];
    const anchorY = getY(demandEstimate.meanDailyDemand);
    
    let path = `M ${getX(anchor.index)} ${anchorY}`;
    for (const pt of fPoints) {
      path += ` L ${getX(pt.index)} ${getY(pt.p90!)}`;
    }
    for (let i = fPoints.length - 1; i >= 0; i--) {
      path += ` L ${getX(fPoints[i].index)} ${getY(fPoints[i].p10!)}`;
    }
    path += ` Z`;
    return path;
  }, [chartData, historicalCount, demandEstimate]);

  // Median forecast line (p50)
  const forecastMedianPath = useMemo(() => {
    const fPoints = chartData.filter(d => d.type === 'forecast');
    if (fPoints.length === 0) return '';
    const anchor = chartData[historicalCount - 1];
    let path = `M ${getX(anchor.index)} ${getY(demandEstimate.meanDailyDemand)}`;
    for (const pt of fPoints) {
      path += ` L ${getX(pt.index)} ${getY(pt.p50!)}`;
    }
    return path;
  }, [chartData, historicalCount, demandEstimate]);

  const activeItem = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 sm:p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0B1730]">
              Demand Trend & Censoring Dynamics
            </h3>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of recorded POS sales vs customer stockout walkouts and Bayesian forecast
          </p>
        </div>

        {/* Interactive Legend / Series Toggles */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
          <button
            onClick={() => setShowSales(!showSales)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showSales ? 'bg-teal-50 text-[#0BA69C] font-semibold' : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-[#0BA69C]" />
            <span>Recorded Sales</span>
          </button>

          <button
            onClick={() => setShowMissed(!showMissed)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showMissed ? 'bg-amber-50 text-[#DCA84E] font-semibold' : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-0.5 border-t border-dashed border-[#DCA84E]" />
            <span>Missed Inquiries</span>
          </button>

          <button
            onClick={() => setShowStockout(!showStockout)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showStockout ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-100 border border-rose-300" />
            <span>Stockout Period</span>
          </button>

          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showForecast ? 'bg-cyan-50 text-[#0BA69C] font-semibold' : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2 rounded-xs bg-[#31D5CD]/20 border border-[#31D5CD]" />
            <span>Forecast (P10–P90)</span>
          </button>

          <button
            onClick={() => setShowBaseline(!showBaseline)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              showBaseline ? 'bg-slate-100 text-slate-700 font-semibold' : 'text-slate-400 line-through'
            }`}
            title={`Prior period baseline sales rate (${historicalBaseline} units/day)`}
          >
            <span className="w-2.5 h-0.5 border-t border-dotted border-slate-500" />
            <span>Baseline ({historicalBaseline}u)</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Container with mobile smooth scrolling */}
      <div className="relative mt-3 w-full overflow-x-auto touch-pan-x">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto min-w-[620px] select-none"
        >
          <defs>
            <pattern id="trend-stockout-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="3" />
            </pattern>
            <linearGradient id="trend-forecast-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#31D5CD" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0BA69C" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 2, 4, 6, 8, 10].map(val => (
            <g key={val}>
              <line 
                x1={padding.left} 
                y1={getY(val)} 
                x2={width - padding.right} 
                y2={getY(val)} 
                stroke="#F1F5F9" 
                strokeWidth="1"
              />
              <text 
                x={padding.left - 8} 
                y={getY(val) + 4} 
                textAnchor="end" 
                className="text-[10px] font-mono fill-slate-400"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Stockout Zone Shading */}
          {showStockout && (
            <rect
              x={getX(4)}
              y={padding.top}
              width={getX(historicalCount - 1) - getX(4)}
              height={innerHeight}
              fill="url(#trend-stockout-stripe)"
              className="transition-opacity duration-300"
            />
          )}

          {/* Historical Baseline Reference Line */}
          {showBaseline && (
            <g>
              <line
                x1={padding.left}
                y1={baselineY}
                x2={width - padding.right}
                y2={baselineY}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={width - padding.right - 4}
                y={baselineY - 5}
                textAnchor="end"
                className="text-[9px] font-mono fill-slate-400 font-semibold"
              >
                Baseline {historicalBaseline} u/d
              </text>
            </g>
          )}

          {/* Forecast Horizon Divider */}
          <line
            x1={getX(forecastStartIndex)}
            y1={padding.top}
            x2={getX(forecastStartIndex)}
            y2={height - padding.bottom}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={getX(forecastStartIndex) + 6}
            y={padding.top + 12}
            className="text-[10px] font-mono fill-slate-500 font-semibold uppercase"
          >
            Forecast Horizon →
          </text>

          {/* Forecast Uncertainty Envelope (P10 - P90) */}
          {showForecast && (
            <>
              <path
                d={forecastEnvelopePath}
                fill="url(#trend-forecast-band)"
                className="transition-all duration-300"
              />
              <path
                d={forecastMedianPath}
                fill="none"
                stroke="#0BA69C"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </>
          )}

          {/* Recorded Sales Path */}
          {showSales && (
            <path
              d={salesPath}
              fill="none"
              stroke="#0BA69C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Missed Requests Path */}
          {showMissed && (
            <path
              d={missedPath}
              fill="none"
              stroke="#DCA84E"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {chartData.map((d) => {
            const cx = getX(d.index);
            const isHovered = hoveredIndex === d.index;
            return (
              <g key={d.index}>
                {showSales && d.sales !== null && (
                  <circle
                    cx={cx}
                    cy={getY(d.sales)}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#0BA69C"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                )}
                {showMissed && d.missed !== null && (
                  <circle
                    cx={cx}
                    cy={getY(d.missed)}
                    r={isHovered ? 5 : 3.5}
                    fill="#DCA84E"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-all duration-150"
                  />
                )}
                {showForecast && d.p50 !== null && (
                  <circle
                    cx={cx}
                    cy={getY(d.p50)}
                    r={isHovered ? 5 : 3}
                    fill="#31D5CD"
                    stroke="#0B1730"
                    strokeWidth="1"
                    className="transition-all duration-150"
                  />
                )}
                <text
                  x={cx}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    d.type === 'forecast' ? 'fill-[#0BA69C] font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Crosshair */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={padding.top}
              x2={getX(hoveredIndex)}
              y2={height - padding.bottom}
              stroke="#0B1730"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="pointer-events-none"
            />
          )}

          {/* Transparent Hitbox Columns */}
          {chartData.map((d) => (
            <rect
              key={`hitbox-${d.index}`}
              x={getX(d.index) - stepX / 2}
              y={padding.top}
              width={stepX}
              height={innerHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredIndex(d.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(d.index)}
            />
          ))}
        </svg>

        {/* Rich Hover Tooltip with Historical Data Comparison */}
        {activeItem && (
          <div 
            className="absolute top-3 right-4 bg-[#0B1730] text-white p-3 rounded-xl shadow-xl border border-[#101F3B] text-xs pointer-events-none z-20 font-mono min-w-[210px] animate-in fade-in duration-150"
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
              <span>{activeItem.date}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                activeItem.type === 'forecast' ? 'bg-[#31D5CD]/20 text-[#31D5CD]' : 'bg-slate-800 text-slate-300'
              }`}>
                {activeItem.type === 'forecast' ? 'Model Forecast' : 'Observed Observation'}
              </span>
            </div>
            
            <div className="mt-2 space-y-1.5">
              {activeItem.type === 'historical' ? (
                <>
                  <div className="flex justify-between items-center text-teal-400">
                    <span>Recorded Sales:</span>
                    <span className="font-bold">{activeItem.sales} units</span>
                  </div>
                  <div className="flex justify-between items-center text-[#DCA84E]">
                    <span>Missed Inquiries:</span>
                    <span className="font-bold">{activeItem.missed} requests</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Shelf Inventory:</span>
                    <span>{activeItem.stock} on shelf</span>
                  </div>

                  {/* Historical Comparison Line */}
                  <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">vs 14D Baseline ({historicalBaseline}u):</span>
                    <span className={`font-bold flex items-center ${
                      activeItem.vsBaselinePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {activeItem.vsBaselinePercent >= 0 ? '+' : ''}{activeItem.vsBaselinePercent}%
                    </span>
                  </div>

                  {activeItem.isStockout && (
                    <div className="pt-1 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-rose-400">
                      <span>Censored Stockout:</span>
                      <span>Lost: ₹{activeItem.lostMargin}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-[#31D5CD]">
                    <span>Median Demand (P50):</span>
                    <span className="font-bold">{activeItem.p50} units</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>P10 (Conservative):</span>
                    <span>{activeItem.p10} units</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>P90 (Upper Bound):</span>
                    <span>{activeItem.p90} units</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-300">
                    <span>vs Baseline:</span>
                    <span className="text-[#31D5CD] font-bold">+{activeItem.vsBaselinePercent}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Statistical Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 text-[#0BA69C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#0B1730]">Real-Time Uncensoring:</strong> When shelf stock hits 0, completed sales flatline ($S = \min(D, A) = 0$). DemandMesh continuously folds incoming missed requests ({demandEstimate.totalMissedDemand} inquiries logged) into true demand estimation (<span className="font-mono font-semibold text-[#0B1730]">{demandEstimate.meanDailyDemand} units/day</span>).
        </p>
      </div>
    </div>
  );
};
