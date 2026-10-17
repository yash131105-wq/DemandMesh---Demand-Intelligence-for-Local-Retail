import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Shield, 
  Database, 
  RotateCcw, 
  Wifi, 
  Check, 
  Save, 
  Sliders, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { UserRole } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    setUserRole, 
    resetToDemo, 
    isOffline, 
    setIsOffline, 
    pendingOfflineCount, 
    syncOfflineQueue,
    entries 
  } = useDemandMesh();

  const [storeName, setStoreName] = useState(user.storeName);
  const [storeLocation, setStoreLocation] = useState(user.storeLocation);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [networkConsent, setNetworkConsent] = useState(true);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              System Configuration & Merchant Settings
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store profile, role-based security permissions, offline queue, and algorithmic parameters
          </p>
        </div>

        <button
          onClick={resetToDemo}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          title="Reset all store state back to initial fixture dataset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Grid of Settings Cards */}
      <div className="space-y-6">
        {/* Card 1: Store Profile */}
        <form onSubmit={handleSaveStore} className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-[#0BA69C]" />
            <h3 className="text-sm font-semibold text-[#0B1730]">
              Merchant Kirana Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-slate-500 uppercase mb-1">
                Store Trade Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-[#0B1730] font-medium"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-500 uppercase mb-1">
                Store Location / Landmark
              </label>
              <input
                type="text"
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-[#0B1730] font-medium"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-500 uppercase mb-1">
                Merchant Lead Contact
              </label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-500 uppercase mb-1">
                Authorized Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1730] hover:bg-[#101F3B] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Profile Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Card 2: Role-Based Access Control (RBAC) */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-[#0BA69C]" />
            <h3 className="text-sm font-semibold text-[#0B1730]">
              Role-Based Access Control (RBAC)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Simulate granular retail staff permissions for Kirana owner, inventory specialist, or counter associate.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                role: 'OWNER' as UserRole,
                title: 'Store Owner',
                desc: 'Full access to financial margins, pooled PO approvals, and ledger editing.',
              },
              {
                role: 'INVENTORY_MANAGER' as UserRole,
                title: 'Inventory Manager',
                desc: 'Access to Forecast Lab, what-if simulations, and restock triggers.',
              },
              {
                role: 'CASHIER' as UserRole,
                title: 'Store Associate',
                desc: 'Streamlined fast capture intake mode; ledger editing restricted.',
              },
            ].map(r => (
              <div
                key={r.role}
                onClick={() => setUserRole(r.role)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                  user.role === r.role
                    ? 'border-[#0BA69C] bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B1730]">{r.title}</span>
                  {user.role === r.role && (
                    <Check className="w-4 h-4 text-[#0BA69C]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Offline Mode & Data Synchronization */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0BA69C]" />
              <h3 className="text-sm font-semibold text-[#0B1730]">
                Local Storage & Database Sync
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {entries.length} local records cached
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <div className="font-semibold text-[#0B1730]">
                Simulate Remote Kirana Offline Mode
              </div>
              <p className="text-slate-500 text-[11px]">
                Enables testing of offline demand logging when retail cellular/Wi-Fi connection drops.
              </p>
            </div>

            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                isOffline ? 'bg-amber-100 text-amber-800' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              {isOffline ? 'Offline Mode Active' : 'Online Mode'}
            </button>
          </div>

          {pendingOfflineCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
              <span className="text-amber-800">
                <strong>{pendingOfflineCount} records</strong> in local offline queue waiting for sync.
              </span>
              <button
                onClick={syncOfflineQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0BA69C] text-white rounded-lg font-semibold hover:bg-[#0BA69C]/90 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 4: Local Demand Network Consent */}
        <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#0B1730]">
                Neighborhood Demand Mesh Participation
              </span>
              <p className="text-[11px] text-slate-500">
                Allow anonymized demand counts to participate in Indiranagar pooled distributor orders.
              </p>
            </div>

            <input
              type="checkbox"
              checked={networkConsent}
              onChange={(e) => setNetworkConsent(e.target.checked)}
              className="w-4 h-4 accent-[#0BA69C] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
