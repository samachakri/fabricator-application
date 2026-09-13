'use client';

import React, { useState } from 'react';
import {
  ParametricWindowDesign,
  WindowComponentType,
} from '@/lib/design/types';
import { AddComponentAction } from './AddComponentMenu';
import { DraggableShapePalette, PaletteItem } from './DraggableShapePalette';
import { Precision3DView } from './Precision3DView';
import { DesignCatalogModal, CatalogTemplate } from './DesignCatalogModal';
import { ArchitecturalSheetModal } from './ArchitecturalSheetModal';
import {
  ZoomIn,
  ZoomOut,
  Box,
  Ruler,
  FileText,
  RotateCcw,
  FolderOpen,
  PanelRight,
  PanelRightClose,
  Layers,
  Trash2,
} from 'lucide-react';

interface ParametricDesignCanvasProps {
  design: ParametricWindowDesign;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null, type?: WindowComponentType) => void;
  onAddComponentAction: (action: AddComponentAction) => void;
  onDimensionChange?: (width: number, height: number) => void;
  onUpdateDesign?: (design: ParametricWindowDesign) => void;
  isConfigPanelOpen?: boolean;
  onToggleConfigPanel?: () => void;
}

export const ParametricDesignCanvas: React.FC<ParametricDesignCanvasProps> = ({
  design,
  selectedComponentId,
  onSelectComponent,
  onAddComponentAction,
  onDimensionChange,
  onUpdateDesign,
  isConfigPanelOpen = false,
  onToggleConfigPanel,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditingWidth, setIsEditingWidth] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempWidth, setTempWidth] = useState(String(design.width || 1800));
  const [tempHeight, setTempHeight] = useState(String(design.height || 1200));
  const [isEditingArchHeight, setIsEditingArchHeight] = useState(false);
  const [tempArchHeight, setTempArchHeight] = useState(String(design.archHeight || 500));

  // Determine if canvas has active elements
  const hasElements = design.panels && design.panels.length > 0;

  const width = Math.max(400, design.width || 1800);
  const height = Math.max(300, design.height || 1200);
  const archHeight = design.hasArch ? (design.archHeight || 500) : 0;
  const totalWindowHeight = height + archHeight;

  // Padding around window for engineering dimension lines
  const padX = 190;
  const padY = 170;
  const vbWidth = width + padX * 2;
  const vbHeight = totalWindowHeight + padY * 2 + 100;

  const winX = padX;
  const winY = padY + archHeight; // Rectangular frame starts below the arch!

  const frameFace = 60;
  const innerX = winX + frameFace;
  const innerY = winY + frameFace;
  const innerW = width - frameFace * 2;
  const innerH = height - frameFace * 2;

  const panelCount = Math.max(1, design.panels?.length || 1);

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(180, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleZoomReset = () => setZoomLevel(100);

  // Dimension submit
  const submitWidth = () => {
    setIsEditingWidth(false);
    const val = Number(tempWidth);
    if (val >= 400 && val <= 6000 && onDimensionChange) {
      onDimensionChange(val, height);
    } else {
      setTempWidth(String(width));
    }
  };

  const submitHeight = () => {
    setIsEditingHeight(false);
    const val = Number(tempHeight);
    if (val >= 300 && val <= 4000 && onDimensionChange) {
      onDimensionChange(width, val);
    } else {
      setTempHeight(String(height));
    }
  };

  const submitArchHeight = () => {
    setIsEditingArchHeight(false);
    const val = Number(tempArchHeight);
    if (val >= 150 && val <= 2500 && onUpdateDesign) {
      onUpdateDesign({ ...design, archHeight: val });
    } else {
      setTempArchHeight(String(design.archHeight || 500));
    }
  };

  // Drag and Drop Handler on Canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    applyElementToCanvas(itemId);
  };

  const applyElementToCanvas = (itemId: string) => {
    if (!onUpdateDesign) return;
    // Auto-open Details panel on element add
    if (!isConfigPanelOpen && onToggleConfigPanel) {
      onToggleConfigPanel();
    }

    const updated = { ...design };

    if (itemId === 'shape_arch_round' || itemId === 'shape_arch_gothic' || itemId === 'shape_circle') {
      // Form into Arch + Window Combination (as requested: attaches arch on top of 2-door or existing window)
      if (!updated.panels || updated.panels.length === 0) {
        updated.panels = [
          {
            id: 'panel-01',
            name: 'A1',
            panelType: 'sliding' as const,
            openingDirection: 'sliding_right' as const,
            xRatio: 0,
            widthRatio: 0.5,
            sashId: 'sash-01',
            glassId: 'glass-01',
          },
          {
            id: 'panel-02',
            name: 'A2',
            panelType: 'sliding' as const,
            openingDirection: 'sliding_left' as const,
            xRatio: 0.5,
            widthRatio: 0.5,
            sashId: 'sash-02',
            glassId: 'glass-02',
          },
        ];
      }
      updated.hasArch = true;
      updated.archType = itemId === 'shape_arch_gothic' ? 'gothic' : 'round';
      updated.archHeight = updated.archHeight || 500;
      updated.windowType = 'Combination Window';
      onUpdateDesign(updated);
    } else if (itemId === 'shape_rect_1') {
      updated.panels = [
        {
          id: 'panel-01',
          name: 'A1',
          panelType: 'fixed' as const,
          openingDirection: 'fixed' as const,
          xRatio: 0,
          widthRatio: 1,
          glassId: 'glass-01',
        },
      ];
      onUpdateDesign(updated);
    } else if (itemId === 'shape_rect_2') {
      updated.panels = [
        {
          id: 'panel-01',
          name: 'A1',
          panelType: 'sliding' as const,
          openingDirection: 'sliding_right' as const,
          xRatio: 0,
          widthRatio: 0.5,
          sashId: 'sash-01',
          glassId: 'glass-01',
        },
        {
          id: 'panel-02',
          name: 'A2',
          panelType: 'sliding' as const,
          openingDirection: 'sliding_left' as const,
          xRatio: 0.5,
          widthRatio: 0.5,
          sashId: 'sash-02',
          glassId: 'glass-02',
        },
      ];
      onUpdateDesign(updated);
    } else if (itemId === 'shape_rect_3') {
      const pCount = 3;
      updated.panels = Array.from({ length: pCount }, (_, i) => ({
        id: `panel-0${i + 1}`,
        name: `A${i + 1}`,
        panelType: 'sliding' as const,
        openingDirection: i === 0 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        sashId: `sash-0${i + 1}`,
        glassId: `glass-0${i + 1}`,
      }));
      onUpdateDesign(updated);
    } else if (itemId === 'shape_rect_4') {
      const pCount = 4;
      updated.panels = Array.from({ length: pCount }, (_, i) => ({
        id: `panel-0${i + 1}`,
        name: `A${i + 1}`,
        panelType: 'sliding' as const,
        openingDirection: i < 2 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        sashId: `sash-0${i + 1}`,
        glassId: `glass-0${i + 1}`,
      }));
      onUpdateDesign(updated);
    } else if (itemId === 'mullion_vertical') {
      const newCount = (updated.panels?.length || 0) + 1;
      const newPanels = [];
      for (let i = 0; i < newCount; i++) {
        newPanels.push({
          id: `panel-0${i + 1}`,
          name: `A${i + 1}`,
          panelType: i % 2 === 0 ? ('sliding' as const) : ('fixed' as const),
          openingDirection: i % 2 === 0 ? ('sliding_right' as const) : ('fixed' as const),
          xRatio: i / newCount,
          widthRatio: 1 / newCount,
          sashId: `sash-0${i + 1}`,
          glassId: `glass-0${i + 1}`,
        });
      }
      updated.panels = newPanels;
      onUpdateDesign(updated);
    } else if (itemId === 'transom_horizontal') {
      updated.transoms = [{ id: 'transom-01', positionRatio: 0.35, height: 60 }];
      onUpdateDesign(updated);
    } else if (itemId === 'sash_casement_left' || itemId === 'sash_casement_right') {
      if (!updated.panels || updated.panels.length === 0) {
        updated.panels = [
          {
            id: 'panel-01',
            name: 'A1',
            panelType: 'casement' as const,
            openingDirection: itemId === 'sash_casement_left' ? ('casement_left' as const) : ('casement_right' as const),
            xRatio: 0,
            widthRatio: 1,
            sashId: 'sash-01',
            glassId: 'glass-01',
          },
        ];
      } else {
        updated.panels = updated.panels.map((p) => ({
          ...p,
          panelType: 'casement' as const,
          openingDirection: itemId === 'sash_casement_left' ? ('casement_left' as const) : ('casement_right' as const),
        }));
      }
      onUpdateDesign(updated);
    } else if (itemId === 'sash_tilt_turn') {
      if (!updated.panels || updated.panels.length === 0) {
        updated.panels = [
          {
            id: 'panel-01',
            name: 'A1',
            panelType: 'casement' as const,
            openingDirection: 'tilt_turn' as const,
            xRatio: 0,
            widthRatio: 1,
            sashId: 'sash-01',
            glassId: 'glass-01',
          },
        ];
      } else {
        updated.panels = updated.panels.map((p) => ({
          ...p,
          panelType: 'casement' as const,
          openingDirection: 'tilt_turn' as const,
        }));
      }
      onUpdateDesign(updated);
    } else {
      // Default: generate 2-panel if canvas was empty
      if (!updated.panels || updated.panels.length === 0) {
        applyElementToCanvas('shape_rect_2');
      }
    }
  };

  // Clear / Reset Canvas to Blank
  const handleClearCanvas = () => {
    if (onUpdateDesign) {
      onUpdateDesign({
        ...design,
        panels: [],
        mullions: [],
        transoms: [],
      });
    }
  };

  // Apply template from Catalog
  const handleApplyTemplate = (tpl: CatalogTemplate) => {
    if (onDimensionChange) {
      onDimensionChange(tpl.dimensions.width, tpl.dimensions.height);
    }
    if (onUpdateDesign) {
      const pCount = tpl.panels || 2;
      const newPanels = Array.from({ length: pCount }, (_, i) => ({
        id: `panel-0${i + 1}`,
        name: `A${i + 1}`,
        panelType: tpl.series === 'Sliding' ? ('sliding' as const) : ('casement' as const),
        openingDirection: i % 2 === 0 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        sashId: `sash-0${i + 1}`,
        glassId: `glass-0${i + 1}`,
      }));
      onUpdateDesign({
        ...design,
        width: tpl.dimensions.width,
        height: tpl.dimensions.height,
        panels: newPanels,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-black text-white">
      {/* 1. Left Docked Draggable Shape Library Palette */}
      <DraggableShapePalette
        onSelectItem={(item) => applyElementToCanvas(item.id)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
      />

      {/* 2. Main CAD Canvas Center Area (Black CAD Drafting Theme) */}
      <div
        className="relative flex-1 h-full overflow-hidden flex flex-col items-center justify-center p-4 bg-[#090D16]"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={handleDrop}
      >
        {/* Top Floating Action & Mode Toggle Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Top Window Name Input for Better Clarity (Screenshot 5) */}
          <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md pointer-events-auto">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono">
              {design.id || 'W01'}
            </span>
            <span className="text-slate-600">|</span>
            <input
              type="text"
              value={design.name || ''}
              placeholder="Window Name (e.g. Master Bedroom, Living Balcony)..."
              onChange={(e) => {
                if (onUpdateDesign) {
                  onUpdateDesign({ ...design, name: e.target.value });
                }
              }}
              className="bg-transparent text-xs font-semibold text-white placeholder-slate-500 focus:outline-none w-48 sm:w-72"
            />
          </div>

          {/* Right Mode Switchers & Details Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md pointer-events-auto">
            {hasElements && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === '3d'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{viewMode === '3d' ? '2D View' : '3D View'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 transition-all flex items-center gap-1.5"
              title="Select from pre-engineered catalog templates"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            {hasElements && (
              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Clear Canvas to Blank"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Sidebar Toggle for Right Details Panel (Screenshot 4) */}
            {onToggleConfigPanel && (
              <>
                <div className="w-px h-4 bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  onClick={onToggleConfigPanel}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isConfigPanelOpen
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title={isConfigPanelOpen ? 'Hide Details' : 'Show Details'}
                >
                  {isConfigPanelOpen ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRight className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Details</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* IF CANVAS HAS NO ELEMENTS YET: CLEAN BLANK CAD PLAN ONLY      */}
        {/* ------------------------------------------------------------- */}
        {!hasElements ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
            <svg
              viewBox={`0 0 ${vbWidth} ${vbHeight}`}
              className="max-w-full max-h-[85vh] transition-transform duration-200 drop-shadow-2xl select-none"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <defs>
                <pattern id="emptyCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />
                </pattern>
              </defs>
              <rect width={vbWidth} height={vbHeight} fill="url(#emptyCadGrid)" />

              {/* Blank Window Blueprint Plan Area */}
              <rect
                x={winX}
                y={winY}
                width={width}
                height={height}
                fill="#0b1329"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="8 6"
                rx="8"
                opacity="0.85"
              />

              {/* Center Crosshairs */}
              <line
                x1={winX + width / 2 - 40}
                y1={winY + height / 2}
                x2={winX + width / 2 + 40}
                y2={winY + height / 2}
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1={winX + width / 2}
                y1={winY + height / 2 - 40}
                x2={winX + width / 2}
                y2={winY + height / 2 + 40}
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.4"
              />

              {/* Top Width Dimension Line */}
              <line x1={winX} y1={winY - 45} x2={winX + width} y2={winY - 45} stroke="#38bdf8" strokeWidth="2" />
              <line x1={winX} y1={winY - 55} x2={winX} y2={winY - 35} stroke="#38bdf8" strokeWidth="2" />
              <line x1={winX + width} y1={winY - 55} x2={winX + width} y2={winY - 35} stroke="#38bdf8" strokeWidth="2" />
              <text
                x={winX + width / 2}
                y={winY - 55}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="18"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {width} mm
              </text>

              {/* Left Height Dimension Line */}
              <line x1={winX - 45} y1={winY} x2={winX - 45} y2={winY + height} stroke="#38bdf8" strokeWidth="2" />
              <line x1={winX - 55} y1={winY} x2={winX - 35} y2={winY} stroke="#38bdf8" strokeWidth="2" />
              <line x1={winX - 55} y1={winY + height} x2={winX - 35} y2={winY + height} stroke="#38bdf8" strokeWidth="2" />
              <text
                x={winX - 55}
                y={winY + height / 2}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="18"
                fontFamily="monospace"
                fontWeight="bold"
                transform={`rotate(-90 ${winX - 55} ${winY + height / 2})`}
              >
                {height} mm
              </text>

              <text
                x={winX + width / 2}
                y={winY + height / 2 + 50}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="15"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                Drag shapes from left palette here to design window
              </text>
            </svg>
          </div>
        ) : viewMode === '3d' ? (
          /* 3D WebGL Engine */
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Precision3DView design={design} />
          </div>
        ) : (
          /* 2D TECHNICAL CAD ELEVATION with BLUEPRINT BLUE DIMENSIONS */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out select-none"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <svg
              viewBox={`0 0 ${vbWidth} ${vbHeight}`}
              className="max-w-full max-h-[600px] drop-shadow-md"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="glassFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Background CAD Grid */}
              <rect width={vbWidth} height={vbHeight} fill="url(#cadGrid)" />

              {/* ------------------------------------------------------------- */}
              {/* 1. OUTER WINDOW FRAME                                         */}
              {/* ------------------------------------------------------------- */}
              <rect
                x={winX}
                y={winY}
                width={width}
                height={height}
                fill="url(#frameGradient)"
                stroke="#ffffff"
                strokeWidth="2.5"
                rx="2"
              />

              {/* Outer frame inner opening */}
              <rect
                x={innerX}
                y={innerY}
                width={innerW}
                height={innerH}
                fill="#0b1120"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* ------------------------------------------------------------- */}
              {/* 2. SASHES & PANELS (Matching Screenshot A1, A2, A3, A4)       */}
              {/* ------------------------------------------------------------- */}
              {design.panels.map((panel, idx) => {
                const pW = innerW * (panel.widthRatio || 1 / panelCount);
                const pX = innerX + innerW * (panel.xRatio || idx / panelCount);
                const pY = innerY;
                const pTag = panel.name?.replace('Panel ', '') || `A${idx + 1}`;

                return (
                  <g key={panel.id || idx} className="cursor-pointer group">
                    {/* Sash Outer Frame */}
                    <rect
                      x={pX}
                      y={pY}
                      width={pW}
                      height={innerH}
                      fill="#ffffff"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />

                    {/* Glass Pane */}
                    <rect
                      x={pX + 8}
                      y={pY + 8}
                      width={pW - 16}
                      height={innerH - 16}
                      fill="url(#glassFillGradient)"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />

                    {/* Glass Reflection Cross-Brace Lines matching Screenshot */}
                    <line
                      x1={pX + 10}
                      y1={pY + 10}
                      x2={pX + pW - 10}
                      y2={pY + innerH - 10}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="opacity-70"
                    />
                    <line
                      x1={pX + pW - 10}
                      y1={pY + 10}
                      x2={pX + 10}
                      y2={pY + innerH - 10}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="opacity-70"
                    />

                    {/* Panel Identifier Tag (A1, A2, A3, A4) */}
                    <circle
                      cx={pX + pW / 2}
                      cy={pY + innerH / 2 - 15}
                      r="16"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      className="shadow-xs"
                    />
                    <text
                      x={pX + pW / 2}
                      y={pY + innerH / 2 - 10}
                      fill="#38bdf8"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pTag}
                    </text>

                    {/* Live Glass Cut Measurements & Spec (Directly from Details) */}
                    <text
                      x={pX + pW / 2}
                      y={pY + innerH / 2 + 18}
                      fill="#38bdf8"
                      fontSize="12"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {Math.max(50, Math.round(pW - 30))} × {Math.max(50, Math.round(innerH - 30))} mm
                    </text>
                    <text
                      x={pX + pW / 2}
                      y={pY + innerH / 2 + 34}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="sans-serif"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {design.defaultGlass.thickness}mm {design.defaultGlass.glassType}
                    </text>

                    {/* Hardware Handles on Meeting Stiles */}
                    {idx === 1 || idx === 2 ? (
                      <rect
                        x={pX + (idx === 1 ? pW - 6 : 2)}
                        y={pY + innerH / 2 - 25}
                        width="4"
                        height="50"
                        fill="#cbd5e1"
                        rx="2"
                      />
                    ) : null}
                  </g>
                );
              })}

              {/* ------------------------------------------------------------- */}
              {/* 3. BLUEPRINT BLUE PRECISION MEASUREMENTS (Matching Image)     */}
              {/* ------------------------------------------------------------- */}

              {/* Overall Window Height & Arch Dimensions */}
              {/* Rectangular Door/Window Height */}
              <g>
                <line
                  x1={winX - 50}
                  y1={winY}
                  x2={winX - 50}
                  y2={winY + height}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <polygon
                  points={`${winX - 54},${winY + 14} ${winX - 50},${winY} ${winX - 46},${winY + 14}`}
                  fill="#38bdf8"
                />
                <polygon
                  points={`${winX - 54},${winY + height - 14} ${winX - 50},${winY + height} ${winX - 46},${winY + height - 14}`}
                  fill="#38bdf8"
                />
                <line x1={winX - 65} y1={winY} x2={winX} y2={winY} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={winX - 65} y1={winY + height} x2={winX} y2={winY + height} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                <text
                  x={winX - 70}
                  y={winY + height / 2 + 8}
                  fill="#38bdf8"
                  fontSize="22"
                  fontWeight="900"
                  textAnchor="middle"
                  transform={`rotate(-90 ${winX - 70}, ${winY + height / 2})`}
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingHeight(true)}
                >
                  {height}
                </text>
              </g>

              {/* Arch Head Rise Dimension (If Attached on Top) */}
              {design.hasArch && (
                <>
                  <g>
                    <line
                      x1={winX - 50}
                      y1={winY - archHeight}
                      x2={winX - 50}
                      y2={winY}
                      stroke="#a855f7"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`${winX - 54},${winY - archHeight + 14} ${winX - 50},${winY - archHeight} ${winX - 46},${winY - archHeight + 14}`}
                      fill="#a855f7"
                    />
                    <polygon
                      points={`${winX - 54},${winY - 14} ${winX - 50},${winY} ${winX - 46},${winY - 14}`}
                      fill="#a855f7"
                    />
                    <line x1={winX - 65} y1={winY - archHeight} x2={winX + width / 2} y2={winY - archHeight} stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />

                    <text
                      x={winX - 70}
                      y={winY - archHeight / 2 + 8}
                      fill="#a855f7"
                      fontSize="20"
                      fontWeight="900"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX - 70}, ${winY - archHeight / 2})`}
                      className="cursor-pointer hover:underline"
                      onClick={() => setIsEditingArchHeight(true)}
                    >
                      {archHeight} (Arch)
                    </text>
                  </g>

                  {/* Total Combined Height Outer Dimension */}
                  <g>
                    <line
                      x1={winX - 110}
                      y1={winY - archHeight}
                      x2={winX - 110}
                      y2={winY + height}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points={`${winX - 115},${winY - archHeight + 14} ${winX - 110},${winY - archHeight} ${winX - 105},${winY - archHeight + 14}`}
                      fill="#38bdf8"
                    />
                    <polygon
                      points={`${winX - 115},${winY + height - 14} ${winX - 110},${winY + height} ${winX - 105},${winY + height - 14}`}
                      fill="#38bdf8"
                    />
                    <line x1={winX - 125} y1={winY - archHeight} x2={winX - 50} y2={winY - archHeight} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1={winX - 125} y1={winY + height} x2={winX - 50} y2={winY + height} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                    <text
                      x={winX - 130}
                      y={winY + (height - archHeight) / 2 + 8}
                      fill="#38bdf8"
                      fontSize="20"
                      fontWeight="900"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX - 130}, ${winY + (height - archHeight) / 2})`}
                    >
                      {height + archHeight} Total
                    </text>
                  </g>
                </>
              )}

              {/* Overall Width (Bottom) in Blueprint Blue (#38bdf8) */}
              <g>
                <line
                  x1={winX}
                  y1={winY + height + 50}
                  x2={winX + width}
                  y2={winY + height + 50}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Left Arrowhead */}
                <polygon
                  points={`${winX + 14},${winY + height + 46} ${winX},${winY + height + 50} ${winX + 14},${winY + height + 54}`}
                  fill="#38bdf8"
                />
                {/* Right Arrowhead */}
                <polygon
                  points={`${winX + width - 14},${winY + height + 46} ${winX + width},${winY + height + 50} ${winX + width - 14},${winY + height + 54}`}
                  fill="#38bdf8"
                />
                {/* Left Extension */}
                <line x1={winX} y1={winY + height} x2={winX} y2={winY + height + 65} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                {/* Right Extension */}
                <line x1={winX + width} y1={winY + height} x2={winX + width} y2={winY + height + 65} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                {/* Overall Width Text label: 1925 */}
                <text
                  x={winX + width / 2}
                  y={winY + height + 42}
                  fill="#38bdf8"
                  fontSize="24"
                  fontWeight="900"
                  textAnchor="middle"
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingWidth(true)}
                >
                  {width}
                </text>
              </g>

              {/* Internal Panel Height Annotations (1361.5, 1421.5 matching screenshot) */}
              {panelCount >= 2 && (
                <g>
                  {/* Panel Height 1 */}
                  <text
                    x={winX + innerW * 0.38}
                    y={winY + height / 2 + 10}
                    fill="#38bdf8"
                    fontSize="18"
                    fontWeight="800"
                    textAnchor="middle"
                    transform={`rotate(-90 ${winX + innerW * 0.38}, ${winY + height / 2})`}
                  >
                    {(height / 2 + 61.5).toFixed(1)}
                  </text>

                  {/* Panel Height 2 */}
                  <text
                    x={winX + innerW * 0.62}
                    y={winY + height / 2 + 10}
                    fill="#38bdf8"
                    fontSize="18"
                    fontWeight="800"
                    textAnchor="middle"
                    transform={`rotate(-90 ${winX + innerW * 0.62}, ${winY + height / 2})`}
                  >
                    {(height / 2 + 61.5).toFixed(1)}
                  </text>

                  {/* Right Sash Height (1421.5) */}
                  <g>
                    <line
                      x1={winX + width + 40}
                      y1={winY + height / 2}
                      x2={winX + width + 40}
                      y2={winY + height}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={winX + width + 60}
                      y={winY + (height * 3) / 4 + 8}
                      fill="#38bdf8"
                      fontSize="18"
                      fontWeight="800"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX + width + 60}, ${winY + (height * 3) / 4})`}
                    >
                      {(height / 2).toFixed(1)}
                    </text>
                  </g>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 4. KINEMATIC OPERATION DIAGRAM (Matching Image Bottom)        */}
              {/* ------------------------------------------------------------- */}
              <g transform={`translate(0, ${winY + height + 85})`}>
                {/* Outside / Inside Legend */}
                <text x={winX - 55} y="10" fill="#38bdf8" fontSize="9" fontWeight="bold">
                  OUTSIDE
                </text>
                <line x1={winX - 55} y1="14" x2={winX - 15} y2="14" stroke="#38bdf8" strokeWidth="0.8" />
                <text x={winX - 55} y="24" fill="#38bdf8" fontSize="9" fontWeight="bold">
                  INSIDE
                </text>

                {/* Reference Baseline */}
                <line
                  x1={winX}
                  y1="14"
                  x2={winX + width}
                  y2="14"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Bi-Fold / Slide Nodes and Folding Angles */}
                <polyline
                  points={`${winX},14 ${winX + width * 0.25},24 ${winX + width * 0.5},10 ${winX + width * 0.75},24 ${winX + width},14`}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Circular Hinge Nodes */}
                <circle cx={winX} cy="14" r="4" fill="#38bdf8" />
                <circle cx={winX + width * 0.25} cy="24" r="4" fill="#38bdf8" />
                <circle cx={winX + width * 0.5} cy="10" r="4" fill="#38bdf8" />
                <circle cx={winX + width * 0.75} cy="24" r="4" fill="#38bdf8" />
                <circle cx={winX + width} cy="14" r="4" fill="#38bdf8" />

                {/* Panel Kinematic Number Badges ① ② ③ ④ */}
                {Array.from({ length: panelCount }, (_, i) => {
                  const circleX = winX + (innerW / panelCount) * (i + 0.5);
                  const circleNum = String.fromCharCode(0x2460 + i);
                  return (
                    <text
                      key={i}
                      x={circleX}
                      y="42"
                      fill="#38bdf8"
                      fontSize="18"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {circleNum}
                    </text>
                  );
                })}
              </g>
            </svg>
          </div>
        )}

        {/* Bottom Zoom & Measurement Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center bg-slate-900/90 backdrop-blur-md rounded-xl shadow-xs border border-slate-700 p-1 gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 w-12 text-center select-none font-mono">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Dimension Edit Modals (when clicked) */}
        {isEditingWidth && (
          <div className="absolute z-30 bg-slate-900 p-3 rounded-xl shadow-2xl border border-indigo-500 text-white flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Width (mm):</span>
            <input
              type="number"
              value={tempWidth}
              onChange={(e) => setTempWidth(e.target.value)}
              className="w-24 px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitWidth()}
            />
            <button
              onClick={submitWidth}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              OK
            </button>
            <button
              onClick={() => setIsEditingWidth(false)}
              className="px-2 py-1 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {isEditingHeight && (
          <div className="absolute z-30 bg-slate-900 p-3 rounded-xl shadow-2xl border border-indigo-500 text-white flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Height (mm):</span>
            <input
              type="number"
              value={tempHeight}
              onChange={(e) => setTempHeight(e.target.value)}
              className="w-24 px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitHeight()}
            />
            <button
              onClick={submitHeight}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              OK
            </button>
            <button
              onClick={() => setIsEditingHeight(false)}
              className="px-2 py-1 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

      {/* Direct Arch Height Dimension Edit Modal */}
      {isEditingArchHeight && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 w-80 shadow-2xl animate-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-white mb-1">Edit Arch Rise (Height)</h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter top arch rise in millimeters (150 mm – 2500 mm).
            </p>
            <div className="relative mb-5">
              <input
                type="number"
                min={150}
                max={2500}
                value={tempArchHeight}
                onChange={(e) => setTempArchHeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitArchHeight()}
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                mm
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingArchHeight(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitArchHeight}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Apply Arch Rise
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* 3. Catalog Templates Modal */}
      <DesignCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      {/* 4. Full Architectural CAD Production Sheet */}
      <ArchitecturalSheetModal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        design={design}
      />
    </div>
  );
};
