import React from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Settings, 
  Store, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isOffline, 
    pendingOfflineCount, 
    syncOfflineQueue,
    lastAddedId,
    entries
  } = useDemandMesh();

  const primaryNav = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      desc: 'Today\'s summary & quick counter',
      icon: LayoutDashboard 
    },
    { 
      id: 'capture', 
      label: 'Record Lost Sales', 
      desc: 'Speak or type any item',
      icon: Mic, 
      highlight: true 
    },
    { 
      id: 'ledger', 
      label: 'Lost Sales Book', 
      desc: 'Customer inquiries register',
      icon: BookOpen,
      badge: entries.length,
      pulse: !!lastAddedId
    },
  ];

  const secondaryNav = [
    { 
      id: 'forecast', 
      label: 'Stock Planner', 
      desc: 'Runout dates & reorder savings',
      icon: TrendingUp 
    },
    { 
      id: 'network', 
      label: 'Group Buying (Map)', 
      desc: 'Pool orders with nearby shops',
      icon: Users 
    },
    { 
      id: 'settings', 
      label: 'Shop Settings', 
      desc: 'Store profile & push alerts',
      icon: Settings 
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Desktop & Mobile Drawer Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B1730] text-white border-r border-[#101F3B] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#101F3B]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0BA69C] to-[#101F3B] p-0.5 shadow-md shadow-[#0BA69C]/10 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B1730] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Sparkles className="w-5 h-5 text-[#31D5CD]" />
                <div className="absolute inset-0 bg-[#0BA69C]/10 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white font-mono">
                  DEMAND<span className="text-[#31D5CD]">MESH</span>
                </h1>
              </div>
              <p className="text-[11px] text-[#607087] leading-tight">
                Demand intelligence for retail
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items Organized by Purpose */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto" aria-label="Main Navigation">
          {/* Group 1: Counter Actions */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-mono tracking-wider text-[#607087] uppercase font-bold">
              Shop Counter
            </div>
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#101F3B] text-[#31D5CD] shadow-sm border border-[#0BA69C]/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#101F3B]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon 
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#31D5CD]' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.pulse && (
                      <span className="w-2 h-2 rounded-full bg-[#31D5CD] animate-ping" title="New entry!" />
                    )}
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isActive ? 'bg-[#0BA69C]/20 text-[#31D5CD]' : 'bg-[#101F3B] text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 2: Smart Decisions & Network */}
          <div className="space-y-1 pt-2 border-t border-[#101F3B]/60">
            <div className="px-3 pb-1 text-[10px] font-mono tracking-wider text-[#607087] uppercase font-bold">
              Smart Orders & Savings
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#101F3B] text-[#31D5CD] shadow-sm border border-[#0BA69C]/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#101F3B]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon 
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#31D5CD]' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Store & Connectivity Footer */}
        <div className="p-4 border-t border-[#101F3B] bg-[#070E1F]/50 space-y-3">
          {/* Active Store */}
          <div className="flex items-start gap-2.5">
            <Store className="w-4 h-4 text-[#DCA84E] mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {user.storeName}
              </div>
              <div className="text-[11px] text-[#607087] truncate">
                {user.storeLocation}
              </div>
            </div>
          </div>

          {/* User Role Badge & Connectivity Status */}
          <div className="pt-2 border-t border-[#101F3B]/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#31D5CD]" />
              <span className="font-mono text-[11px] text-slate-300 capitalize">
                {user.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>

            {/* Offline status / queue */}
            <div className="flex items-center gap-1.5">
              {isOffline ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono text-[10px]">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline {pendingOfflineCount > 0 ? `(${pendingOfflineCount})` : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </div>
              )}

              {pendingOfflineCount > 0 && !isOffline && (
                <button
                  onClick={syncOfflineQueue}
                  className="p-1 hover:bg-[#101F3B] text-[#31D5CD] rounded transition-colors"
                  title="Synchronize queued offline transactions"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
