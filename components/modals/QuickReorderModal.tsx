'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, RefreshCw, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QuickReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function QuickReorderModal({ isOpen, onClose, item }: QuickReorderModalProps) {
  const { adjustStock } = useStore();

  const [reorderQty, setReorderQty] = useState<number>(100);
  const [supplier, setSupplier] = useState('');
  const [instantInward, setInstantInward] = useState(true);
  const [poNumber, setPoNumber] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      // Calculate a healthy replenishment quantity
      const needed = Math.max(item.minStock * 2 - item.currentStock, item.minStock);
      setReorderQty(needed > 0 ? needed : 100);
      setSupplier(item.brandName || 'Primary Supplier');
      setPoNumber(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const estimatedCost = reorderQty * item.unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reorderQty <= 0) return;

    if (instantInward) {
      adjustStock(item.id, Number(reorderQty), `Immediate PO Replenishment: ${poNumber}`);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Quick Reorder Stock</h3>
              <p className="text-xs text-amber-100">
                Replenish low inventory & maintain safety threshold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {instantInward ? 'Stock Replenished!' : 'Purchase Order Generated!'}
            </h4>
            <p className="text-sm text-slate-500">
              {instantInward
                ? `Added +${reorderQty} ${item.unit} to ${item.name}. Low stock alert resolved.`
                : `${poNumber} has been dispatched to ${supplier}.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Warning callout */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{item.name}</span> has reached{' '}
                <strong className="text-amber-900">{item.currentStock} {item.unit}</strong>{' '}
                (Min limit: {item.minStock} {item.unit}).
              </div>
            </div>

            {/* PO Number & Supplier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  PO Number
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Order Quantity ({item.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={reorderQty}
                onChange={(e) => setReorderQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900"
              />
            </div>

            {/* Mode selection */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={instantInward}
                  onChange={(e) => setInstantInward(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Receive Immediate Inward (Direct Stock Replenish)</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                Directly updates available inventory balance on hand and clears the Low Stock warning
                instantly.
              </p>
            </div>

            {/* Financial summary */}
            <div className="p-3.5 bg-slate-100 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Unit Cost: ₹{item.unitPrice} / {item.unit}</span>
                <span className="font-bold text-slate-800">Estimated PO Value</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-200 transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {instantInward ? 'Replenish Stock Now' : 'Issue Purchase Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
