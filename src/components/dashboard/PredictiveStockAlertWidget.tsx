import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  Calendar, 
  TrendingDown, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const PredictiveStockAlertWidget: React.FC = () => {
  const { 
    predictiveAlerts, 
    pushAlertsEnabled, 
    setPushAlertsEnabled,
    setSelectedProductId,
    setActiveTab,
    setIsPooledModalOpen 
  } = useDemandMesh();

  const [testToastSent, setTestToastSent] = useState(false);

  const criticalCount = predictiveAlerts.filter(a => a.urgency === 'CRITICAL').length;
  const warningCount = predictiveAlerts.filter(a => a.urgency === 'WARNING').length;

  const handleTestNotification = () => {
    setTestToastSent(true);
    setTimeout(() => setTestToastSent(false), 3500);
  };

  const handleReorderClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsPooledModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header & Push Notification Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0B1730]">
                  Predictive Low-Stock Alerts
                </h3>
                <DemoDataBadge />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimates exact dates when inventory will run out based on real customer inquiries
              </p>
            </div>
          </div>
        </div>

        {/* Push-Style Notification Toggle in UI */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <button
              onClick={() => setPushAlertsEnabled(!pushAlertsEnabled)}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              {pushAlertsEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-[#0BA69C]" />
                  <span className="text-[#0B1730]">Push Alerts: <strong className="text-[#0BA69C]">ON</strong></span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Push Alerts: <strong>OFF</strong></span>
                </>
              )}
            </button>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={pushAlertsEnabled}
              onClick={() => setPushAlertsEnabled(!pushAlertsEnabled)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                pushAlertsEnabled ? 'bg-[#0BA69C]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  pushAlertsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {pushAlertsEnabled && (
            <button
              onClick={handleTestNotification}
              className="px-2.5 py-1.5 text-[11px] font-mono text-slate-600 hover:text-[#0B1730] border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              title="Test push notification simulation"
            >
              {testToastSent ? 'Alert Dispatched!' : 'Test Alert'}
            </button>
          )}
        </div>
      </div>

      {/* Simulated Live In-App Push Banner if test clicked */}
      {testToastSent && (
        <div className="p-3 bg-[#0B1730] text-white rounded-xl shadow-lg border border-[#31D5CD]/40 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200 font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div>
              <strong className="text-[#31D5CD]">PUSH NOTIFICATION:</strong> High stockout risk for Protein Oats. Estimated runout today.
            </div>
          </div>
          <button
            onClick={() => setIsPooledModalOpen(true)}
            className="px-2.5 py-1 bg-[#0BA69C] text-white rounded text-[11px] font-bold"
          >
            Reorder Now
          </button>
        </div>
      )}

      {/* Predictive Products Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {predictiveAlerts.map(alert => {
          const isCritical = alert.urgency === 'CRITICAL';
          const isWarning = alert.urgency === 'WARNING';

          return (
            <div
              key={alert.productId}
              className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isCritical
                  ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70'
                  : isWarning
                    ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div>
                {/* Status Badge & Urgency */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800'
                      : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isCritical ? 'CRITICAL · 0 DAYS' : isWarning ? `WARNING · ${alert.daysRemaining}D LEFT` : `${alert.daysRemaining}D BUFFER`}
                  </span>

                  <span className="font-mono text-[11px] text-slate-500">
                    Stock: <strong>{alert.currentStock} units</strong>
                  </span>
                </div>

                {/* SKU Name */}
                <h4 className="font-bold text-sm text-[#0B1730] mt-2">
                  {alert.productName}
                </h4>
                <div className="text-[11px] text-slate-500 font-mono">
                  {alert.variant} · Burn rate: {alert.dailyBurnRate} u/day
                </div>

                {/* Predicted Runout Date */}
                <div className="mt-3 p-2 bg-white/90 rounded-lg border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Runout Date:</span>
                    <strong className={`font-mono text-xs ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {alert.predictedRunoutDate}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Suggested Restock:</span>
                    <span className="font-bold text-[#0BA69C]">{alert.reorderQuantity} units</span>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <button
                onClick={() => handleReorderClick(alert.productId)}
                className={`mt-3 w-full py-1.5 px-3 rounded-lg font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                  isCritical
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : isWarning
                      ? 'bg-[#0B1730] hover:bg-[#101F3B] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{isCritical ? 'Restock / Group Buy' : 'Plan Reorder'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
