'use client';

import React, { useState } from 'react';
import { X, FolderOpen, Plus, Sparkles, Check, Palette, Box } from 'lucide-react';

interface DesignWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseCatalog: () => void;
  onStartNew: (defaults: { glass: string; color: string }) => void;
}

export const DesignWelcomeModal: React.FC<DesignWelcomeModalProps> = ({
  isOpen,
  onClose,
  onBrowseCatalog,
  onStartNew,
}) => {
  const [selectedGlass, setSelectedGlass] = useState('5mm Clear Toughened');
  const [selectedColor, setSelectedColor] = useState('pure_white');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Set Default Specifications</h3>
              <p className="text-xs text-slate-300">
                Choose base profile finish & glazing, then pick how you wish to design
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Defaults Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            {/* Glass Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Glazing Specification
              </label>
              <select
                value={selectedGlass}
                onChange={(e) => setSelectedGlass(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="5mm Clear Toughened">5 MM CLEAR TOUGHENED GLASS</option>
                <option value="6mm Clear Float">6 MM CLEAR FLOAT GLASS</option>
                <option value="5+12A+5 Double Glazed">5 + 12A + 5 MM DOUBLE GLAZED IGU</option>
                <option value="6+16A+6 Low-E Acoustic">6 + 16A + 6 MM LOW-E ACOUSTIC DGU</option>
                <option value="5mm Frosted Privacy">5 MM FROSTED / OBSCURE PRIVACY GLASS</option>
              </select>
            </div>

            {/* Profile Finish */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Profile Finish / Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="pure_white">Pure White uPVC (RAL 9016)</option>
                <option value="anthracite">Anthracite Grey (RAL 7016)</option>
                <option value="golden_oak">Golden Oak Woodgrain Foil</option>
                <option value="dark_oak">Dark Walnut Woodgrain Foil</option>
                <option value="bronze">Anodized Bronze Aluminium</option>
                <option value="black">Matt Black Architectural Powdercoat</option>
              </select>
            </div>
          </div>

          {/* Two Big Entry Choice Cards matching Reference Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Card 1: Browse Catalog */}
            <div className="group border-2 border-slate-200 hover:border-indigo-600 rounded-2xl p-5 bg-white hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer text-center">
              <div>
                <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Select designs from catalog
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Start from a rich library of pre-engineered sliding, casement, French, and villa window templates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseCatalog();
                }}
                className="mt-5 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse from Catalog</span>
              </button>
            </div>

            {/* Card 2: Start from New */}
            <div className="group border-2 border-slate-200 hover:border-indigo-600 rounded-2xl p-5 bg-white hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer text-center">
              <div>
                <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Box className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Start from new opening
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Build custom opening from scratch with draggable profiles, mullions, transoms, and exact measurements.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onStartNew({ glass: selectedGlass, color: selectedColor });
                  onClose();
                }}
                className="mt-5 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Opening</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
