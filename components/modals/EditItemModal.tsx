'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const { updateInventoryItem, deleteInventoryItem } = useStore();

  const [name, setName] = useState('');
  const [specSubtitle, setSpecSubtitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [seriesClassification, setSeriesClassification] = useState('');
  const [unit, setUnit] = useState('m');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [rackLocation, setRackLocation] = useState('');
  const [secondaryStockDetail, setSecondaryStockDetail] = useState('');
  const [success, setSuccess] = useState(false);

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
      setRackLocation(item.rackLocation || '');
      setSecondaryStockDetail(item.secondaryStockDetail || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const totalValuation = currentStock * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const status: InventoryItem['status'] =
      currentStock === 0 ? 'Out of Stock' : currentStock <= minStock ? 'Low Stock' : 'In Stock';

    updateInventoryItem(item.id, {
      name: name.trim(),
      specSubtitle: specSubtitle.trim() || undefined,
      brandName: brandName.trim() || undefined,
      seriesClassification: seriesClassification.trim() || undefined,
      seriesCategory: seriesClassification.toLowerCase().includes('casement')
        ? 'casement'
        : seriesClassification.toLowerCase().includes('sliding')
        ? 'sliding'
        : seriesClassification.toLowerCase().includes('tilt')
        ? 'tilt_turn'
        : seriesClassification.toLowerCase().includes('hardware')
        ? 'hardware'
        : seriesClassification.toLowerCase().includes('glass')
        ? 'glass_steel'
        : 'other',
      unit,
      unitPrice: Number(unitPrice),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      rackLocation: rackLocation.trim() || undefined,
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

              {/* Series Classification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Series Classification
                </label>
                <select
                  value={seriesClassification}
                  onChange={(e) => setSeriesClassification(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                >
                  <option value="Casement Series">Casement Series</option>
                  <option value="Sliding Series">Sliding Series</option>
                  <option value="Tilt & Turn Series">Tilt & Turn Series</option>
                  <option value="Hardware & Fittings">Hardware & Fittings</option>
                  <option value="Glass Sheets & Steel">Glass Sheets & Steel</option>
                  <option value="Gaskets & Consumables">Gaskets & Consumables</option>
                </select>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Brand / Manufacturer
                </label>
                <select
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                >
                  <option value="VEKA">VEKA</option>
                  <option value="Kommerling">Kommerling</option>
                  <option value="Rehau">Rehau</option>
                  <option value="Aluplast">Aluplast</option>
                  <option value="Prominance">Prominance</option>
                  <option value="Saint-Gobain">Saint-Gobain</option>
                  <option value="Dorma">Dorma</option>
                  <option value="Jindal">Jindal</option>
                  <option value="Generic">Generic / OEM</option>
                </select>
              </div>

              {/* Unit Purchase Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit Purchase Price (₹) *
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

              {/* Unit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Current Stock On Hand
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
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Min Stock (Reorder Threshold)
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

              {/* Secondary Stock Detail */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Secondary Detail / Conversion
                </label>
                <input
                  type="text"
                  value={secondaryStockDetail}
                  onChange={(e) => setSecondaryStockDetail(e.target.value)}
                  placeholder="e.g. 50 Bars (6.0m each)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Rack Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Rack / Bay Location
                </label>
                <input
                  type="text"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                  placeholder="e.g. Rack B-03"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Valuation Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
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
              <div>
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
