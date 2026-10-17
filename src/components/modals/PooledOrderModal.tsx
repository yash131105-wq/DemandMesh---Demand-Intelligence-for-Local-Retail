import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Check, 
  Plus, 
  Minus, 
  AlertCircle, 
  ShieldCheck, 
  Truck, 
  FileText,
  Building2
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const PooledOrderModal: React.FC = () => {
  const { 
    isPooledModalOpen, 
    setIsPooledModalOpen, 
    stores, 
    updateStoreCommitment, 
    selectedProduct, 
    poolingAnalysis,
    user 
  } = useDemandMesh();

  const currentStore = stores.find(s => s.isCurrentUserStore) || stores[0];
  const [pledgedQty, setPledgedQty] = useState<number>(currentStore.proteinOatsCommitment);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

  if (!isPooledModalOpen) return null;

  const handleQtyChange = (newQty: number) => {
    const val = Math.max(1, newQty);
    setPledgedQty(val);
    updateStoreCommitment(currentStore.id, val);
  };

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
    setTimeout(() => {
      setOrderConfirmed(false);
      setIsPooledModalOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#DFE7EB] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0BA69C] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0B1730]">
                  Pooled Purchase Allocation
                </h3>
                <DemoDataBadge />
              </div>
              <p className="text-xs text-slate-500">
                Aggregating demand across {stores.length} Indiranagar Kirana stores
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPooledModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product & MOQ Threshold Status */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Target SKU</span>
              <div className="font-bold text-sm text-[#0B1730]">{selectedProduct.name} ({selectedProduct.defaultVariant})</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Supplier Tier-1 MOQ</span>
              <div className="font-mono font-bold text-sm text-[#0BA69C]">{poolingAnalysis.moq} units</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#0BA69C] to-[#31D5CD] h-full rounded-full transition-all duration-300"
                style={{ width: `${poolingAnalysis.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>{poolingAnalysis.currentPooledQuantity} units committed</span>
              <span>{poolingAnalysis.remainingToMoq === 0 ? '✓ MOQ Unlocked' : `${poolingAnalysis.remainingToMoq} units needed`}</span>
            </div>
          </div>
        </div>

        {/* Adjust Current Store's Commitment */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-slate-500 uppercase">
            Your Store's Order Allocation ({user.storeName})
          </label>
          <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="text-xs font-semibold text-[#0B1730]">Pledged Quantity</div>
              <div className="text-[11px] text-slate-400">Modify units to test group MOQ unlock</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQtyChange(pledgedQty - 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center font-mono font-bold text-sm text-[#0B1730]">
                {pledgedQty}
              </span>
              <button
                type="button"
                onClick={() => handleQtyChange(pledgedQty + 1)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
          <div className="p-3 bg-slate-50 font-semibold text-[#0B1730] flex items-center justify-between">
            <span>Procurement Financial Breakdown</span>
            <span className="font-mono text-[11px] text-[#0BA69C]">15% Wholesale Discount</span>
          </div>
          <div className="p-3.5 space-y-2 text-slate-600">
            <div className="flex justify-between items-center">
              <span>Your Wholesale Cost (Solo):</span>
              <span className="font-mono line-through text-slate-400 flex items-center">
                <RupeeSign className="w-3 h-3 text-slate-400 mr-0.5" />
                <span>{formatNumber(pledgedQty * selectedProduct.costPrice)}</span>
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-[#0B1730]">
              <span>Your Wholesale Cost (Pooled):</span>
              <span className="font-mono text-[#0BA69C] flex items-center">
                <RupeeSign className="w-3 h-3 text-[#0BA69C] mr-0.5" />
                <span>{formatNumber(pledgedQty * Math.round(selectedProduct.costPrice * 0.85))}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-bold pt-2 border-t border-slate-100">
              <span>Your Store's Net Cash Savings:</span>
              <span className="font-mono flex items-center">
                <span>+</span>
                <RupeeSign className="w-3.5 h-3.5 text-emerald-700 mx-0.5" />
                <span>{formatNumber(pledgedQty * (selectedProduct.costPrice * 0.15))}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Participating Kirana Partners (Anonymized) */}
        <div className="space-y-1 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Neighborhood Group Pledges
          </span>
          <div className="p-3 bg-slate-50 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100">
            {stores.map(s => (
              <div key={s.id} className="py-1.5 flex justify-between items-center text-xs">
                <span className="text-slate-700">{s.name} {s.isCurrentUserStore && <span className="text-[#0BA69C]">(You)</span>}</span>
                <span className="font-mono font-semibold text-slate-900">{s.proteinOatsCommitment} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Simulated group distributor PO
          </span>

          <button
            onClick={handleConfirmOrder}
            disabled={orderConfirmed}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              orderConfirmed
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white'
            }`}
          >
            {orderConfirmed ? (
              <>
                <Check className="w-4 h-4" />
                <span>Pledge Confirmed with Cluster!</span>
              </>
            ) : (
              <>
                <span>Commit {pledgedQty} Units to Pool</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
