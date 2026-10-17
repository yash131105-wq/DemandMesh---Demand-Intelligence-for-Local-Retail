import React from 'react';
import { 
  TrendingUp, 
  Store, 
  Calendar, 
  AlertTriangle, 
  ArrowUpRight, 
  Users, 
  ArrowRight,
  Clock,
  Package,
  Sparkles
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemandCapturePanel } from './DemandCapturePanel.tsx';
import { RecommendationCard } from './RecommendationCard.tsx';
import { DemandTrendChart } from './DemandTrendChart.tsx';
import { MissedRequestsBreakdownWidget } from './MissedRequestsBreakdownWidget.tsx';
import { PredictiveStockAlertWidget } from './PredictiveStockAlertWidget.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const OverviewView: React.FC = () => {
  const { 
    setActiveTab, 
    demandEstimate, 
    stores, 
    observationWindow, 
    entries, 
    poolingAnalysis,
    setIsPooledModalOpen 
  } = useDemandMesh();

  // Recent 4 entries
  const recentEntries = entries.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Friendly Storekeeper Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B1730] via-[#101F3B] to-[#070E1F] text-white rounded-2xl p-6 lg:p-7 border border-[#101F3B] relative overflow-hidden shadow-lg">
        {/* Subtle cyan glow */}
        <div 
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #31D5CD 0%, #0BA69C 60%, transparent 80%)' }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono tracking-wider text-[#31D5CD] uppercase font-bold">
              Shop Demand Intelligence
            </span>
            <span className="text-slate-500">·</span>
            <DemoDataBadge className="text-slate-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Stop losing sales when items run out of stock.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            When a customer asks for an item you don't have, log it below. DemandMesh calculates exactly how much you can sell, warns you before items run out, and helps you pool orders with {stores.length} nearby shops for wholesale prices.
          </p>

          <div className="mt-4 flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('capture')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <span>+ Record Lost Sales</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('network')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#101F3B] hover:bg-[#1a2f54] text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
            >
              <span>See Nearby Shops Map</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Missed Requests */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Lost Customer Inquiries
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#DCA84E] flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0B1730]">
              {demandEstimate.totalMissedDemand}
            </span>
            <span className="text-xs text-slate-400">inquiries</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Estimated lost profit:</span>
            <span className="font-mono font-bold text-[#0B1730] flex items-center">
              <RupeeSign className="w-3 h-3 text-slate-500 mr-0.5" />
              <span>{formatNumber(demandEstimate.hiddenDemandGap * 100)}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Nearby Stores Helping */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Nearby Shops in Group
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0BA69C] flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0B1730]">
              {stores.length}
            </span>
            <span className="text-xs text-slate-400">local shops</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Area:</span>
            <span className="font-bold text-[#0B1730]">Indiranagar</span>
          </div>
        </div>

        {/* Metric 3: Observation Window */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Days Tracked
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0B1730]">
              {observationWindow}
            </span>
            <span className="text-xs text-slate-400">days active</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Data accuracy:</span>
            <span className="font-mono text-[#0BA69C] font-bold">
              {Math.round(demandEstimate.dataSufficiencyRatio * 100)}%
            </span>
          </div>
        </div>

        {/* Metric 4: True Daily Demand */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              True Daily Demand
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              Trending Up
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Average need:</span>
            <span className="font-mono font-bold text-[#0B1730]">
              {demandEstimate.meanDailyDemand} units/day
            </span>
          </div>
        </div>
      </div>

      {/* Quick Counter: Type or Speak Any Item Right on Dashboard */}
      <DemandCapturePanel />

      {/* Predictive Low-Stock Alerts with Runout Dates & Push Toggle */}
      <PredictiveStockAlertWidget />

      {/* Decision Recommendation Card: What to do next */}
      <RecommendationCard />

      {/* Main Two-Column Row: Charts & Group Buying */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Demand Trend Visualization */}
          <DemandTrendChart />

          {/* Missed Requests Categorical Breakdown */}
          <MissedRequestsBreakdownWidget />
        </div>

        {/* Right Sidebar: Pooled Purchase Summary & Recent Activity */}
        <div className="space-y-6">
          {/* Group Buying Pooled Purchase Progress */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0BA69C]" />
                <h3 className="text-sm font-bold text-[#0B1730]">
                  Group Order Progress
                </h3>
              </div>
              <DemoDataBadge />
            </div>

            <div className="mt-3.5 space-y-2.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-[#0B1730]">Protein Oats, 500 g</span>
                <span className="font-mono text-[#0BA69C] font-bold">
                  {poolingAnalysis.currentPooledQuantity} / {poolingAnalysis.moq} units
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#0BA69C] to-[#31D5CD] h-full rounded-full transition-all duration-500"
                  style={{ width: `${poolingAnalysis.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>{poolingAnalysis.remainingToMoq} units left to unlock 15% off</span>
                <span>{poolingAnalysis.progressPercent}% Target</span>
              </div>

              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
                By combining orders with {stores.length} nearby Indiranagar shops, you hit distributor minimum wholesale quantity ({poolingAnalysis.moq} units) without tying up cash alone.
              </p>

              <button
                onClick={() => setIsPooledModalOpen(true)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0B1730] hover:bg-[#101F3B] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>Join Group Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Missed Inquiries */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B1730]">
                Recent Inquiries
              </h3>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs text-[#0BA69C] hover:underline font-semibold"
              >
                See all →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1730] truncate">
                      {entry.productName}
                    </span>
                    <span className="font-mono text-slate-600 font-bold shrink-0">
                      {entry.quantity}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>{entry.variant} · {entry.reason.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
