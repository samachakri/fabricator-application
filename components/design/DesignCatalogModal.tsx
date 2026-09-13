'use client';

import React, { useState } from 'react';
import { X, Search, Check, Sparkles, Filter, Box } from 'lucide-react';
import { ParametricWindowDesign } from '@/lib/design/types';

export interface CatalogTemplate {
  id: string;
  name: string;
  series: 'Sliding' | 'Casement' | 'Tilt & Turn' | 'Special / Folding';
  systemName: string;
  dimensions: { width: number; height: number };
  panels: number;
  glassSpec: string;
  description: string;
  previewSvg: React.ReactNode;
  tags: string[];
}

export const CATALOG_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'tpl-sliding-2t2p',
    name: 'Sliding 2-Track 2-Panel (2T-2P)',
    series: 'Sliding',
    systemName: 'Kommerling 88BS / VEKA 70',
    dimensions: { width: 1500, height: 1500 },
    panels: 2,
    glassSpec: '5mm Clear Toughened',
    description: 'Standard residential 2-track sliding window with interlock sealing.',
    tags: ['Popular', 'Living Room', 'Bedroom'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="10" y="10" width="80" height="60" rx="2" className="fill-slate-100" />
        <line x1="50" y1="10" x2="50" y2="70" />
        <rect x="15" y="15" width="32" height="50" className="fill-sky-100/60 stroke-slate-800" />
        <rect x="53" y="15" width="32" height="50" className="fill-sky-100/60 stroke-slate-800" />
        <path d="M26 40 H36 M32 36 L36 40 L32 44" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M74 40 H64 M68 36 L64 40 L68 44" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'tpl-sliding-25t',
    name: 'Sliding 2.5-Track with SS Bug Mesh',
    series: 'Sliding',
    systemName: 'Prominance Optima 80',
    dimensions: { width: 1800, height: 1500 },
    panels: 3,
    glassSpec: '6mm Clear + SS304 Mesh',
    description: '2 Glass sliding sashes + dedicated outer track with stainless steel mosquito screen.',
    tags: ['Mosquito Mesh', 'Eco Friendly'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="10" y="10" width="80" height="60" rx="2" className="fill-slate-100" />
        <line x1="38" y1="10" x2="38" y2="70" />
        <line x1="64" y1="10" x2="64" y2="70" />
        <rect x="13" y="14" width="22" height="52" className="fill-sky-100/60" />
        <rect x="41" y="14" width="20" height="52" className="fill-sky-100/60" />
        <rect x="67" y="14" width="20" height="52" strokeDasharray="2 2" className="fill-emerald-50/50" />
      </svg>
    ),
  },
  {
    id: 'tpl-sliding-3t3p',
    name: 'Sliding 3-Track 3-Panel (3T-3P)',
    series: 'Sliding',
    systemName: 'Schüco ASS 50 / VEKA 82',
    dimensions: { width: 2400, height: 1500 },
    panels: 3,
    glassSpec: '6mm Clear Toughened',
    description: 'Wide panoramic aperture with 3 independent rolling tracks.',
    tags: ['Balcony', 'Wide Opening'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="10" y="10" width="80" height="60" rx="2" className="fill-slate-100" />
        <line x1="36" y1="10" x2="36" y2="70" />
        <line x1="63" y1="10" x2="63" y2="70" />
        <rect x="13" y="14" width="20" height="52" className="fill-sky-100/60" />
        <rect x="39" y="14" width="21" height="52" className="fill-sky-100/60" />
        <rect x="66" y="14" width="21" height="52" className="fill-sky-100/60" />
      </svg>
    ),
  },
  {
    id: 'tpl-bifold-4p',
    name: '4-Panel Bi-Fold Accordion System',
    series: 'Special / Folding',
    systemName: 'Schüco ASS 70.FD / Aluplast',
    dimensions: { width: 1925, height: 2843 },
    panels: 4,
    glassSpec: '5+12A+5 Double Glazed IGU',
    description: 'Modern 4-panel bi-fold folding system matching high-end architectural villa specifications.',
    tags: ['Villa Door', 'Bi-Fold', 'Architectural'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="10" y="5" width="80" height="70" rx="2" className="fill-slate-100" />
        <line x1="30" y1="5" x2="30" y2="75" />
        <line x1="50" y1="5" x2="50" y2="75" />
        <line x1="70" y1="5" x2="70" y2="75" />
        <rect x="13" y="8" width="14" height="64" className="fill-cyan-100/50" />
        <rect x="33" y="8" width="14" height="64" className="fill-cyan-100/50" />
        <rect x="53" y="8" width="14" height="64" className="fill-cyan-100/50" />
        <rect x="73" y="8" width="14" height="64" className="fill-cyan-100/50" />
        {/* Kinematic fold markers */}
        <polyline points="20,78 30,76 40,78" stroke="#1B64F2" strokeWidth="1.5" />
        <polyline points="60,78 70,76 80,78" stroke="#1B64F2" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'tpl-french-casement',
    name: 'French Window 2-Sash with Transom',
    series: 'Casement',
    systemName: 'Kommerling 76AD / Prominance',
    dimensions: { width: 1200, height: 1800 },
    panels: 2,
    glassSpec: '5mm Clear Float Glass',
    description: 'Double casement French window with top fixed transom for natural illumination.',
    tags: ['Master Bed', 'French Window'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="15" y="8" width="70" height="64" rx="2" className="fill-slate-100" />
        <line x1="15" y1="28" x2="85" y2="28" />
        <line x1="50" y1="28" x2="50" y2="72" />
        <rect x="18" y="32" width="29" height="37" className="fill-sky-100/60" />
        <rect x="53" y="32" width="29" height="37" className="fill-sky-100/60" />
        <path d="M18 32 L47 50.5 L18 69" strokeDasharray="1.5 1.5" stroke="#1B64F2" />
        <path d="M82 32 L53 50.5 L82 69" strokeDasharray="1.5 1.5" stroke="#1B64F2" />
      </svg>
    ),
  },
  {
    id: 'tpl-tilt-turn',
    name: 'Tilt & Turn Villa Window',
    series: 'Tilt & Turn',
    systemName: 'VEKA Softline 82 / Roto Hardware',
    dimensions: { width: 1000, height: 1400 },
    panels: 1,
    glassSpec: '6+16A+6 Low-E Acoustic Double Glass',
    description: 'Dual-action German engineered opening: tilt inwards for ventilation or turn for full cleaning.',
    tags: ['Acoustic', 'Premium', 'Security'],
    previewSvg: (
      <svg viewBox="0 0 100 80" className="w-full h-full stroke-slate-700 fill-none stroke-[2]">
        <rect x="20" y="8" width="60" height="64" rx="2" className="fill-slate-100" />
        <rect x="26" y="14" width="48" height="52" className="fill-sky-100/60" />
        <path d="M26 66 L50 14 L74 66" strokeDasharray="2 2" stroke="#1B64F2" />
        <path d="M26 14 L74 40 L26 66" strokeDasharray="1 1" stroke="#f59e0b" />
      </svg>
    ),
  },
];

interface DesignCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CatalogTemplate) => void;
}

export const DesignCatalogModal: React.FC<DesignCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [activeSeries, setActiveSeries] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = CATALOG_TEMPLATES.filter((tpl) => {
    if (activeSeries !== 'All' && tpl.series !== activeSeries) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.systemName.toLowerCase().includes(q) ||
        tpl.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Design Catalog Library</h3>
              <p className="text-xs text-slate-300">
                Select pre-engineered uPVC & aluminium window & door templates
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

        {/* Filter Bar */}
        <div className="shrink-0 p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Series Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Sliding', 'Casement', 'Tilt & Turn', 'Special / Folding'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveSeries(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeSeries === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search designs, series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="group border border-slate-200 hover:border-indigo-500 rounded-2xl p-4 bg-white hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Preview */}
                <div className="w-full h-36 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-3 mb-3 group-hover:bg-indigo-50/20 transition-colors">
                  {tpl.previewSvg}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {tpl.series}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                    {tpl.dimensions.width} × {tpl.dimensions.height} mm
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tpl.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">{tpl.systemName}</span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} templates available in catalog</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
