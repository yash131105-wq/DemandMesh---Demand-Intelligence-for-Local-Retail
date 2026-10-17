import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  X, 
  RotateCcw,
  ArrowRight,
  Package,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { parseMissedDemandText } from '../../utils/math.ts';
import { DemandReason } from '../../types/index.ts';

export const DemandCapturePanel: React.FC = () => {
  const { addDemandEntry, addProduct, products } = useDemandMesh();
  
  // Direct entry state
  const [itemName, setItemName] = useState('');
  const [variant, setVariant] = useState('500 g');
  const [quantity, setQuantity] = useState(2);
  const [reason, setReason] = useState<DemandReason>('OUT_OF_STOCK');
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recentAddedMessage, setRecentAddedMessage] = useState<string | null>(null);

  // Check speech API support
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleClear = () => {
    setItemName('');
    setVariant('500 g');
    setQuantity(1);
    setReason('OUT_OF_STOCK');
    if (isListening) setIsListening(false);
  };

  const handleVoiceToggle = () => {
    if (!speechSupported) {
      // Demo speech prompt simulation
      const sample = '3 customers asked for Protein Oats, 500 g, but we are out of stock.';
      applyParsedText(sample);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        applyParsedText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const applyParsedText = (text: string) => {
    const parsed = parseMissedDemandText(text);
    setItemName(parsed.productName);
    if (parsed.variant && parsed.variant !== 'Standard') {
      setVariant(parsed.variant);
    }
    setQuantity(parsed.quantity);
    setReason(parsed.reason);
  };

  const handleAddLostSale = (overrideItem?: string, overrideVariant?: string, overrideQty?: number) => {
    const finalItem = (overrideItem || itemName).trim();
    if (!finalItem) return;

    const finalVariant = overrideVariant || variant || 'Standard';
    const finalQty = overrideQty || quantity || 1;
    const finalReason = reason || 'OUT_OF_STOCK';

    // 1. Check if product already exists in store catalog
    let matched = products.find(p => p.name.toLowerCase() === finalItem.toLowerCase());
    
    // 2. If it's ANY new item, auto-register it into the shop catalog immediately!
    if (!matched) {
      matched = addProduct({
        name: finalItem,
        category: 'Customer Inquiries',
        defaultVariant: finalVariant,
        variants: [finalVariant],
        currentStock: 0,
        reorderPoint: 5,
        costPrice: 120,
        sellingPrice: 160,
        moq: 12,
        isCarried: false,
        leadTimeDays: 3,
      });
    }

    // 3. Record the missed demand entry into the Demand Ledger
    addDemandEntry({
      productId: matched.id,
      productName: matched.name,
      variant: finalVariant,
      quantity: finalQty,
      reason: finalReason,
      source: isListening ? 'VOICE_NOTE' : 'COUNTER_INQUIRY',
      status: 'CAPTURED',
      confidenceScore: 0.98,
      rawTranscript: `${finalQty}x ${matched.name} (${finalVariant}) - ${finalReason.replace(/_/g, ' ')}`,
      notes: 'Logged quickly from shop counter.',
      estimatedLostMargin: finalQty * (matched.sellingPrice - matched.costPrice),
    });

    // 4. Show friendly confirmation
    setRecentAddedMessage(`Added ${finalQty}x "${matched.name} (${finalVariant})" to Lost Sales Book!`);
    handleClear();

    setTimeout(() => {
      setRecentAddedMessage(null);
    }, 3500);
  };

  // Popular quick-add chips for fast 1-tap recording
  const popularKiranaChips = [
    { name: 'Protein Oats', variant: '500 g', qty: 3 },
    { name: 'Unsweetened Almond Milk', variant: '1 L', qty: 2 },
    { name: 'Tata Salt', variant: '1 kg', qty: 2 },
    { name: 'Fortune Sunflower Oil', variant: '1 L', qty: 3 },
    { name: 'Amul Butter', variant: '500 g', qty: 2 },
    { name: 'Aashirvaad Atta', variant: '5 kg', qty: 1 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#DFE7EB] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0BA69C] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1730]">
              Quick Counter: Record What Customers Asked For
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Speak or type <strong className="text-[#0B1730]">ANY item name</strong>. Saves directly to your Lost Sales Book.
          </p>
        </div>

        {/* Clear Option */}
        {(itemName || recentAddedMessage) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors self-start sm:self-auto"
            title="Clear all fields"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {recentAddedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{recentAddedMessage}</span>
          </div>
          <button
            onClick={() => setRecentAddedMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Action Bar: Mic Button + Text Input + Quantity + Add + Clear */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Voice Record Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-200'
                : 'bg-[#0B1730] hover:bg-[#101F3B] text-[#31D5CD]'
            }`}
            title={speechSupported ? 'Click and speak item name' : 'Speech simulation: Click to load demo audio prompt'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 animate-spin" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Speak Item</span>
              </>
            )}
          </button>

          {/* Text Input: ANY Item Name */}
          <div className="relative flex-1">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLostSale();
                }
              }}
              placeholder="Type ANY item (e.g. Tata Tea, Surf Excel, Maggi, Parle-G)..."
              className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 p-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C] text-[#0B1730] placeholder:text-slate-400 placeholder:font-normal"
            />
            {itemName && (
              <button
                type="button"
                onClick={() => setItemName('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                title="Clear text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pack Size / Variant */}
          <div className="w-full md:w-28 shrink-0">
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="Size (e.g. 500g)"
              className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 rounded-l-xl text-xs font-bold"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold text-[#0B1730]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-2 text-slate-600 hover:bg-slate-200 rounded-r-xl text-xs font-bold"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Big Green Add Button */}
          <button
            type="button"
            onClick={() => handleAddLostSale()}
            disabled={!itemName.trim()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0BA69C] hover:bg-[#0BA69C]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lost Sale</span>
          </button>

          {/* Explicit Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center gap-1 px-3 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-rose-600 rounded-xl text-xs font-semibold transition-colors shrink-0"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Reason Selector Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-slate-400">Why couldn't customer buy?</span>
          {[
            { id: 'OUT_OF_STOCK', label: 'Out of Stock' },
            { id: 'NOT_CARRIED', label: 'Shop Does Not Keep This' },
            { id: 'VARIANT_UNAVAILABLE', label: 'Different Pack Size' },
            { id: 'PRICE_MISMATCH', label: 'Price Too High' },
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id as DemandReason)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                reason === r.id
                  ? 'bg-[#0B1730] text-[#31D5CD] font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1-Tap Quick Add Chips */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
          <span>1-Tap Frequent Items:</span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {popularKiranaChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddLostSale(chip.name, chip.variant, chip.qty)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-[#0BA69C]/40 text-slate-700 hover:text-[#0B1730] text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3 text-[#0BA69C]" />
              <span>{chip.name}</span>
              <span className="text-[10px] font-mono text-slate-400">({chip.variant})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
