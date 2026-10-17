import React, { useState, useMemo } from 'react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemandReason } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';
import { AlertCircle, Tag, TrendingUp, Package, BarChart2 } from 'lucide-react';

export const MissedRequestsBreakdownWidget: React.FC = () => {
  const { entries, products, setActiveTab } = useDemandMesh();
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'reason' | 'product'>('reason');

  // Total missed requests count
  const totalInquiries = useMemo(() => {
    return entries.reduce((acc, e) => acc + e.quantity, 0);
  }, [entries]);

  // Breakdown by Reason
  const reasonBreakdown = useMemo(() => {
    const counts: Record<DemandReason, { count: number; lostMargin: number }> = {
      OUT_OF_STOCK: { count: 0, lostMargin: 0 },
      NOT_CARRIED: { count: 0, lostMargin: 0 },
      VARIANT_UNAVAILABLE: { count: 0, lostMargin: 0 },
      PRICE_MISMATCH: { count: 0, lostMargin: 0 },
      OTHER: { count: 0, lostMargin: 0 },
    };

    for (const e of entries) {
      counts[e.reason].count += e.quantity;
      counts[e.reason].lostMargin += e.estimatedLostMargin;
    }

    const labels: { reason: DemandReason; label: string; color: string; historicalMix: number }[] = [
      { reason: 'OUT_OF_STOCK', label: 'Out of Stock', color: '#0BA69C', historicalMix: 52 },
      { reason: 'NOT_CARRIED', label: 'Not Carried', color: '#DCA84E', historicalMix: 24 },
      { reason: 'VARIANT_UNAVAILABLE', label: 'Variant Unavailable', color: '#31D5CD', historicalMix: 14 },
      { reason: 'PRICE_MISMATCH', label: 'Price Mismatch', color: '#607087', historicalMix: 10 },
    ];

    return labels.map(item => {
      const data = counts[item.reason];
      const pct = totalInquiries > 0 ? Math.round((data.count / totalInquiries) * 100) : 0;
      const vsHistorical = pct - item.historicalMix;
      return {
        ...item,
        count: data.count,
        lostMargin: data.lostMargin,
        percent: pct,
        vsHistorical,
      };
    });
  }, [entries, totalInquiries]);

  // Breakdown by Product SKU
  const productBreakdown = useMemo(() => {
    const prodMap: Record<string, { name: string; count: number; lostMargin: number; variant: string }> = {};

    for (const p of products) {
      prodMap[p.name] = { name: p.name, count: 0, lostMargin: 0, variant: p.defaultVariant };
    }

    for (const e of entries) {
      if (!prodMap[e.productName]) {
        prodMap[e.productName] = { name: e.productName, count: 0, lostMargin: 0, variant: e.variant };
      }
      prodMap[e.productName].count += e.quantity;
      prodMap[e.productName].lostMargin += e.estimatedLostMargin;
    }

    return Object.values(prodMap)
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [entries, products]);

  return (
    <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#0BA69C]" />
            <h3 className="text-sm font-semibold text-[#0B1730]">
              Missed Demand Distribution & Root Causes
            </h3>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time categorical breakdown of lost inquiries and margin leakage
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTabMode('reason')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTabMode === 'reason' 
                ? 'bg-white text-[#0B1730] shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            By Reason
          </button>
          <button
            onClick={() => setActiveTabMode('product')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTabMode === 'product' 
                ? 'bg-white text-[#0B1730] shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            By Product SKU
          </button>
        </div>
      </div>

      {/* Mode 1: Breakdown by Reason with Multi-Segment Progress and Hover Comparison */}
      {activeTabMode === 'reason' && (
        <div className="space-y-4">
          {/* Proportional Segment Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
            {reasonBreakdown.map((item) => (
              <div
                key={item.reason}
                style={{ 
                  width: `${item.percent}%`, 
                  backgroundColor: item.color 
                }}
                className="h-full transition-all duration-300 relative group cursor-pointer hover:opacity-85"
                onMouseEnter={() => setHoveredReason(item.reason)}
                onMouseLeave={() => setHoveredReason(null)}
                title={`${item.label}: ${item.count} inquiries (${item.percent}%)`}
              />
            ))}
          </div>

          {/* List of Reasons with Detailed Metrics & Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {reasonBreakdown.map((item) => {
              const isHovered = hoveredReason === item.reason;
              return (
                <div
                  key={item.reason}
                  onMouseEnter={() => setHoveredReason(item.reason)}
                  onMouseLeave={() => setHoveredReason(null)}
                  className={`p-3 rounded-lg border transition-all ${
                    isHovered 
                      ? 'border-[#0BA69C] bg-teal-50/40 shadow-xs' 
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="font-semibold text-[#0B1730]">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0B1730]">
                      {item.count} inquiries
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Share of total: <strong>{item.percent}%</strong></span>
                    <span className={`flex items-center gap-0.5 ${
                      item.vsHistorical >= 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'
                    }`}>
                      {item.vsHistorical >= 0 ? '+' : ''}{item.vsHistorical}% vs historical mix
                    </span>
                  </div>

                  <div className="mt-1 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Margin loss:</span>
                    <span className="font-semibold text-rose-600 flex items-center">
                      <RupeeSign className="w-2.5 h-2.5 text-rose-600 mr-0.5" />
                      <span>{formatNumber(item.lostMargin)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Breakdown by Product SKU */}
      {activeTabMode === 'product' && (
        <div className="space-y-2.5 max-h-64 overflow-y-auto">
          {productBreakdown.map((prod, idx) => {
            const pct = totalInquiries > 0 ? Math.round((prod.count / totalInquiries) * 100) : 0;
            return (
              <div 
                key={prod.name} 
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 text-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-3.5 h-3.5 text-[#0BA69C] shrink-0" />
                    <span className="font-semibold text-[#0B1730] truncate">{prod.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({prod.variant})</span>
                  </div>
                  <span className="font-mono font-bold text-[#0B1730] shrink-0">
                    {prod.count} inquiries
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0BA69C] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 shrink-0 w-8 text-right">
                    {pct}%
                  </span>
                  <span className="font-mono text-[11px] text-rose-600 font-semibold shrink-0 ml-2 flex items-center">
                    <RupeeSign className="w-2.5 h-2.5 text-rose-600 mr-0.5" />
                    <span>{formatNumber(prod.lostMargin)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
