import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Package, 
  Clock, 
  Store, 
  AlertCircle,
  ArrowRight,
  X,
  RotateCcw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { parseMissedDemandText } from '../../utils/math.ts';
import { DemandReason } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const CaptureDemandView: React.FC = () => {
  const { addDemandEntry, addProduct, products, setActiveTab } = useDemandMesh();

  // Core item fields
  const [productSearch, setProductSearch] = useState('');
  const [variant, setVariant] = useState('500 g');
  const [quantity, setQuantity] = useState(3);
  const [reason, setReason] = useState<DemandReason>('OUT_OF_STOCK');
  const [notes, setNotes] = useState('');
  const [costPrice, setCostPrice] = useState('120');
  const [sellingPrice, setSellingPrice] = useState('160');

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Common quick items for 1-tap fill
  const quickItems = [
    { name: 'Protein Oats', variant: '500 g', reason: 'OUT_OF_STOCK' as DemandReason, qty: 3 },
    { name: 'Unsweetened Almond Milk', variant: '1 L', reason: 'OUT_OF_STOCK' as DemandReason, qty: 2 },
    { name: 'Organic Millet Cookies', variant: '200 g', reason: 'NOT_CARRIED' as DemandReason, qty: 1 },
    { name: 'Tata Salt', variant: '1 kg', reason: 'OUT_OF_STOCK' as DemandReason, qty: 2 },
    { name: 'Fortune Sunflower Oil', variant: '1 L', reason: 'OUT_OF_STOCK' as DemandReason, qty: 3 },
    { name: 'Amul Butter', variant: '500 g', reason: 'OUT_OF_STOCK' as DemandReason, qty: 2 },
  ];

  const handleClearAll = () => {
    setProductSearch('');
    setVariant('500 g');
    setQuantity(1);
    setReason('OUT_OF_STOCK');
    setNotes('');
    setVoiceTranscript('');
    if (isListening) setIsListening(false);
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.lang = 'en-IN';
        rec.start();
        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setVoiceTranscript(text);
          parseAndFill(text);
          setIsListening(false);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
      } else {
        // Fallback simulation
        setTimeout(() => {
          const sample = '3 customers asked for Protein Oats, 500 g, but we are out of stock.';
          setVoiceTranscript(sample);
          parseAndFill(sample);
          setIsListening(false);
        }, 1200);
      }
    } else {
      setIsListening(false);
    }
  };

  const parseAndFill = (text: string) => {
    const parsed = parseMissedDemandText(text);
    setProductSearch(parsed.productName);
    if (parsed.variant && parsed.variant !== 'Standard') {
      setVariant(parsed.variant);
    }
    setQuantity(parsed.quantity);
    setReason(parsed.reason);
  };

  const handleSelectExisting = (prodName: string, defaultVar: string) => {
    setProductSearch(prodName);
    setVariant(defaultVar);
  };

  const handleSave = () => {
    const finalName = productSearch.trim();
    if (!finalName) return;

    // Check if item exists in store catalog
    let matched = products.find(p => p.name.toLowerCase() === finalName.toLowerCase());

    // If it's ANY new item, auto-register into catalog
    if (!matched) {
      const cost = parseFloat(costPrice) || 120;
      const price = parseFloat(sellingPrice) || 160;

      matched = addProduct({
        name: finalName,
        category: 'New Items',
        defaultVariant: variant,
        variants: [variant],
        currentStock: 0,
        reorderPoint: 5,
        costPrice: cost,
        sellingPrice: price,
        moq: 12,
        isCarried: false,
        leadTimeDays: 3,
      });
    }

    // Add entry to Demand Ledger
    addDemandEntry({
      productId: matched.id,
      productName: matched.name,
      variant,
      quantity,
      reason,
      source: voiceTranscript ? 'VOICE_NOTE' : 'COUNTER_INQUIRY',
      status: 'CAPTURED',
      confidenceScore: 0.96,
      rawTranscript: voiceTranscript || `${quantity} customers asked for ${matched.name} ${variant}`,
      notes: notes || 'Recorded at counter.',
      estimatedLostMargin: quantity * (matched.sellingPrice - matched.costPrice),
    });

    setSuccessBanner(`Saved ${quantity}x "${matched.name} (${variant})" to your Lost Sales Book!`);
    handleClearAll();

    setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  // Filter catalog items matching search
  const filteredCatalog = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Record Lost Sales & Inquiries
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            When a customer asks for any item that is out of stock or you don't carry, log it here in 5 seconds.
          </p>
        </div>

        {/* Clear Option */}
        {(productSearch || voiceTranscript) && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-emerald-700 underline hover:text-emerald-950 font-semibold text-xs ml-4"
          >
            Open Lost Sales Book →
          </button>
        </div>
      )}

      {/* Main Counter Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EB] p-5 sm:p-7 shadow-xs space-y-6">
        {/* Voice Section */}
        <div className="text-center py-6 px-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100 relative">
          <div className="relative inline-block">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-[#0BA69C]/20 animate-ping" />
            )}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-200 scale-105'
                  : 'bg-[#0B1730] text-[#31D5CD] hover:bg-[#101F3B] hover:scale-105'
              }`}
              aria-label="Tap to speak missed demand"
            >
              {isListening ? (
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
              ) : (
                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
              )}
            </button>
          </div>

          <h3 className="mt-3 text-sm font-bold text-[#0B1730]">
            {isListening ? 'Listening... Speak what customer asked for' : 'Tap to Speak Customer Request'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Say something like: "3 customers asked for Protein Oats 500g" or "Customer wanted 2 boxes of Surf Excel"
          </p>

          {voiceTranscript && (
            <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-mono text-teal-900 text-left max-w-lg mx-auto flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-teal-600 block uppercase font-bold mb-0.5">
                  Heard:
                </span>
                "{voiceTranscript}"
              </div>
              <button
                onClick={() => setVoiceTranscript('')}
                className="text-teal-700 hover:text-teal-950 p-1"
                title="Clear transcript"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Fill Buttons */}
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide mb-2">
            Frequent Kirana Stockouts (Tap to fill):
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {quickItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProductSearch(item.name);
                  setVariant(item.variant);
                  setQuantity(item.qty);
                  setReason(item.reason);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-[#0BA69C]/40 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                <span>+ {item.name}</span>
                <span className="text-[10px] font-mono text-slate-400 ml-1">({item.variant})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product / Item Name Input (ANY item allowed) */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">
            Product or Item Name * (Type ANY item)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Type ANY product (e.g. Parle-G, Surf Excel, Tata Salt, Almond Milk)..."
              className="w-full text-xs sm:text-sm font-bold p-3 border border-slate-200 rounded-xl bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
            />
            {productSearch && (
              <button
                type="button"
                onClick={() => setProductSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick suggestions if user is typing and matches exist */}
          {productSearch && filteredCatalog.length > 0 && !products.some(p => p.name.toLowerCase() === productSearch.toLowerCase()) && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400 font-mono">Existing Match?</span>
              {filteredCatalog.slice(0, 3).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectExisting(p.name, p.defaultVariant)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Variant & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pack Size / Variant */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">
              Pack Size / Weight
            </label>
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="e.g. 500 g, 1 kg, 1 L, Pack of 6"
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl bg-white text-[#0B1730]"
            />
            <div className="mt-1.5 flex items-center gap-1 text-[11px]">
              {['200 g', '500 g', '1 kg', '1 L', '5 kg'].map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setVariant(sz)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">
              How Many Customers Asked?
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 border border-slate-200 rounded-l-xl hover:bg-slate-50 text-slate-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-center text-sm font-mono font-bold p-2 border-y border-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 border border-slate-200 rounded-r-xl hover:bg-slate-50 text-slate-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Reason for Lost Sale */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">
            Why couldn't customer buy?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'OUT_OF_STOCK', title: 'Out of Stock', desc: 'Ran out of inventory' },
              { id: 'NOT_CARRIED', title: 'Not Carried', desc: "We don't keep this" },
              { id: 'VARIANT_UNAVAILABLE', title: 'Different Size', desc: 'Wrong pack size' },
              { id: 'PRICE_MISMATCH', title: 'Price Issue', desc: 'Customer felt costly' },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id as DemandReason)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  reason === r.id
                    ? 'border-[#0BA69C] bg-teal-50/60 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`text-xs font-bold ${reason === r.id ? 'text-[#0BA69C]' : 'text-[#0B1730]'}`}>
                  {r.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Counter Notes */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Customer asked if we can keep 2 packets by tomorrow evening"
            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl text-[#0B1730] placeholder:text-slate-400"
          />
        </div>

        {/* Bottom Actions: Clear & Save */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear / Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!productSearch.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0BA69C] hover:bg-[#0BA69C]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <span>Save to Lost Sales Book</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
