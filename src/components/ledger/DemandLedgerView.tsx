import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ChevronRight, 
  X, 
  FileSpreadsheet, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { DemandLedgerEntry, DemandReason, DemandStatus } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';
import { RupeeSign, formatNumber } from '../../utils/format.tsx';

export const DemandLedgerView: React.FC = () => {
  const { entries, deleteDemandEntry, updateDemandEntry, lastAddedId, setIsExportModalOpen } = useDemandMesh();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<DemandLedgerEntry | null>(null);

  // Filter and search
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = 
        entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.rawTranscript && entry.rawTranscript.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesReason = selectedReason === 'ALL' || entry.reason === selectedReason;
      const matchesStatus = selectedStatus === 'ALL' || entry.status === selectedStatus;

      return matchesSearch && matchesReason && matchesStatus;
    });
  }, [entries, searchTerm, selectedReason, selectedStatus]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Product', 'Variant', 'Quantity', 'Reason', 'Source', 'Status', 'Estimated_Lost_Margin_INR', 'Transcript'];
    const rows = filteredEntries.map(e => [
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
    link.setAttribute('download', `demandmesh_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReasonLabel = (reason: DemandReason) => {
    switch (reason) {
      case 'OUT_OF_STOCK': return 'Out of Stock';
      case 'NOT_CARRIED': return 'Not Carried';
      case 'VARIANT_UNAVAILABLE': return 'Variant Gap';
      case 'PRICE_MISMATCH': return 'Price Mismatch';
      default: return 'Other';
    }
  };

  const getReasonBadgeClass = (reason: DemandReason) => {
    switch (reason) {
      case 'OUT_OF_STOCK': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'NOT_CARRIED': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'VARIANT_UNAVAILABLE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PRICE_MISMATCH': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Lost Sales Book (Khata)
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every customer inquiry that couldn't be fulfilled is recorded here. Review this before ordering stock.
          </p>
        </div>

        {/* Export / Record Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DFE7EB] hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            title="Download CSV for Excel or supplier sharing"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1730] hover:bg-[#101F3B] rounded-lg text-xs font-semibold text-white transition-colors shadow-xs"
            title="Generate printable procurement summary"
          >
            <Printer className="w-3.5 h-3.5 text-[#31D5CD]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#DFE7EB] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, variant, reason or notes..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C] text-[#0B1730]"
          />
        </div>

        {/* Reason Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Reason:</span>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="text-xs py-2 px-2.5 border border-slate-200 rounded-lg bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30"
          >
            <option value="ALL">All Reasons ({entries.length})</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="NOT_CARRIED">Not Carried</option>
            <option value="VARIANT_UNAVAILABLE">Variant Gap</option>
            <option value="PRICE_MISMATCH">Price Mismatch</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-2.5 border border-slate-200 rounded-lg bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30"
          >
            <option value="ALL">All Statuses</option>
            <option value="CAPTURED">Captured</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RECOMMENDED">Recommended</option>
            <option value="POOLED">Pooled</option>
            <option value="RESTOCKED">Restocked</option>
          </select>
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="bg-white rounded-xl border border-[#DFE7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#DFE7EB] text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Variant</th>
                <th className="py-3 px-4 text-center">Inquiries</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Est. Lost Margin</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No demand records matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isNew = entry.id === lastAddedId;
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isNew ? 'bg-teal-50/80 font-medium' : ''
                      } ${entry.isOfflineQueued ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0B1730]">
                        <div className="flex items-center gap-1.5">
                          <span>{entry.productName}</span>
                          {entry.isOfflineQueued && (
                            <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800">
                              Offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{entry.variant}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0B1730]">
                        {entry.quantity}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getReasonBadgeClass(entry.reason)}`}>
                          {getReasonLabel(entry.reason)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {entry.source.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-[#0BA69C] font-semibold">{entry.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#0B1730]">
                        <span className="flex items-center justify-end">
                          <RupeeSign className="w-3 h-3 text-slate-500 mr-0.5" />
                          <span>{formatNumber(entry.estimatedLostMargin)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline-block" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-mono">
          <span>Showing {filteredEntries.length} of {entries.length} demand events</span>
          <span className="flex items-center">
            <span>Cumulative Lost Margin: </span>
            <RupeeSign className="w-3 h-3 text-slate-500 mx-1" />
            <span>{formatNumber(filteredEntries.reduce((acc, e) => acc + e.estimatedLostMargin, 0))}</span>
          </span>
        </div>
      </div>

      {/* Selected Entry Detail Drawer / Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end backdrop-blur-2xs animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-250 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#0BA69C]" />
                  <span className="font-bold text-sm text-[#0B1730]">
                    Demand Event Detail
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product and Variant */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Product & Pack</span>
                <h3 className="text-base font-bold text-[#0B1730] mt-0.5">
                  {selectedEntry.productName} · {selectedEntry.variant}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Recorded at {selectedEntry.storeName} ({new Date(selectedEntry.timestamp).toLocaleString()})
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Customer Inquiries</span>
                  <div className="text-lg font-bold font-mono text-[#0B1730] mt-0.5">
                    {selectedEntry.quantity} units
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Est. Lost Gross Margin</span>
                  <div className="text-lg font-bold font-mono text-[#0BA69C] mt-0.5 flex items-center">
                    <RupeeSign className="w-4 h-4 text-[#0BA69C] mr-0.5" />
                    <span>{formatNumber(selectedEntry.estimatedLostMargin)}</span>
                  </div>
                </div>
              </div>

              {/* Raw Customer Voice Transcript */}
              {selectedEntry.rawTranscript && (
                <div className="p-3.5 bg-[#FAF8F2] border border-[#DFE7EB] rounded-lg text-xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                    Customer Verbal Inquiry Transcript
                  </span>
                  <p className="italic text-slate-700 leading-relaxed">
                    "{selectedEntry.rawTranscript}"
                  </p>
                </div>
              )}

              {/* Status & Match Confidence */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Resolution Confidence</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0BA69C] h-full rounded-full" 
                        style={{ width: `${Math.round(selectedEntry.confidenceScore * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#0B1730]">
                      {Math.round(selectedEntry.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Workflow Status
                  </span>
                  <select
                    value={selectedEntry.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as DemandStatus;
                      updateDemandEntry(selectedEntry.id, { status: newStatus });
                      setSelectedEntry({ ...selectedEntry, status: newStatus });
                    }}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="CAPTURED">Captured</option>
                    <option value="REVIEWED">Reviewed by Merchant</option>
                    <option value="RECOMMENDED">Assortment Recommendation Triggered</option>
                    <option value="POOLED">Allocated in Pooled Order</option>
                    <option value="RESTOCKED">Restocked on Shelf</option>
                  </select>
                </div>

                {/* Merchant Notes */}
                {selectedEntry.notes && (
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Contextual Notes
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {selectedEntry.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Delete CTA */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteDemandEntry(selectedEntry.id);
                  setSelectedEntry(null);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>

              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-[#0B1730] text-white rounded-lg text-xs font-semibold hover:bg-[#101F3B]"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
