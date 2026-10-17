import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Percent,
  Sparkles,
  Info,
  Map as MapIcon,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { ParticipatingStore } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { LeafletStoreMap } from './LeafletStoreMap.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const LocalDemandNetworkView: React.FC = () => {
  const { 
    stores, 
    selectedProduct, 
    poolingAnalysis, 
    setIsPooledModalOpen 
  } = useDemandMesh();

  const [selectedStore, setSelectedStore] = useState<ParticipatingStore | null>(stores[0]);
  const [mapMode, setMapMode] = useState<'leaflet' | 'schematic'>('leaflet');

  return (
    <div className="space-y-6">
      {/* Friendly Merchant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Nearby Shop Network (Group Buying)
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Join nearby kiranas to buy in bulk directly from distributors and unlock wholesale discounts together
          </p>
        </div>

        {/* Action Button & Map View Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMapMode('leaflet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                mapMode === 'leaflet'
                  ? 'bg-white text-[#0B1730] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Real Map</span>
            </button>
            <button
              onClick={() => setMapMode('schematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                mapMode === 'schematic'
                  ? 'bg-white text-[#0B1730] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Network Grid</span>
            </button>
          </div>

          <button
            onClick={() => setIsPooledModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Join Group Order ({poolingAnalysis.currentPooledQuantity}/{poolingAnalysis.moq}u)</span>
          </button>
        </div>
      </div>

      {/* Simple "How Group Buying Works" Merchant Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-[#DFE7EB] flex items-start gap-3 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0BA69C] font-bold flex items-center justify-center shrink-0">
            1
          </div>
          <div>
            <div className="font-bold text-[#0B1730]">Combine Small Inquiries</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Instead of needing 25 units alone, your 8 units combine with 11 units from neighbors.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#DFE7EB] flex items-start gap-3 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#DCA84E] font-bold flex items-center justify-center shrink-0">
            2
          </div>
          <div>
            <div className="font-bold text-[#0B1730]">Unlock 15% Bulk Price</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Distributor drops price from ₹{selectedProduct.costPrice} to ₹{Math.round(selectedProduct.costPrice * 0.85)} when group hits {poolingAnalysis.moq} units.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#DFE7EB] flex items-start gap-3 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">
            3
          </div>
          <div>
            <div className="font-bold text-[#0B1730]">100% Private & Safe</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Shops only see pledged numbers. Your sales bills and customer names are never shared.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaflet Map Visualizer & Stores List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaflet Map or Schematic */}
        <div className="lg:col-span-2 space-y-3">
          {mapMode === 'leaflet' ? (
            <LeafletStoreMap
              stores={stores}
              selectedStoreId={selectedStore?.id || null}
              onSelectStore={(store) => setSelectedStore(store)}
              targetSKU={selectedProduct.name}
            />
          ) : (
            <div className="bg-[#0B1730] rounded-2xl border border-[#101F3B] p-6 text-white relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              <div className="flex items-center justify-between z-10">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-[#31D5CD] uppercase">
                    Bengaluru East · Indiranagar Cluster
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Participating Kirana Network Topology
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 bg-[#101F3B] px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{stores.length} Connected Stores</span>
                </div>
              </div>

              {/* Schematic Canvas */}
              <div className="relative w-full h-64 my-4">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <circle cx="48" cy="46" r="20" fill="none" stroke="#0BA69C" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.4" />
                  <circle cx="48" cy="46" r="35" fill="none" stroke="#0BA69C" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.2" />

                  {stores.filter(s => !s.isCurrentUserStore).map(store => (
                    <line
                      key={`schematic-line-${store.id}`}
                      x1="48"
                      y1="46"
                      x2={store.coordinates.x}
                      y2={store.coordinates.y}
                      stroke="#31D5CD"
                      strokeWidth={selectedStore?.id === store.id ? '1.4' : '0.7'}
                      strokeDasharray="2 1.5"
                      opacity={selectedStore?.id === store.id ? 0.95 : 0.4}
                    />
                  ))}

                  {stores.map(store => {
                    const isCurrent = store.isCurrentUserStore;
                    const isSelected = selectedStore?.id === store.id;
                    return (
                      <g 
                        key={`schematic-node-${store.id}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedStore(store)}
                      >
                        {isCurrent && (
                          <circle cx={store.coordinates.x} cy={store.coordinates.y} r="6" fill="none" stroke="#31D5CD" strokeWidth="0.8" className="animate-ping" />
                        )}
                        <circle
                          cx={store.coordinates.x}
                          cy={store.coordinates.y}
                          r={isCurrent ? 4.5 : isSelected ? 4 : 3}
                          fill={isCurrent ? '#31D5CD' : '#0BA69C'}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 1.5 : 0.8}
                        />
                        <text
                          x={store.coordinates.x}
                          y={store.coordinates.y + 6}
                          textAnchor="middle"
                          className={`text-[3.2px] font-mono select-none ${isCurrent ? 'fill-white font-bold' : 'fill-slate-300'}`}
                        >
                          {store.name.split(' ')[0]} ({store.proteinOatsCommitment}u)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="pt-3 border-t border-[#101F3B] flex items-center justify-between text-xs text-slate-400 font-mono z-10">
                <span>Cluster Demand: {poolingAnalysis.currentPooledQuantity} units</span>
                <span>Distributor MOQ: {poolingAnalysis.moq} units</span>
              </div>
            </div>
          )}

          {/* Interactive Selected Store Card */}
          {selectedStore && (
            <div className="p-4 bg-white rounded-xl border border-[#DFE7EB] flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0BA69C] flex items-center justify-center font-bold shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#0B1730] truncate">
                      {selectedStore.name}
                    </h4>
                    {selectedStore.isCurrentUserStore && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                        Your Shop
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {selectedStore.neighborhood} · {selectedStore.distanceKm === 0 ? 'Cluster Hub' : `${selectedStore.distanceKm} km away`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Pledged</span>
                  <span className="font-bold text-[#0BA69C] text-sm">
                    {selectedStore.proteinOatsCommitment} units
                  </span>
                </div>
                <button
                  onClick={() => setIsPooledModalOpen(true)}
                  className="px-3 py-1.5 bg-[#0B1730] hover:bg-[#101F3B] text-white rounded-lg text-xs font-semibold"
                >
                  Edit My Units
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Pooled Opportunity Card & Participating Kiranas List */}
        <div className="space-y-4">
          {/* Active Pooled Opportunity */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B1730]">
                Active Group Order
              </h3>
              <DemoDataBadge />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">Product for Group Order:</span>
                <div className="font-bold text-sm text-[#0B1730] mt-0.5">
                  {selectedProduct.name} ({selectedProduct.defaultVariant})
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Total Pledges:</span>
                  <span className="font-bold text-[#0BA69C]">
                    {poolingAnalysis.currentPooledQuantity} of {poolingAnalysis.moq} units
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0BA69C] h-full rounded-full transition-all duration-500"
                    style={{ width: `${poolingAnalysis.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{poolingAnalysis.progressPercent}% to wholesale discount</span>
                  <span>{poolingAnalysis.remainingToMoq} units needed</span>
                </div>
              </div>

              {/* Financial comparison */}
              <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#DFE7EB] space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Single Shop Price:</span>
                  <span className="font-mono line-through">₹{selectedProduct.costPrice}/unit</span>
                </div>
                <div className="flex justify-between items-center font-bold text-[#0BA69C]">
                  <span>Group Bulk Price:</span>
                  <span className="font-mono">₹{Math.round(selectedProduct.costPrice * 0.85)}/unit (-15%)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#DFE7EB]">
                  <span className="text-slate-700 font-semibold">Net Group Savings:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{poolingAnalysis.currentPooledQuantity * Math.round(selectedProduct.costPrice * 0.15)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsPooledModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <span>Commit or Change Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Connected Neighbor Stores */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#0B1730] uppercase font-mono tracking-wider pb-2 border-b border-slate-100">
              Connected Neighbor Stores ({stores.length})
            </h4>
            <div className="divide-y divide-slate-100 mt-1 max-h-56 overflow-y-auto">
              {stores.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedStore(s)}
                  className={`py-2 px-1 flex items-center justify-between text-xs cursor-pointer rounded-lg transition-colors ${
                    selectedStore?.id === s.id ? 'bg-teal-50/70 font-semibold text-[#0B1730]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[#0B1730] truncate">
                      {s.name} {s.isCurrentUserStore && <span className="text-[#0BA69C] font-mono text-[10px]">(You)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.neighborhood} · {s.distanceKm}km</div>
                  </div>
                  <div className="font-mono font-bold text-[#0BA69C] shrink-0">
                    {s.proteinOatsCommitment} units
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
