import React from 'react';
import { X, Download, Printer, CheckCircle, FileText, Building, Sparkles } from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const ExportReportModal: React.FC = () => {
  const { 
    isExportModalOpen, 
    setIsExportModalOpen, 
    user, 
    demandEstimate, 
    observationWindow, 
    entries, 
    selectedProduct,
    poolingAnalysis 
  } = useDemandMesh();

  if (!isExportModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Product', 'Variant', 'Quantity', 'Reason', 'Source', 'Status', 'Estimated_Lost_Margin_INR', 'Transcript'];
    const rows = entries.map(e => [
      e.id,
      e.timestamp,
      `"${e.productName}"`,
      `"${e.variant}"`,
      e.quantity,
      e.reason,
      e.source,
      e.status,
      e.estimatedLostMargin,
      `"${(e.rawTranscript || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `demandmesh_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#DFE7EB] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200 print:m-0 print:p-0 print:shadow-none print:border-none">
        {/* Header (Hidden on print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0BA69C]" />
            <h3 className="text-base font-bold text-[#0B1730]">
              Executive Procurement & Demand Audit
            </h3>
            <DemoDataBadge />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Print PDF Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-[#0B1730]" id="printable-area">
          {/* Document Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono tracking-wider text-[#0BA69C] uppercase font-bold">
                DEMANDMESH AUDIT REPORT
              </div>
              <h2 className="text-xl font-bold mt-1 text-[#0B1730]">
                Uncensored Demand & Assortment Intelligence
              </h2>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                Store: {user.storeName} ({user.storeLocation})
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Window: {observationWindow} Days</div>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Logged Inquiries</span>
              <div className="text-lg font-bold font-mono text-[#0B1730] mt-0.5">
                {demandEstimate.totalMissedDemand} requests
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {observationWindow} days</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated True Demand</span>
              <div className="text-lg font-bold font-mono text-[#0BA69C] mt-0.5">
                {demandEstimate.meanDailyDemand} units/day
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Uncensored rate</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Hidden Lost Margin</span>
              <div className="text-lg font-bold font-mono text-rose-600 mt-0.5">
                ₹{demandEstimate.hiddenDemandGap * 100}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Stockout consequence</div>
            </div>
          </div>

          {/* Core Decision Summary */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs space-y-2">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#0BA69C]" />
              <span>Recommended Procurement Action: TEST ASSORTMENT (12 Units)</span>
            </div>
            <p className="text-teal-800 leading-relaxed text-[11px]">
              Strong repeated requests for <strong>{selectedProduct.name} ({selectedProduct.defaultVariant})</strong> indicate validated neighborhood demand. Rather than solo ordering at full pallet MOQ (25 units), join the Indiranagar cluster pooled order to unlock the 15% wholesale tier.
            </p>
          </div>

          {/* Recent Records Audit Table */}
          <div>
            <h4 className="text-xs font-bold text-[#0B1730] uppercase font-mono tracking-wider mb-2">
              Recent Demand Events Sample ({entries.length} Total)
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Product</th>
                    <th className="p-2">Variant</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.slice(0, 6).map(e => (
                    <tr key={e.id}>
                      <td className="p-2 font-mono text-slate-400">{new Date(e.timestamp).toLocaleDateString()}</td>
                      <td className="p-2 font-semibold text-[#0B1730]">{e.productName}</td>
                      <td className="p-2 font-mono text-slate-500">{e.variant}</td>
                      <td className="p-2 text-center font-mono font-bold">{e.quantity}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">{e.reason.replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Verification Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Generated by DemandMesh Engine v1.0</span>
            <span>Audit Hash: #DM-BLR-20261017-094</span>
          </div>
        </div>

        {/* Modal Actions (Hidden on print) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Raw CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
