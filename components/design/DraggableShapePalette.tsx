'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MousePointer2, 
  Square,
  LayoutGrid,
  Settings,
  MoreHorizontal
} from 'lucide-react';

export type DraggableItemType = 'shape' | 'filling' | 'hardware' | 'mullion' | 'transom';

export interface PaletteItem {
  id: string;
  type: DraggableItemType;
  label: string;
  icon?: React.ReactNode;
}

interface DraggableShapePaletteProps {
  onSelectItem: (item: PaletteItem) => void;
  onOpenQuote?: () => void;
  onOpen3D?: () => void;
}

// Category Icons defined as inline SVGs to perfectly match the UI
const CatIconShapes = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="4" y="4" width="16" height="16" />
  </svg>
);

const CatIconCasement = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="3" y="3" width="8" height="18" />
    <rect x="13" y="3" width="8" height="18" />
    <path d="M11 12h2" />
  </svg>
);

const CatIconSliding = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="3" y="4" width="18" height="16" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
  </svg>
);

const CatIconSlideFold = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="2" y="4" width="6" height="16" />
    <rect x="9" y="4" width="6" height="16" />
    <rect x="16" y="4" width="6" height="16" />
    <path d="M5 12l2-2 2 2" />
  </svg>
);

const CatIconGrid = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="3" y="3" width="18" height="18" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

const CatIconBay = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M4 18L8 6h8l4 12z" />
    <line x1="8" y1="6" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="18" />
  </svg>
);

const CatIconArch = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M4 20V12a8 8 0 0 1 16 0v8" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </svg>
);

const CatIconCircle = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const CatIconSpecialty = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <polygon points="12 2 22 8 22 18 12 24 2 18 2 8 12 2" />
  </svg>
);

const CatIconFillings = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none">
    <rect x="3" y="3" width="18" height="18" />
    <line x1="3" y1="21" x2="21" y2="3" />
    <line x1="3" y1="15" x2="15" y2="3" />
    <line x1="9" y1="21" x2="21" y2="9" />
  </svg>
);

// Shape Icons for the grid (using standard SVG paths for accuracy)
const IconRect = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="20" height="20" />
  </svg>
);

const IconArch = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M4 24V14a10 10 0 0 1 20 0v10z" />
  </svg>
);

const IconU = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M4 4v10a10 10 0 0 0 20 0V4z" />
  </svg>
);

const IconUMullion = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M4 4v10a10 10 0 0 0 20 0V4z" />
    <line x1="14" y1="4" x2="14" y2="24" />
  </svg>
);

const IconMultiArch = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M4 24V12a10 10 0 0 1 20 0v12z" />
    <line x1="14" y1="12" x2="14" y2="24" />
    <line x1="4" y1="12" x2="24" y2="12" />
  </svg>
);

const IconGrid4 = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="20" height="20" />
    <line x1="14" y1="4" x2="14" y2="24" />
    <line x1="4" y1="14" x2="24" y2="14" />
  </svg>
);

const IconCircleShape = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <circle cx="14" cy="14" r="10" />
  </svg>
);

const IconDLeft = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M18 4v20A10 10 0 0 1 18 4z" />
    <line x1="18" y1="4" x2="18" y2="24" />
  </svg>
);

const IconDRight = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M10 4v20a10 10 0 0 0 0-20z" />
    <line x1="10" y1="4" x2="10" y2="24" />
  </svg>
);

const IconTriangle = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <polygon points="14,4 24,24 4,24" />
  </svg>
);

const IconDiamond = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <polygon points="14,4 24,14 14,24 4,14" />
  </svg>
);

const IconTrapezoid = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <polygon points="8,4 20,4 26,24 2,24" />
  </svg>
);

const IconPentagon = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <polygon points="14,4 26,12 21,24 7,24 2,12" />
  </svg>
);

const IconHexagon = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" />
  </svg>
);

const IconQuarterCircle = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M4 24V4a20 20 0 0 1 20 20H4z" />
  </svg>
);

// Casement Specific Icons
const IconCasementDouble = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="2" y="4" width="11" height="20" />
    <rect x="15" y="4" width="11" height="20" />
  </svg>
);

const IconCasementArchDouble = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M2 14v10h24V14A12 12 0 0 0 2 14z" />
    <line x1="14" y1="2" x2="14" y2="24" />
    <line x1="2" y1="14" x2="26" y2="14" />
  </svg>
);

const IconCasementGothic = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <path d="M14 2C8 8 4 12 4 24h20c0-12-4-16-10-22z" />
  </svg>
);

const IconCasementCorner = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="14" height="20" />
    <rect x="18" y="10" width="8" height="14" />
    <line x1="18" y1="10" x2="24" y2="6" />
    <line x1="18" y1="24" x2="24" y2="20" />
  </svg>
);

// Filling Icons
const IconFillHatch = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="20" height="20" />
    <line x1="4" y1="24" x2="24" y2="4" />
    <line x1="4" y1="18" x2="18" y2="4" />
    <line x1="4" y1="12" x2="12" y2="4" />
    <line x1="10" y1="24" x2="24" y2="10" />
    <line x1="16" y1="24" x2="24" y2="16" />
  </svg>
);

const IconFillMesh = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="20" height="20" />
    <line x1="4" y1="24" x2="24" y2="4" />
    <line x1="4" y1="14" x2="14" y2="4" />
    <line x1="14" y1="24" x2="24" y2="14" />
    
    <line x1="4" y1="4" x2="24" y2="24" />
    <line x1="4" y1="14" x2="14" y2="24" />
    <line x1="14" y1="4" x2="24" y2="14" />
  </svg>
);

const IconFillDiamond = () => (
  <svg viewBox="0 0 28 28" className="w-full h-full stroke-current fill-none stroke-[1.5]">
    <rect x="4" y="4" width="20" height="20" />
    <polygon points="14,4 24,14 14,24 4,14" />
    <polygon points="14,8 20,14 14,20 8,14" />
  </svg>
);


type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: PaletteItem[];
};

const CATEGORIES: Category[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    icon: <MousePointer2 size={20} strokeWidth={1.5} />,
    items: [] // No items, just selects cursor
  },
  {
    id: 'shapes',
    label: 'Shapes',
    icon: <CatIconShapes />,
    items: [
      { id: 'shape-cursor', type: 'shape', label: 'Cursor', icon: <MousePointer2 size={24} className="m-auto stroke-[1.5]" /> },
      { id: 'shape-rect', type: 'shape', label: 'Rectangle', icon: <IconRect /> },
      { id: 'shape-arch', type: 'shape', label: 'Arch', icon: <IconArch /> },
      { id: 'shape-u', type: 'shape', label: 'U-shape', icon: <IconU /> },
      { id: 'shape-u-mullion', type: 'shape', label: 'U-mullion', icon: <IconUMullion /> },
      { id: 'shape-multi-arch', type: 'shape', label: 'Multi-Arch', icon: <IconMultiArch /> },
      { id: 'shape-grid-4', type: 'shape', label: 'Grid 4', icon: <IconGrid4 /> },
      { id: 'shape-circle', type: 'shape', label: 'Circle', icon: <IconCircleShape /> },
      { id: 'shape-d-left', type: 'shape', label: 'D-Left', icon: <IconDLeft /> },
      { id: 'shape-d-right', type: 'shape', label: 'D-Right', icon: <IconDRight /> },
      { id: 'shape-pentagon', type: 'shape', label: 'Pentagon', icon: <IconPentagon /> },
      { id: 'shape-hexagon', type: 'shape', label: 'Hexagon', icon: <IconHexagon /> },
      { id: 'shape-quarter-circle', type: 'shape', label: 'Quarter Circle', icon: <IconQuarterCircle /> },
      { id: 'shape-triangle', type: 'shape', label: 'Triangle', icon: <IconTriangle /> },
      { id: 'shape-diamond', type: 'shape', label: 'Diamond', icon: <IconDiamond /> },
      { id: 'shape-trapezoid', type: 'shape', label: 'Trapezoid', icon: <IconTrapezoid /> },
    ]
  },
  {
    id: 'casement',
    label: 'Casement',
    icon: <CatIconCasement />,
    items: [
      { id: 'casement-single', type: 'shape', label: 'Single', icon: <IconRect /> },
      { id: 'casement-double', type: 'shape', label: 'Double', icon: <IconCasementDouble /> },
      { id: 'casement-arch-double', type: 'shape', label: 'Arch Double', icon: <IconCasementArchDouble /> },
      { id: 'casement-gothic', type: 'shape', label: 'Gothic', icon: <IconCasementGothic /> },
      { id: 'casement-corner', type: 'shape', label: 'Corner', icon: <IconCasementCorner /> },
      { id: 'casement-grid', type: 'shape', label: 'Grid', icon: <IconGrid4 /> },
    ]
  },
  {
    id: 'sliding',
    label: 'Sliding',
    icon: <CatIconSliding />,
    items: [
      { id: 'sliding-2', type: 'shape', label: '2 Panel', icon: <IconCasementDouble /> },
      { id: 'sliding-3', type: 'shape', label: '3 Panel', icon: <IconCasementDouble /> },
    ]
  },
  {
    id: 'slide_fold',
    label: 'Slide & Fold',
    icon: <CatIconSlideFold />,
    items: []
  },
  {
    id: 'grid',
    label: 'Grid',
    icon: <CatIconGrid />,
    items: []
  },
  {
    id: 'bay',
    label: 'Bay',
    icon: <CatIconBay />,
    items: []
  },
  {
    id: 'arch',
    label: 'Arch',
    icon: <CatIconArch />,
    items: []
  },
  {
    id: 'circle',
    label: 'Circle',
    icon: <CatIconCircle />,
    items: []
  },
  {
    id: 'specialty',
    label: 'Specialty',
    icon: <CatIconSpecialty />,
    items: []
  },
  {
    id: 'fillings',
    label: 'Fillings',
    icon: <CatIconFillings />,
    items: [
      { id: 'filling-hatch', type: 'filling', label: 'Hatch', icon: <IconFillHatch /> },
      { id: 'filling-mesh', type: 'filling', label: 'Mesh', icon: <IconFillMesh /> },
      { id: 'filling-diamond', type: 'filling', label: 'Diamond', icon: <IconFillDiamond /> },
    ]
  },
  {
    id: 'more',
    label: 'More',
    icon: <MoreHorizontal size={20} strokeWidth={1.5} />,
    items: []
  }
];

export default function DraggableShapePalette({ 
  onSelectItem, 
  onOpenQuote, 
  onOpen3D 
}: DraggableShapePaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string>('shapes');
  const [isSubPaletteOpen, setIsSubPaletteOpen] = useState(true);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex h-full select-none z-10 font-sans">
      
      {/* Tier 1: Primary Vertical Strip */}
      <div className="flex flex-col w-[36px] bg-white border-r border-slate-200 py-2 items-center flex-shrink-0 z-20">
        <div className="flex-1 w-full flex flex-col gap-1 items-center overflow-y-auto hide-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (cat.items.length > 0) setIsSubPaletteOpen(true);
              }}
              title={cat.label}
              className={`w-[32px] h-[32px] flex items-center justify-center rounded transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
        
        {/* Bottom Actions */}
        <div className="w-full flex flex-col items-center mt-2 border-t border-slate-200 pt-2 gap-2">
          {onOpenQuote && (
            <button 
              onClick={onOpenQuote}
              className="w-[28px] h-[70px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              title="Quote"
            >
              <span className="text-[11px] font-medium tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                QUOTE
              </span>
            </button>
          )}
          {onOpen3D && (
            <button 
              onClick={onOpen3D}
              className="w-[28px] h-[70px] bg-slate-100 text-slate-700 border border-slate-200 rounded hover:bg-slate-200 transition-colors flex items-center justify-center mb-2"
              title="Draw / 3D"
            >
              <span className="text-[11px] font-medium tracking-wider" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                DRAW
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tier 2: Secondary Expandable Grid */}
      <div 
        className={`relative bg-[#fafafa] border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
          isSubPaletteOpen ? 'w-[130px]' : 'w-[4px] min-w-[4px] cursor-e-resize hover:bg-blue-300'
        }`}
        onClick={() => !isSubPaletteOpen && setIsSubPaletteOpen(true)}
      >
        {isSubPaletteOpen && currentCategory && (
          <>
            {/* Header */}
            <div className="flex items-center justify-end p-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSubPaletteOpen(false); }}
                className="w-[24px] h-[24px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            
            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 hide-scrollbar">
              {currentCategory.items.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {currentCategory.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => onSelectItem(item)}
                      title={item.label}
                      className="aspect-square bg-white border border-slate-200 rounded flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-all p-1"
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center mt-4 px-1">
                  No items in this category
                </div>
              )}
            </div>

            {/* Bottom Gear */}
            <div className="p-2 flex justify-center border-t border-slate-200">
              <button className="text-slate-400 hover:text-slate-700">
                <Settings size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Global styles for hide-scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
