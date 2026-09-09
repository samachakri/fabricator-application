'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemId?: string | null;
}

export default function StockMovementModal({
  isOpen,
  onClose,
  selectedItemId,
}: StockMovementModalProps) {
  const { inventory, adjustStock } = useStore();

  const [itemId, setItemId] = useState<string>(selectedItemId || '');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(50);
  const [reference, setReference] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (selectedItemId) {
      setItemId(selectedItemId);
    } else if (inventory.length > 0 && !itemId) {
      setItemId(inventory[0].id);
    }
  }, [selectedItemId, inventory, itemId]);

  if (!isOpen) return null;

  const currentItem = inventory.find((i) => i.id === itemId) || inventory[0];
  const delta = movementType === 'in' ? Number(quantity) : -Number(quantity);
  const currentStock = currentItem ? currentItem.currentStock : 0;
  const resultingStock = Math.max(0, currentStock + delta);
  const isNegative = movementType === 'out' && Number(quantity) > currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || quantity <= 0) return;

    adjustStock(currentItem.id, delta, reference || `${movementType === 'in' ? 'Inward delivery' : 'Floor issue'}`);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setQuantity(50);
      setReference('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                movementType === 'in'
                  ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
                  : 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
              }`}
            >
              {movementType === 'in' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">Stock In / Stock Out</h3>
              <p className="text-xs text-slate-300">
                Record material inward delivery or fabrication floor issue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
            <h4 className="text-lg font-bold text-slate-900">Stock Updated Successfully!</h4>
            <p className="text-sm text-slate-500">
              {currentItem?.name}: New Stock Level is{' '}
              <strong className="text-slate-800">
                {resultingStock} {currentItem?.unit}
              </strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Movement Type Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMovementType('in')}
                className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  movementType === 'in'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                Stock In (Inward Receipt)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('out')}
                className={`py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  movementType === 'out'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                Stock Out (Floor Issue)
              </button>
            </div>

            {/* Select Material */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Material / Profile
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.currentStock} {item.unit} in stock)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Quantity to {movementType === 'in' ? 'Receive (+)' : 'Dispatch (-)'} ({currentItem?.unit})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
              />
            </div>

            {/* Reference / Reason */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reference / Job / Supplier Note
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  movementType === 'in'
                    ? 'e.g. PO-8921 Inward shipment from VEKA'
                    : 'e.g. Issued to Villa 401 Sliding Door Cut-List'
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Calculation Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Current Stock on Hand:</span>
                <span className="font-semibold text-slate-800">
                  {currentStock} {currentItem?.unit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Adjustment:</span>
                <span
                  className={`font-bold ${
                    movementType === 'in' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {movementType === 'in' ? '+' : '-'}
                  {quantity} {currentItem?.unit}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-700">Projected Balance:</span>
                <span className="text-base font-extrabold text-slate-900">
                  {resultingStock} {currentItem?.unit}
                </span>
              </div>

              {isNegative && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Warning: Issue exceeds current available stock!</span>
                </div>
              )}
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
                className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                  movementType === 'in'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                }`}
              >
                {movementType === 'in' ? (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    Receive Stock
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Dispatch Stock
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
