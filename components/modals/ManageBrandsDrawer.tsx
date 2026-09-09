'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  Plus,
  Tag,
  Edit2,
  Check,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ManageBrandsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageBrandsDrawer({ isOpen, onClose }: ManageBrandsDrawerProps) {
  const { brands, addBrand, updateBrand, deleteBrand, inventory } = useStore();

  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2500);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrandName.trim();
    if (!trimmed) return;

    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`Brand "${trimmed}" already exists in directory.`);
      return;
    }

    addBrand(trimmed);
    setNewBrandName('');
    showNotification(`Brand "${trimmed}" successfully added!`);
  };

  const handleStartEdit = (brand: string) => {
    setEditingBrand(brand);
    setEditBrandName(brand);
  };

  const handleSaveEdit = (oldBrand: string) => {
    const trimmed = editBrandName.trim();
    if (!trimmed) {
      setEditingBrand(null);
      return;
    }

    if (trimmed !== oldBrand) {
      updateBrand(oldBrand, trimmed);
      showNotification(`Updated brand name to "${trimmed}". All associated inventory items updated!`);
    }
    setEditingBrand(null);
  };

  const handleDelete = (brand: string) => {
    const itemsCount = inventory.filter(
      (i) => i.brandName === brand || i.brand === brand
    ).length;

    if (itemsCount > 0) {
      if (
        !confirm(
          `Warning: ${itemsCount} inventory item(s) are currently categorized under "${brand}". Deleting this brand will remove it from future selections. Proceed?`
        )
      ) {
        return;
      }
    }

    deleteBrand(brand);
    showNotification(`Brand "${brand}" removed from directory.`);
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Side Pop-Up View Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Brand & Supplier Directory
              </h2>
              <p className="text-xs text-slate-300 font-secondary">
                Edit brand names or register new profiles & hardware
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

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Add New Brand Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider font-secondary">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Register New Brand Name</span>
            </div>
            <form onSubmit={handleAddBrand} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Schüco, Alumil, Dorma, Jindal"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Search Brands Filter */}
          <div>
            <input
              type="text"
              placeholder="Search existing brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-secondary"
            />
          </div>

          {/* Brands List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-secondary px-1">
              <span>ACTIVE BRANDS ({filteredBrands.length})</span>
              <span>INVENTORY ITEMS</span>
            </div>

            {filteredBrands.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No brand matches "{searchQuery}"
              </div>
            ) : (
              filteredBrands.map((brand) => {
                const isEditing = editingBrand === brand;
                const matchingItems = inventory.filter(
                  (i) => i.brandName === brand || i.brand === brand
                );
                const totalStockVal = matchingItems.reduce(
                  (sum, item) => sum + item.currentStock * item.unitPrice,
                  0
                );

                return (
                  <div
                    key={brand}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-2xs group"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editBrandName}
                          onChange={(e) => setEditBrandName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-bold text-slate-900 border border-indigo-500 rounded-lg focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(brand)}
                          title="Save change"
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingBrand(null)}
                          title="Cancel"
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        {/* Brand Name & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                            {brand.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {brand}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-secondary mt-0.5">
                              {matchingItems.length === 1
                                ? '1 item cataloged'
                                : `${matchingItems.length} items cataloged`}
                              {totalStockVal > 0 && ` • ₹${totalStockVal.toLocaleString('en-IN')}`}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons (Edit & Delete) */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(brand)}
                            title="Edit / Rename brand"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(brand)}
                            title="Delete brand"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-secondary shrink-0">
          <span>{brands.length} Brands in Catalog</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
