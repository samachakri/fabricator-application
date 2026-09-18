'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export type DraggableItemType =
  | 'shape_rect_1'
  | 'shape_rect_2'
  | 'shape_rect_3'
  | 'shape_arch_round'
  | 'shape_arch_gothic'
  | 'shape_circle'
  | 'mullion_vertical'
  | 'transom_horizontal'
  | 'sash_sliding_left'
  | 'sash_sliding_right'
  | 'sash_casement_left'
  | 'sash_casement_right'
  | 'sash_top_hung'
  | 'sash_tilt_turn'
  | 'sash_louver'
  | 'sash_fixed'
  | 'mesh_bug';

export interface PaletteItem {
  id: DraggableItemType;
  name: string;
  category: 'shapes' | 'divisions' | 'sashes';
  iconSvg: React.ReactNode;
  description: string;
}

// Reality-used icons matching WinQuoter CAD software (icon-only presentation)
const PALETTE_ITEMS: PaletteItem[] = [
  // 1. Base Shapes & Openings
  {
    id: 'shape_rect_1',
    name: '1-Panel Window',
    category: 'shapes',
    description: 'Single outer frame opening',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="3" y="3" width="22" height="22" rx="1.5" />
        <rect x="6" y="6" width="16" height="16" strokeDasharray="2 2" className="opacity-60" />
      </svg>
    ),
  },
  {
    id: 'shape_rect_2',
    name: '2-Panel Window',
    category: 'shapes',
    description: '2-Panel sliding / casement frame',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="3" y="3" width="22" height="22" rx="1.5" />
        <line x1="14" y1="3" x2="14" y2="25" />
        <rect x="5.5" y="5.5" width="6.5" height="17" />
        <rect x="16" y="5.5" width="6.5" height="17" />
      </svg>
    ),
  },
  {
    id: 'shape_rect_3',
    name: '3-Panel Window',
    category: 'shapes',
    description: '3-Panel multi-track frame',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="2" y="4" width="24" height="20" rx="1.5" />
        <line x1="10" y1="4" x2="10" y2="24" />
        <line x1="18" y1="4" x2="18" y2="24" />
      </svg>
    ),
  },
  {
    id: 'shape_arch_round',
    name: 'Round Arch Window / Head',
    category: 'shapes',
    description: 'Semi-circular arch window or arch top head',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <path d="M4 23 V14 A10 10 0 0 1 24 14 V23 Z" />
        <line x1="14" y1="23" x2="14" y2="4" strokeDasharray="2 1" className="opacity-70" />
        <line x1="14" y1="23" x2="7" y2="9" strokeDasharray="2 1" className="opacity-70" />
        <line x1="14" y1="23" x2="21" y2="9" strokeDasharray="2 1" className="opacity-70" />
      </svg>
    ),
  },
  {
    id: 'shape_arch_gothic',
    name: 'Gothic Pointed Arch',
    category: 'shapes',
    description: 'Pointed gothic architectural arch',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <path d="M4 24 V13 Q4 4 14 2 Q24 4 24 13 V24 Z" />
        <line x1="14" y1="24" x2="14" y2="2" strokeDasharray="2 1" className="opacity-70" />
      </svg>
    ),
  },
  {
    id: 'shape_circle',
    name: 'Circular Bullseye Window',
    category: 'shapes',
    description: 'Fixed circular round window',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <circle cx="14" cy="14" r="10" />
        <line x1="14" y1="4" x2="14" y2="24" strokeDasharray="2 1" className="opacity-70" />
        <line x1="4" y1="14" x2="24" y2="14" strokeDasharray="2 1" className="opacity-70" />
      </svg>
    ),
  },

  // 2. Structural Divisions (Mullions & Transoms)
  {
    id: 'mullion_vertical',
    name: 'Vertical Mullion',
    category: 'divisions',
    description: 'Split section vertically',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" strokeDasharray="2 2" />
        <rect x="12" y="3" width="4" height="22" className="fill-indigo-500/30 stroke-indigo-600" />
      </svg>
    ),
  },
  {
    id: 'transom_horizontal',
    name: 'Horizontal Transom',
    category: 'divisions',
    description: 'Split section horizontally (Transom bar)',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" strokeDasharray="2 2" />
        <rect x="4" y="10" width="20" height="4" className="fill-indigo-500/30 stroke-indigo-600" />
      </svg>
    ),
  },

  // 3. Operational Sashes & Functional Units (Reality-used in WinQuoter)
  {
    id: 'sash_fixed',
    name: 'Fixed Glass',
    category: 'sashes',
    description: 'Direct glazed picture glass',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <line x1="4" y1="3" x2="24" y2="25" strokeDasharray="2 2" className="opacity-40" />
        <line x1="24" y1="3" x2="4" y2="25" strokeDasharray="2 2" className="opacity-40" />
      </svg>
    ),
  },
  {
    id: 'sash_sliding_left',
    name: 'Sliding (Left ◄)',
    category: 'sashes',
    description: 'Horizontal sliding sash moving left',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <path d="M17 14 H9 M12 11 L9 14 L12 17" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="7" x2="21" y2="21" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'sash_sliding_right',
    name: 'Sliding (Right ►)',
    category: 'sashes',
    description: 'Horizontal sliding sash moving right',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <path d="M11 14 H19 M16 11 L19 14 L16 17" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="7" y1="7" x2="7" y2="21" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'sash_casement_left',
    name: 'Casement (Left ◄)',
    category: 'sashes',
    description: 'Side-hung casement hinged on left',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <polyline points="4,3 24,14 4,25" strokeDasharray="2 2" />
        <circle cx="21" cy="14" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    id: 'sash_casement_right',
    name: 'Casement (Right ►)',
    category: 'sashes',
    description: 'Side-hung casement hinged on right',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <polyline points="24,3 4,14 24,25" strokeDasharray="2 2" />
        <circle cx="7" cy="14" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    id: 'sash_top_hung',
    name: 'Top Hung / Awning',
    category: 'sashes',
    description: 'Top-hinged awning sash opening outward',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <polyline points="4,3 14,25 24,3" strokeDasharray="2 2" />
        <circle cx="14" cy="22" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    id: 'sash_tilt_turn',
    name: 'Tilt & Turn',
    category: 'sashes',
    description: 'Dual-action tilt top and side swing',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <polyline points="4,25 14,3 24,25" strokeDasharray="2 2" />
        <polyline points="4,3 24,14 4,25" strokeDasharray="1.5 1.5" className="opacity-50" />
      </svg>
    ),
  },
  {
    id: 'sash_louver',
    name: 'Louver Blades',
    category: 'sashes',
    description: 'Horizontal ventilation louver slats',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <line x1="6" y1="7" x2="22" y2="7" />
        <line x1="6" y1="11" x2="22" y2="11" />
        <line x1="6" y1="15" x2="22" y2="15" />
        <line x1="6" y1="19" x2="22" y2="19" />
        <line x1="6" y1="23" x2="22" y2="23" />
      </svg>
    ),
  },
  {
    id: 'mesh_bug',
    name: 'Bug Mesh (SS304)',
    category: 'sashes',
    description: 'Stainless steel insect screen mesh',
    iconSvg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="20" height="22" rx="1.5" />
        <line x1="9" y1="3" x2="9" y2="25" strokeDasharray="1.5 1.5" />
        <line x1="14" y1="3" x2="14" y2="25" strokeDasharray="1.5 1.5" />
        <line x1="19" y1="3" x2="19" y2="25" strokeDasharray="1.5 1.5" />
        <line x1="4" y1="8" x2="24" y2="8" strokeDasharray="1.5 1.5" />
        <line x1="4" y1="14" x2="24" y2="14" strokeDasharray="1.5 1.5" />
        <line x1="4" y1="20" x2="24" y2="20" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
];

interface DraggableShapePaletteProps {
  onSelectItem: (item: PaletteItem) => void;
  onOpenCatalog: () => void;
  onOpenQuote?: () => void;
  activeTool?: string;
  onSelectTool?: (tool: string) => void;
}

export const DraggableShapePalette: React.FC<DraggableShapePaletteProps> = ({
  onSelectItem,
  onOpenCatalog,
  onOpenQuote,
  activeTool = 'select',
  onSelectTool,
}) => {
  const [isSubPaletteOpen, setIsSubPaletteOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'draw' | 'quote'>('draw');
  const [draggedItem, setDraggedItem] = useState<DraggableItemType | null>(null);

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    setDraggedItem(item.id);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Quick primary items for the outer strip
  const outerStripTools: Array<{ id: string; label: string; action: () => void; icon: React.ReactNode }> = [
    {
      id: 'catalog',
      label: 'Templates',
      action: onOpenCatalog,
      icon: (
        <span className="font-black text-blue-600 text-base leading-none">•••</span>
      ),
    },
    {
      id: 'rect1',
      label: '1-Panel Window',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_rect_1');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <rect x="3" y="3" width="18" height="18" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'rect2',
      label: '2-Panel Sliding',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_rect_2');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <rect x="3" y="3" width="18" height="18" rx="1.5" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'rect3',
      label: '3-Panel Multi-Track',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_rect_3');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <rect x="2" y="3" width="20" height="18" rx="1.5" />
          <line x1="8.6" y1="3" x2="8.6" y2="21" />
          <line x1="15.3" y1="3" x2="15.3" y2="21" />
        </svg>
      ),
    },
    {
      id: 'mullion',
      label: 'Vertical Mullion',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'mullion_vertical');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <rect x="3" y="3" width="18" height="18" rx="1.5" strokeDasharray="2 2" />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth="3" />
        </svg>
      ),
    },
    {
      id: 'transom',
      label: 'Horizontal Transom',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'transom_horizontal');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <rect x="3" y="3" width="18" height="18" rx="1.5" strokeDasharray="2 2" />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="3" />
        </svg>
      ),
    },
    {
      id: 'arch',
      label: 'Arch Window / Head',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_arch_round');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-purple-600 fill-none stroke-[2]">
          <path d="M4 21 V12 A8 8 0 0 1 20 12 V21 Z" />
        </svg>
      ),
    },
    {
      id: 'gothic',
      label: 'Gothic Pointed Arch',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_arch_gothic');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-purple-600 fill-none stroke-[2]">
          <path d="M4 21 V12 Q4 3 12 2 Q20 3 20 12 V21 Z" />
        </svg>
      ),
    },
    {
      id: 'circle',
      label: 'Circular Bullseye',
      action: () => {
        const item = PALETTE_ITEMS.find((p) => p.id === 'shape_circle');
        if (item) onSelectItem(item);
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-700 fill-none stroke-[2]">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 1" />
          <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative z-20 flex h-full select-none shrink-0 font-sans shadow-md border-r border-slate-200">
      {/* 1. TIER 1: OUTER NARROW TOOL STRIP (Matching WindoorCraft wc_07_shape1.png) */}
      <div className="w-12 bg-white border-r border-slate-200 flex flex-col justify-between items-center py-2 shrink-0">
        {/* Top Tools */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {outerStripTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={tool.action}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Bottom-Left Vertical Tabs: 'quote' and 'draw' (Exact WindoorCraft styling) */}
        <div className="flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab('quote');
              if (onOpenQuote) onOpenQuote();
            }}
            className="w-7 py-2.5 rounded-r bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all flex flex-col items-center justify-center cursor-pointer"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            title="Open Cost & Cutting List Quotation"
          >
            quote
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`w-7 py-3 rounded-r text-[11px] font-bold shadow-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
              activeTab === 'draw'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            title="Active 2D CAD Design Canvas"
          >
            draw
          </button>
        </div>
      </div>

      {/* 2. TIER 2: SECONDARY SHAPE PALETTE (Collapsible with '<' chevron toggle) */}
      {isSubPaletteOpen && (
        <div className="w-28 sm:w-32 bg-[#fafafa] flex flex-col border-r border-slate-200 transition-all duration-150 overflow-hidden">
          {/* Header with '<' Collapse chevron */}
          <div className="h-9 px-2 border-b border-slate-200 flex items-center justify-between bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Shapes
            </span>
            <button
              type="button"
              onClick={() => setIsSubPaletteOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Secondary Palette"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shape Palette Grid (Icon-only) */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {PALETTE_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectItem(item)}
                  className={`group relative flex items-center justify-center w-11 h-11 mx-auto rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs cursor-grab active:cursor-grabbing transition-all text-slate-700 hover:text-blue-600 ${
                    draggedItem === item.id ? 'opacity-40 ring-2 ring-blue-500' : ''
                  }`}
                  title={`${item.name} — ${item.description} (Drag or Click to Apply)`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    {item.iconSvg}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expand button if collapsed */}
      {!isSubPaletteOpen && (
        <div className="w-4 bg-slate-100 hover:bg-slate-200 border-r border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
             onClick={() => setIsSubPaletteOpen(true)}
             title="Expand Shapes Palette">
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </div>
      )}
    </div>
  );
};

