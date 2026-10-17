import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Calendar, 
  Download, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Check, 
  ChevronDown, 
  User, 
  Shield, 
  X,
  PlusCircle,
  Mic
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { UserRole } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { 
    activeTab, 
    setActiveTab,
    observationWindow, 
    setObservationWindow, 
    isOffline, 
    setIsOffline,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    user,
    setUserRole,
    resetToDemo,
    setIsExportModalOpen,
  } = useDemandMesh();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard / Daily Overview';
      case 'capture': return 'Record Lost Sales / Counter Voice & Text';
      case 'ledger': return 'Lost Sales Book / Customer Inquiries Register';
      case 'forecast': return 'Stock Planner / Reorders & Savings';
      case 'network': return 'Group Buying / Nearby Kirana Cluster & Map';
      case 'settings': return 'Shop Settings / Store Profile & Alerts';
      default: return 'Shop Console';
    }
  };

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'OWNER', title: 'Store Owner', desc: 'Full procurement & financial control' },
    { role: 'INVENTORY_MANAGER', title: 'Inventory Manager', desc: 'Assortment & forecast simulation' },
    { role: 'CASHIER', title: 'Store Associate', desc: 'Fast missed request capture' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DFE7EB] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#0B1730] hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#0B1730] truncate hidden sm:block">
              {getBreadcrumb()}
            </h2>
            <h2 className="text-sm font-bold text-[#0B1730] truncate sm:hidden font-mono">
              DEMAND<span className="text-[#0BA69C]">MESH</span>
            </h2>
            <DemoDataBadge className="hidden sm:inline-flex" />
          </div>
        </div>
      </div>

      {/* Right Controls: Quick Add, Window selector, Offline Toggle, Export, Notifications, Role */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Fast Action: Record Lost Sale Button */}
        {activeTab !== 'capture' && (
          <button
            onClick={() => setActiveTab('capture')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Record Lost Sale</span>
            <span className="sm:hidden">+ Add</span>
          </button>
        )}

        {/* Observation Window Picker */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <span className="text-slate-400 pl-1.5 pr-0.5">
            <Calendar className="w-3.5 h-3.5" />
          </span>
          {([7, 14, 30] as const).map(days => (
            <button
              key={days}
              onClick={() => setObservationWindow(days)}
              className={`px-2 py-0.5 rounded-md transition-all font-mono text-[11px] ${
                observationWindow === days
                  ? 'bg-white text-[#0B1730] shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>

        {/* Offline Mode Switcher */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            isOffline 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={isOffline ? 'Offline Mode Active. Transactions queued locally.' : 'Online. Central synchronization active.'}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-[#0BA69C]" />}
          <span className="hidden sm:inline text-[11px]">{isOffline ? 'Offline' : 'Online'}</span>
        </button>

        {/* Export Report Trigger */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
          title="Export CSV and printable procurement report"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0BA69C] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#DFE7EB] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0B1730]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0BA69C]/10 text-[#0BA69C] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3.5 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                        !n.read ? 'bg-cyan-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#0B1730]">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors"
            title="Switch User Role"
          >
            <Shield className="w-3.5 h-3.5 text-[#0BA69C]" />
            <span className="hidden md:inline font-mono text-[11px]">
              {user.role === 'OWNER' ? 'Owner' : user.role === 'INVENTORY_MANAGER' ? 'Manager' : 'Cashier'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#DFE7EB] p-2 z-50">
              <div className="px-2 py-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                Active Role
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    setUserRole(r.role);
                    setShowRoleSelector(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                    user.role === r.role ? 'bg-slate-100 text-[#0B1730] font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {user.role === r.role ? (
                      <Check className="w-3.5 h-3.5 text-[#0BA69C]" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-xs">{r.title}</div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={resetToDemo}
          className="p-2 text-slate-400 hover:text-[#0B1730] hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset to default demo data"
          aria-label="Reset Demo Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
