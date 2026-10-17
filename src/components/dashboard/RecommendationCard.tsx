import React from 'react';
import { 
  Compass, 
  ArrowUpRight, 
  Sliders, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Scale,
  Sparkles
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const RecommendationCard: React.FC = () => {
  const { 
    setActiveTab, 
    selectedProduct, 
    demandEstimate, 
    setIsPooledModalOpen 
  } = useDemandMesh();

  return (
    <div className="bg-gradient-to-br from-[#101F3B] to-[#0B1730] text-white rounded-xl p-5 border border-[#101F3B] shadow-md relative overflow-hidden">
      {/* Background ambient mesh glow */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #31D5CD 0%, #0BA69C 60%, transparent 80%)' }}
      />

      {/* Top Header: Badge & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a2f54]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0BA69C]/20 border border-[#0BA69C]/40 flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#31D5CD]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-[#31D5CD] uppercase font-bold">
                Prescriptive Decision Engine
              </span>
              <DemoDataBadge className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              TEST ASSORTMENT · 12 Units Initial Batch
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCA84E]/20 text-[#DCA84E] border border-[#DCA84E]/30">
          High Evidence
        </span>
      </div>

      {/* Core Body & Evidence */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Recommendation summary & Product */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Target SKU:</span>
            <span className="font-semibold text-white">{selectedProduct.name} ({selectedProduct.defaultVariant})</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300 font-mono">Not Currently Carried</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Repeated customer inquiries ({demandEstimate.totalMissedDemand} logged over 14 days) indicate an unserved healthy breakfast gap. Rather than committing to a full distributor pallet (MOQ 25 units), validate local sell-through with a calibrated 12-unit test batch or participate in neighborhood pooling.
          </p>

          {/* Upside vs Downside Math */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a2f54]/80 text-xs">
            <div className="bg-[#070E1F]/50 p-2.5 rounded-lg border border-[#1a2f54]/60">
              <div className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Estimated Margin Upside</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5 flex items-center gap-0.5">
                <span>+</span><RupeeSign className="w-3.5 h-3.5 text-emerald-400" /><span>1,200</span> <span className="text-[10px] text-slate-400 font-normal">/ cycle</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                12 units × ₹100 unit gross margin
              </div>
            </div>

            <div className="bg-[#070E1F]/50 p-2.5 rounded-lg border border-[#1a2f54]/60">
              <div className="text-[10px] font-mono text-[#DCA84E] uppercase flex items-center gap-1">
                <Scale className="w-3 h-3" />
                <span>Capital Exposure Bound</span>
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5 flex items-center gap-0.5">
                <RupeeSign className="w-3.5 h-3.5 text-[#DCA84E]" /><span>2,640</span> <span className="text-[10px] text-slate-400 font-normal">max commit</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Downside capped with 5% holding risk
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col justify-between gap-2.5 bg-[#070E1F]/40 p-3.5 rounded-lg border border-[#1a2f54]/60">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Recommended Next Action
            </span>
            <div className="text-xs font-semibold text-[#31D5CD]">
              Join Neighborhood Bulk Pool
            </div>
            <p className="text-[11px] text-slate-400">
              8 of 12 units currently pledged by 7 Indiranagar kiranas.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1a2f54]/80">
            <button
              onClick={() => setIsPooledModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Review Pooled Order</span>
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#101F3B] hover:bg-[#1a2f54] text-slate-200 rounded-lg text-xs font-medium transition-colors border border-[#1a2f54]"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Compare Scenarios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
