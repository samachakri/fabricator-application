'use client';

import React, { useState } from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Layers,
  FolderOpen,
} from 'lucide-react';

export type DraggableItemType =
  | 'shape_rect_1'
  | 'shape_rect_2'
  | 'shape_rect_3'
  | 'shape_rect_4'
  | 'shape_arch_round'
  | 'shape_arch_gothic'
  | 'shape_circle'
  | 'shape_triangle'
  | 'shape_trapezoid'
  | 'shape_bay_90'
  | 'mullion_vertical'
  | 'transom_horizontal'
  | 'sash_sliding_left'
  | 'sash_sliding_right'
  | 'sash_casement_left'
  | 'sash_casement_right'
  | 'sash_tilt_turn'
  | 'sash_fixed'
  | 'mesh_bug';

export interface PaletteItem {
  id: DraggableItemType;
  name: string;
  category: 'shapes' | 'divisions' | 'sashes' | 'arch';
  iconSvg: React.ReactNode;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // 1. Standard Rectangular Openings
  {
    id: 'shape_rect_1',
    name: '1-Panel Frame',
    category: 'shapes',
    description: 'Single outer frame opening',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="3" y="3" width="18" height="18" rx="1.5" />
        <rect x="5.5" y="5.5" width="13" height="13" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    id: 'shape_rect_2',
    name: '2-Panel 2-Track',
    category: 'shapes',
    description: '2-Panel sliding / casement frame',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="3" y="3" width="18" height="18" rx="1.5" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <rect x="5" y="5" width="5.5" height="14" />
        <rect x="13.5" y="5" width="5.5" height="14" />
      </svg>
    ),
  },
  {
    id: 'shape_rect_3',
    name: '3-Panel 3-Track',
    category: 'shapes',
    description: '3-Panel multi-track frame',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="2" y="3" width="20" height="18" rx="1.5" />
        <line x1="8.5" y1="3" x2="8.5" y2="21" />
        <line x1="15.5" y1="3" x2="15.5" y2="21" />
      </svg>
    ),
  },
  {
    id: 'shape_rect_4',
    name: '4-Panel Bi-Fold',
    category: 'shapes',
    description: '4-Panel folding / quad sliding system',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="2" y="3" width="20" height="18" rx="1.5" />
        <line x1="7" y1="3" x2="7" y2="21" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="17" y1="3" x2="17" y2="21" />
      </svg>
    ),
  },

  // 2. Structural Divisions (Mullions & Transoms)
  {
    id: 'mullion_vertical',
    name: 'Vertical Mullion',
    category: 'divisions',
    description: 'Drag to split opening vertically',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" strokeDasharray="2 2" />
        <rect x="10.5" y="3" width="3" height="18" className="fill-indigo-500/20 stroke-indigo-600" />
      </svg>
    ),
  },
  {
    id: 'transom_horizontal',
    name: 'Horizontal Transom',
    category: 'divisions',
    description: 'Drag to split top/bottom transom',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" strokeDasharray="2 2" />
        <rect x="4" y="9.5" width="16" height="3" className="fill-indigo-500/20 stroke-indigo-600" />
      </svg>
    ),
  },

  // 3. Arches & Geometric Shapes
  {
    id: 'shape_arch_round',
    name: 'Round Arch Head',
    category: 'arch',
    description: 'Semi-circular arched top frame',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <path d="M4 21 V11 A8 8 0 0 1 20 11 V21 Z" />
      </svg>
    ),
  },
  {
    id: 'shape_arch_gothic',
    name: 'Gothic Pointed Arch',
    category: 'arch',
    description: 'Pointed gothic architectural arch',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <path d="M4 21 V12 Q4 4 12 2 Q20 4 20 12 V21 Z" />
      </svg>
    ),
  },
  {
    id: 'shape_circle',
    name: 'Circular Bullseye',
    category: 'arch',
    description: 'Fixed circular round window',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <circle cx="12" cy="12" r="8.5" />
        <line x1="12" y1="3.5" x2="12" y2="20.5" strokeDasharray="1 1" />
        <line x1="3.5" y1="12" x2="20.5" y2="12" strokeDasharray="1 1" />
      </svg>
    ),
  },
  {
    id: 'shape_triangle',
    name: 'Gable Triangle',
    category: 'arch',
    description: 'Triangular roof apex gable window',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <path d="M3 20 L12 4 L21 20 Z" />
      </svg>
    ),
  },
  {
    id: 'shape_trapezoid',
    name: 'Sloped Trapezoid',
    category: 'arch',
    description: 'Sloped rake / staircase window',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <path d="M4 21 V6 L20 12 V21 Z" />
      </svg>
    ),
  },
  {
    id: 'shape_bay_90',
    name: '90° Corner Post',
    category: 'arch',
    description: 'Bay window corner post coupling',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <path d="M4 20 V4 H20" />
        <rect x="3" y="3" width="3" height="3" className="fill-current" />
      </svg>
    ),
  },

  // 4. Sashes & Operational Units
  {
    id: 'sash_sliding_left',
    name: 'Sliding (Left)',
    category: 'sashes',
    description: 'Sliding sash with leftward arrow',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M14 12 H9 M11 10 L9 12 L11 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'sash_sliding_right',
    name: 'Sliding (Right)',
    category: 'sashes',
    description: 'Sliding sash with rightward arrow',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M10 12 H15 M13 10 L15 12 L13 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'sash_casement_left',
    name: 'Casement (Left)',
    category: 'sashes',
    description: 'Side-hung casement open in/out',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M4 3 L20 12 L4 21" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    id: 'sash_casement_right',
    name: 'Casement (Right)',
    category: 'sashes',
    description: 'Side-hung casement hinged on right',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M20 3 L4 12 L20 21" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    id: 'sash_tilt_turn',
    name: 'Tilt & Turn',
    category: 'sashes',
    description: 'Dual-action tilt top and side swing',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M4 21 L12 3 L20 21" strokeDasharray="1.5 1.5" />
        <path d="M4 3 L20 12 L4 21" strokeDasharray="1 1" className="opacity-60" />
      </svg>
    ),
  },
  {
    id: 'sash_fixed',
    name: 'Fixed Glass',
    category: 'sashes',
    description: 'Non-openable picture glass',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <line x1="4" y1="3" x2="20" y2="21" strokeDasharray="1.5 1.5" className="opacity-50" />
        <line x1="20" y1="3" x2="4" y2="21" strokeDasharray="1.5 1.5" className="opacity-50" />
      </svg>
    ),
  },
  {
    id: 'mesh_bug',
    name: 'Bug Mesh',
    category: 'sashes',
    description: 'SS304 insect screen sash',
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none stroke-[1.8]">
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <line x1="8" y1="3" x2="8" y2="21" strokeDasharray="1 1" />
        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="1 1" />
        <line x1="16" y1="3" x2="16" y2="21" strokeDasharray="1 1" />
        <line x1="4" y1="8" x2="20" y2="8" strokeDasharray="1 1" />
        <line x1="4" y1="13" x2="20" y2="13" strokeDasharray="1 1" />
        <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="1 1" />
      </svg>
    ),
  },
];

interface DraggableShapePaletteProps {
  onSelectItem: (item: PaletteItem) => void;
  onOpenCatalog: () => void;
  activeTool?: string;
  onSelectTool?: (tool: string) => void;
}

export const DraggableShapePalette: React.FC<DraggableShapePaletteProps> = ({
  onSelectItem,
  onOpenCatalog,
  activeTool = 'select',
  onSelectTool,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'shapes' | 'divisions' | 'sashes' | 'arch'>('all');
  const [draggedItem, setDraggedItem] = useState<DraggableItemType | null>(null);

  const filteredItems = PALETTE_ITEMS.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    setDraggedItem(item.id);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <aside
      className={`relative z-20 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none shadow-xs ${
        isCollapsed ? 'w-12' : 'w-52 sm:w-60'
      }`}
    >
      {/* Top Header & Collapse Toggle */}
      <div className="h-11 px-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              Shape Library
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-auto"
          title={isCollapsed ? 'Expand Palette' : 'Collapse Palette'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Top CAD Tool Icons (Pointer, Box, Arch, Ruler, Catalog) */}
      <div className="p-1.5 border-b border-slate-200 flex items-center justify-around bg-white">
        <button
          type="button"
          onClick={() => onSelectTool && onSelectTool('select')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'select'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Select / Move Tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelectTool && onSelectTool('rect')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'rect'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Rectangle Outer Frame"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelectTool && onSelectTool('arch')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'arch'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Arch / Curved Geometry"
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelectTool && onSelectTool('dimension')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'dimension'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Precision Dimensioning"
        >
          <Ruler className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills (When expanded) */}
      {!isCollapsed && (
        <div className="p-1.5 border-b border-slate-100 flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('shapes')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeCategory === 'shapes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Panels
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('divisions')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeCategory === 'divisions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mullions
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('sashes')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeCategory === 'sashes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sashes
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('arch')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeCategory === 'arch'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Arches
          </button>
        </div>
      )}

      {/* Draggable Component Grid matching Screenshot */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {!isCollapsed && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-0.5">
            Drag to Canvas
          </div>
        )}

        <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-1.5'}`}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectItem(item)}
              className={`group relative flex ${
                isCollapsed ? 'flex-col items-center justify-center p-2' : 'flex-col items-center p-2'
              } rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all text-slate-700 hover:text-indigo-600 ${
                draggedItem === item.id ? 'opacity-50 ring-2 ring-indigo-500 ring-offset-1' : ''
              }`}
              title={`${item.name} — ${item.description}`}
            >
              <div className="flex items-center justify-center text-slate-700 group-hover:text-indigo-600 transition-colors">
                {item.iconSvg}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] font-semibold text-center mt-1 leading-tight line-clamp-1 text-slate-700 group-hover:text-indigo-900">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Catalog Shortcut Button */}
      <div className="p-2 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={onOpenCatalog}
          className={`w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all ${
            isCollapsed ? 'p-2' : ''
          }`}
          title="Browse Window Templates from Catalog"
        >
          <FolderOpen className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Catalog</span>}
        </button>
      </div>
    </aside>
  );
};
