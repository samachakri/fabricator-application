'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { InventoryItem } from '@/lib/types';
import { X, Plus, CheckCircle2, DollarSign, Box } from 'lucide-react';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { addInventoryItem, brands, addBrand } = useStore();

  const [name, setName] = useState('');
  const [specSubtitle, setSpecSubtitle] = useState('');
  const [seriesClassification, setSeriesClassification] = useState('Casement Series');
  const [brandName, setBrandName] = useState(brands[0] || 'VEKA Systems');
  const [unit, setUnit] = useState('meter');
  const [profileLength, setProfileLength] = useState('20 feet');
  const [profileCount, setProfileCount] = useState<number>(2000);
  const [pricePerProfile, setPricePerProfile] = useState<number>(1200);
  const [minStock, setMinStock] = useState<number>(100);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  // Real-time calculations
  const totalValuation = (profileCount || 0) * (pricePerProfile || 0);

  // Common quick-pick presets
  const seriesPresets = [
    'Casement Series',
    'Sliding Series',
    'Tilt & Turn Series',
    '60mm Outer Frame Series',
    '2.5 Track Sliding Series',
    'Hardware & Fittings',
    'Glass Sheets & Steel',
  ];

  const lengthPresets = ['20 feet', '6.0 meters', '19.5 feet', '21 feet'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmedBrand = brandName.trim() || 'Generic';
    // Automatically register brand if not in store
    if (!brands.some((b) => b.toLowerCase() === trimmedBrand.toLowerCase())) {
      addBrand(trimmedBrand);
    }

    const trimmedSeries = seriesClassification.trim() || 'Casement Series';

    const status: InventoryItem['status'] =
      profileCount === 0 ? 'Out of Stock' : profileCount <= minStock ? 'Low Stock' : 'In Stock';

    const sku = `${trimmedBrand.slice(0, 3).toUpperCase()}-PRF-${Math.floor(100 + Math.random() * 900)}`;

    const category: InventoryItem['category'] = trimmedSeries.toLowerCase().includes('hardware')
      ? 'Hardware'
      : trimmedSeries.toLowerCase().includes('glass')
      ? 'Glass'
      : trimmedSeries.toLowerCase().includes('steel')
      ? 'Steel'
      : 'Profile';

    const iconType: InventoryItem['iconType'] = category === 'Hardware'
      ? 'hardware'
      : category === 'Glass'
      ? 'glass'
      : category === 'Steel'
      ? 'steel'
      : 'profile';

    const secondaryStockDetail = `${profileCount.toLocaleString('en-IN')} Profiles (${profileLength} each)`;

    addInventoryItem({
      sku,
      name: name.trim(),
      specSubtitle: specSubtitle.trim() || undefined,
      category,
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
      brand: trimmedBrand as any,
      brandName: trimmedBrand,
      unit: unit === 'meter' ? 'm' : unit,
      stockQty: Number(profileCount),
      reservedQty: 0,
      availableQty: Number(profileCount),
      currentStock: Number(profileCount),
      minStock: Number(minStock),
      reorderPoint: Number(minStock),
      unitPrice: Number(pricePerProfile),
      binLocation: 'Extrusion Yard Bay 1',
      status,
      secondaryStockDetail,
      iconType,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
      // Reset form defaults
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
              <h3 className="text-lg font-bold">Add Inventory Profiles & Materials</h3>
              <p className="text-xs text-slate-300">Catalog received extrusion profiles, brand pricing & quantity</p>
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
            <h4 className="text-xl font-bold text-slate-900">Inventory Stock Added!</h4>
            <p className="text-sm text-slate-500">
              {profileCount.toLocaleString('en-IN')} profiles of {name} cataloged. Available stock & valuation updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item / Profile Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Item / Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Outer Frame Profile, Sliding Track, Sash Section..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Specification Subtitle */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Specification Subtitle
                </label>
                <input
                  type="text"
                  value={specSubtitle}
                  onChange={(e) => setSpecSubtitle(e.target.value)}
                  placeholder="e.g. 5-Chamber UV Resistant Profile (White RAL 9016)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Brand Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Brand Name *
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name (e.g. VEKA, Kommerling, Prominance)..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />

                  {/* Quick-click registered brand pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Quick picks:</span>
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

              {/* Series Name (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Series Name (Optional)
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={seriesClassification}
                    onChange={(e) => setSeriesClassification(e.target.value)}
                    placeholder="Enter series name or leave blank (e.g. Casement, Sliding)..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />

                  {/* Quick-click suggestion chips */}
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

              {/* Unit of Measurement Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Unit of Measure (Drop-Down) *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-800"
                >
                  <option value="meter">Meter (m)</option>
                  <option value="sq.ft">Square Feet (sq.ft)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="pcs">Pieces / Profiles (pcs)</option>
                </select>
              </div>

              {/* Length / Dimension (Supports both Profile & Glass Measurements) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>Length / Dimension *</span>
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={profileLength}
                    onChange={(e) => setProfileLength(e.target.value)}
                    placeholder="e.g. 20 feet, 6.0m, or Glass 4ft x 6ft, 1200 x 1800 mm..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['20 feet', '6.0 meters', '4ft × 6ft (Glass)', '1200 × 1800 mm'].map((lp) => (
                      <button
                        type="button"
                        key={lp}
                        onClick={() => setProfileLength(lp)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                          profileLength === lp
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={profileCount}
                    onChange={(e) => setProfileCount(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full pl-3.5 pr-16 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-900"
                  />
                  <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-secondary select-none">
                    Qty
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  e.g. <strong>{profileCount.toLocaleString('en-IN')}</strong> units of {profileLength}
                </p>
              </div>

              {/* Price for Each */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>Price for Each (₹) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={pricePerProfile}
                    onChange={(e) => setPricePerProfile(Number(e.target.value))}
                    placeholder="e.g. 1160"
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cost per unit: <strong>₹{pricePerProfile.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              {/* Low Stock Threshold */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                  <span>Low Stock Alert Threshold (Profiles)</span>
                  <span className="text-[11px] text-amber-700 font-medium">
                    "Reorder" button appears when stock falls to or below this level
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>
            </div>

            {/* Live Valuation & Summary Card */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Calculated Batch Stock Valuation
                </span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{totalValuation.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-600 font-secondary mt-0.5">
                  {profileCount.toLocaleString('en-IN')} Profiles ({profileLength} each) @ ₹
                  {pricePerProfile.toLocaleString('en-IN')} / profile ({unit})
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Initial Stock Status
                </span>
                <div className="mt-1">
                  {profileCount === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Out of Stock
                    </span>
                  ) : profileCount <= minStock ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Low Stock (Reorder Visible)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      In Stock (Healthy)
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
                <span>Add Item to Stock</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

