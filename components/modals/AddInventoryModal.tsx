'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { addInventoryItem, brands, addBrand } = useStore();

  const [name, setName] = useState('');
  const [specSubtitle, setSpecSubtitle] = useState('');
  const [seriesClassification, setSeriesClassification] = useState('Casement Series');
  const [category, setCategory] = useState<InventoryItem['category']>('Profile');
  const [brandName, setBrandName] = useState(brands[0] || 'VEKA Systems India');
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [newCustomBrand, setNewCustomBrand] = useState('');
  const [unit, setUnit] = useState('m');
  const [currentStock, setCurrentStock] = useState<number>(100);
  const [minStock, setMinStock] = useState<number>(50);
  const [unitPrice, setUnitPrice] = useState<number>(240);
  const [rackLocation, setRackLocation] = useState('Rack A-01');
  const [secondaryStockDetail, setSecondaryStockDetail] = useState('');
  const [iconType, setIconType] = useState<InventoryItem['iconType']>('profile');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const totalValuation = (currentStock || 0) * (unitPrice || 0);

  const handleCreateCustomBrand = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = newCustomBrand.trim();
    if (!trimmed) return;
    addBrand(trimmed);
    setBrandName(trimmed);
    setIsAddingNewBrand(false);
    setNewCustomBrand('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const status: InventoryItem['status'] =
      currentStock === 0 ? 'Out of Stock' : currentStock <= minStock ? 'Low Stock' : 'In Stock';

    const sku = `${brandName.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addInventoryItem({
      sku,
      name: name.trim(),
      specSubtitle: specSubtitle.trim() || undefined,
      category,
      seriesClassification,
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
      brand: (brandName as any) || 'Generic',
      brandName,
      unit,
      stockQty: Number(currentStock),
      reservedQty: 0,
      availableQty: Number(currentStock),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      reorderPoint: Number(minStock),
      unitPrice: Number(unitPrice),
      binLocation: rackLocation.trim() || 'Yard Rack A-01',
      status,
      rackLocation: rackLocation.trim() || undefined,
      secondaryStockDetail: secondaryStockDetail.trim() || undefined,
      iconType,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
      // Reset form
      setName('');
      setSpecSubtitle('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add New Inventory Material</h3>
              <p className="text-xs text-slate-300">Catalog uPVC profiles, reinforcements, hardware & glazing</p>
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
        {successMsg ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Inventory Item Added!</h4>
            <p className="text-sm text-slate-500">
              {name} has been cataloged. Available stock and valuation updated live.
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
                  placeholder="e.g. VEKA 70mm Outer Frame Profile"
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
                  placeholder="e.g. 5-Chamber UV Resistant Multi-Lock Profile"
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
                  onChange={(e) => {
                    setSeriesClassification(e.target.value);
                    if (e.target.value.includes('Hardware')) {
                      setCategory('Hardware');
                      setIconType('hardware');
                      setUnit('pcs');
                    } else if (e.target.value.includes('Glass')) {
                      setCategory('Glass');
                      setIconType('glass');
                      setUnit('sq.m');
                    } else {
                      setCategory('Profile');
                      setIconType('profile');
                      setUnit('m');
                    }
                  }}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Brand / Manufacturer
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewBrand(!isAddingNewBrand)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    {isAddingNewBrand ? 'Select Existing' : '+ Add New Brand'}
                  </button>
                </div>

                {isAddingNewBrand ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter brand name..."
                      value={newCustomBrand}
                      onChange={(e) => setNewCustomBrand(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomBrand}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <select
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unit of Measurement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit of Measure
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                >
                  <option value="m">Meters (m)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="sq.m">Square Meters (sq.m)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="rolls">Rolls</option>
                  <option value="boxes">Boxes</option>
                  <option value="sets">Sets</option>
                </select>
              </div>

              {/* Unit Price */}
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-900"
                />
              </div>

              {/* Opening Stock Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Opening Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-900"
                />
              </div>

              {/* Reorder / Min Stock Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
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
                  placeholder="e.g. Rack B-03 / Yard 1"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Valuation Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Initial Stock Valuation
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ₹{totalValuation.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500">
                  {currentStock} {unit} @ ₹{unitPrice}/{unit}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">Initial Status</span>
                <div className="mt-1">
                  {currentStock === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      Out of Stock
                    </span>
                  ) : currentStock <= minStock ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Low Stock Alert
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Normal Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
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
                <Plus className="w-4 h-4" />
                Add to Stock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
