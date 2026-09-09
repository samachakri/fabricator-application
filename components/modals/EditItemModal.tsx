'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, Edit3, Trash2, CheckCircle2, Tag, Layers } from 'lucide-react';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const { updateInventoryItem, deleteInventoryItem, brands, addBrand } = useStore();

  const [name, setName] = useState('');
  const [specSubtitle, setSpecSubtitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [seriesClassification, setSeriesClassification] = useState('');
  const [unit, setUnit] = useState('m');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [secondaryStockDetail, setSecondaryStockDetail] = useState('');
  const [success, setSuccess] = useState(false);

  const seriesPresets = [
    'Casement Series',
    'Sliding Series',
    'Tilt & Turn Series',
    '60mm Outer Frame Series',
    '2.5 Track Sliding Series',
    'Hardware & Fittings',
    'Glass Sheets & Steel',
  ];

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setSpecSubtitle(item.specSubtitle || '');
      setBrandName(item.brandName || 'Generic');
      setSeriesClassification(item.seriesClassification || 'Casement Series');
      setUnit(item.unit || 'm');
      setUnitPrice(item.unitPrice || 0);
      setCurrentStock(item.currentStock || 0);
      setMinStock(item.minStock || 0);
      setSecondaryStockDetail(item.secondaryStockDetail || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const totalValuation = currentStock * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedBrand = brandName.trim() || 'Generic';
    if (!brands.some((b) => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      addBrand(trimmedBrand);
    }

    const trimmedSeries = seriesClassification.trim() || 'Casement Series';

    const status: InventoryItem['status'] =
      currentStock === 0 ? 'Out of Stock' : currentStock <= minStock ? 'Low Stock' : 'In Stock';

    updateInventoryItem(item.id, {
      name: name.trim(),
      specSubtitle: specSubtitle.trim() || undefined,
      brandName: trimmedBrand,
      brand: trimmedBrand as any,
      seriesClassification: trimmedSeries,
      seriesCategory: trimmedSeries.toLowerCase().includes('casement')
        ? 'casement'
        : trimmedSeries.toLowerCase().includes('sliding')
        ? 'sliding'
        : trimmedSeries.toLowerCase().includes('tilt')
        ? 'tilt_turn'
        : trimmedSeries.toLowerCase().includes('hardware')
        ? 'hardware'
        : trimmedSeries.toLowerCase().includes('glass') || trimmedSeries.toLowerCase().includes('steel')
        ? 'glass_steel'
        : 'other',
      unit: unit === 'meter' ? 'm' : unit,
      unitPrice: Number(unitPrice),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      secondaryStockDetail: secondaryStockDetail.trim() || undefined,
      status,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${item.name} from inventory?`)) {
      deleteInventoryItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Edit Material & Pricing</h3>
              <p className="text-xs text-slate-300">
                Item ID: <span className="font-mono text-indigo-300">{item.id}</span>
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
            <h4 className="text-lg font-bold text-slate-900">Changes Saved!</h4>
            <p className="text-sm text-slate-500">
              Inventory pricing, threshold, and specs have been updated across the system.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Material Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Item / Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Subtitle / Spec */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Specification Subtitle
                </label>
                <input
                  type="text"
                  value={specSubtitle}
                  onChange={(e) => setSpecSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Brand Name *</span>
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    list="edit-brand-suggestions"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                  <datalist id="edit-brand-suggestions">
                    {brands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                    {brands.slice(0, 4).map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBrandName(b)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                          brandName === b
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Series Classification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Series Name (Optional)</span>
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    list="edit-series-suggestions"
                    value={seriesClassification}
                    onChange={(e) => setSeriesClassification(e.target.value)}
                    placeholder="Enter series name or leave blank (Optional)..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                  <datalist id="edit-series-suggestions">
                    {seriesPresets.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                    {seriesPresets.slice(0, 3).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSeriesClassification(s)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                          seriesClassification === s
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unit Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit of Measure (Drop-Down) *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                >
                  <option value="m">Meter (m)</option>
                  <option value="sq.ft">Square Feet (sq.ft)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="pcs">Pieces / Profiles (pcs)</option>
                </select>
              </div>

              {/* Price for Each */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Price for Each (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-900"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>Quantity *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Adding stock above minimum threshold clears Low Stock and hides Reorder button.
                </p>
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Min Stock (Low Stock Alert Threshold) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Length / Dimension */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Length / Dimension (e.g. 20 feet, 6.0m, or Glass 4ft x 6ft)
                </label>
                <input
                  type="text"
                  value={secondaryStockDetail}
                  onChange={(e) => setSecondaryStockDetail(e.target.value)}
                  placeholder="e.g. 20 feet, 6.0m, or Glass 4ft x 6ft, 1200 x 1800 mm..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Valuation Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Valuation for this Item
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ₹{totalValuation.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500">
                  {currentStock} {unit} @ ₹{unitPrice}/{unit}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  {currentStock <= minStock ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      In Stock
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Item
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
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
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

