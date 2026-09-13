'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  MousePointer,
  Circle,
  Pin,
  Ruler,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Box,
  Layers,
  FileText,
  RotateCcw,
  Sparkles,
  Check,
  Edit2,
  FolderOpen,
} from 'lucide-react';

interface ParametricDesignCanvasProps {
  design: ParametricWindowDesign;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null, type?: WindowComponentType) => void;
  onAddComponentAction: (action: AddComponentAction) => void;
  onDimensionChange?: (width: number, height: number) => void;
  onUpdateDesign?: (design: ParametricWindowDesign) => void;
}

export const ParametricDesignCanvas: React.FC<ParametricDesignCanvasProps> = ({
  design,
  selectedComponentId,
  onSelectComponent,
  onAddComponentAction,
  onDimensionChange,
  onUpdateDesign,
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

  const width = Math.max(400, design.width || 1800);
  const height = Math.max(300, design.height || 1200);

  // Padding around window for engineering dimension lines
  const padX = 190;
  const padY = 170;
  const vbWidth = width + padX * 2;
  const vbHeight = height + padY * 2 + 100; // Extra room for bottom kinematic diagram

  const winX = padX;
  const winY = padY;

  const frameFace = 60;
  const sashFace = 64;

  const innerX = winX + frameFace;
  const innerY = winY + frameFace;
  const innerW = width - frameFace * 2;
  const innerH = height - frameFace * 2;

  const panelCount = Math.max(1, design.panels.length || 2);
  const panelWidth = Math.round(innerW / panelCount);

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

  // Drag and Drop Handler on Canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');

    if (!onUpdateDesign) {
      // Fallback to onAddComponentAction
      if (itemId === 'mullion_vertical') onAddComponentAction('add_vertical_division');
      else if (itemId === 'transom_horizontal') onAddComponentAction('add_horizontal_division');
      else if (itemId.includes('sliding')) onAddComponentAction('add_sash');
      return;
    }

    const updated = { ...design };

    if (itemId === 'mullion_vertical') {
      // Split panels vertically
      const newCount = updated.panels.length + 1;
      const newPanels = [];
      for (let i = 0; i < newCount; i++) {
        newPanels.push({
          id: `panel-0${i + 1}`,
          name: `Panel A${i + 1}`,
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
    } else if (itemId === 'shape_rect_1') {
      updated.panels = [
        {
          id: 'panel-01',
          name: 'Panel A1',
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
          name: 'Panel A1',
          panelType: 'sliding' as const,
          openingDirection: 'sliding_right' as const,
          xRatio: 0,
          widthRatio: 0.5,
          sashId: 'sash-01',
          glassId: 'glass-01',
        },
        {
          id: 'panel-02',
          name: 'Panel A2',
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
        name: `Panel A${i + 1}`,
        panelType: 'sliding' as const,
        openingDirection: i === 0 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        sashId: `sash-0${i + 1}`,
        glassId: `glass-0${i + 1}`,
      }));
      onUpdateDesign(updated);
    } else if (itemId === 'shape_rect_4') {
      // 4-Panel Bi-Fold matching screenshot
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
    } else if (itemId === 'sash_casement_left' || itemId === 'sash_casement_right') {
      updated.panels = updated.panels.map((p) => ({
        ...p,
        panelType: 'casement' as const,
        openingDirection: itemId === 'sash_casement_left' ? ('casement_left' as const) : ('casement_right' as const),
      }));
      onUpdateDesign(updated);
    } else if (itemId === 'sash_tilt_turn') {
      updated.panels = updated.panels.map((p) => ({
        ...p,
        panelType: 'casement' as const,
        openingDirection: 'tilt_turn' as const,
      }));
      onUpdateDesign(updated);
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
    <div className="relative w-full h-full flex overflow-hidden bg-[#F8FAFC]">
      {/* 1. Left Docked Draggable Shape Library Palette */}
      <DraggableShapePalette
        onSelectItem={(item) => {
          // Trigger drop action directly on click
          handleDrop({
            preventDefault: () => {},
            dataTransfer: { getData: () => item.id },
          } as any);
        }}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
      />

      {/* 2. Main Canvas Center Area */}
      <div
        className="relative flex-1 h-full overflow-hidden flex flex-col items-center justify-center p-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={handleDrop}
      >
        {/* Top Floating Action & Mode Toggle Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Breadcrumb / Status */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-xs pointer-events-auto">
            <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider">
              {design.id || 'W01'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">{design.name || 'Living Room'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {width} × {height} mm
            </span>
          </div>

          {/* Right Mode Switchers: 2D Elevation, 3D Orbit, CAD Sheet, Catalog */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-xs pointer-events-auto">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>2D CAD Elevation</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Precision View</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/80 transition-all flex items-center gap-1.5"
              title="Open Full Architectural CAD Production Sheet"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>CAD Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
              title="Select from pre-engineered catalog templates"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
          </div>
        </div>

        {/* Dynamic Viewport: 2D Blueprint Canvas OR 3D WebGL Engine */}
        {viewMode === '3d' ? (
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
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
              className="max-w-full max-h-[600px] drop-shadow-sm"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="glassFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c7f2fe" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a5e9fa" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>

              {/* ------------------------------------------------------------- */}
              {/* 1. OUTER WINDOW FRAME                                         */}
              {/* ------------------------------------------------------------- */}
              <rect
                x={winX}
                y={winY}
                width={width}
                height={height}
                fill="url(#frameGradient)"
                stroke="#334155"
                strokeWidth="3"
                rx="2"
              />

              {/* Outer frame inner opening */}
              <rect
                x={innerX}
                y={innerY}
                width={innerW}
                height={innerH}
                fill="#ffffff"
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
                      stroke="#475569"
                      strokeWidth="2.5"
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
                      cy={pY + innerH / 2}
                      r="16"
                      fill="#ffffff"
                      stroke="#1B64F2"
                      strokeWidth="1.5"
                      className="shadow-xs"
                    />
                    <text
                      x={pX + pW / 2}
                      y={pY + innerH / 2 + 5}
                      fill="#1B64F2"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pTag}
                    </text>

                    {/* Hardware Handles on Meeting Stiles */}
                    {idx === 1 || idx === 2 ? (
                      <rect
                        x={pX + (idx === 1 ? pW - 6 : 2)}
                        y={pY + innerH / 2 - 25}
                        width="4"
                        height="50"
                        fill="#64748b"
                        rx="2"
                      />
                    ) : null}
                  </g>
                );
              })}

              {/* ------------------------------------------------------------- */}
              {/* 3. BLUEPRINT BLUE PRECISION MEASUREMENTS (Matching Image)     */}
              {/* ------------------------------------------------------------- */}

              {/* Overall Height (Left) in Blue (#1B64F2) */}
              <g className="text-blue-600">
                <line
                  x1={winX - 50}
                  y1={winY}
                  x2={winX - 50}
                  y2={winY + height}
                  stroke="#1B64F2"
                  strokeWidth="2"
                />
                {/* Top Arrowhead */}
                <polygon
                  points={`${winX - 54},${winY + 14} ${winX - 50},${winY} ${winX - 46},${winY + 14}`}
                  fill="#1B64F2"
                />
                {/* Bottom Arrowhead */}
                <polygon
                  points={`${winX - 54},${winY + height - 14} ${winX - 50},${winY + height} ${winX - 46},${winY + height - 14}`}
                  fill="#1B64F2"
                />
                {/* Top Extension Line */}
                <line x1={winX - 65} y1={winY} x2={winX} y2={winY} stroke="#1B64F2" strokeWidth="1" strokeDasharray="2 2" />
                {/* Bottom Extension Line */}
                <line x1={winX - 65} y1={winY + height} x2={winX} y2={winY + height} stroke="#1B64F2" strokeWidth="1" strokeDasharray="2 2" />

                {/* Overall Height Text label: 2843 */}
                <text
                  x={winX - 70}
                  y={winY + height / 2 + 8}
                  fill="#1B64F2"
                  fontSize="24"
                  fontWeight="900"
                  textAnchor="middle"
                  transform={`rotate(-90 ${winX - 70}, ${winY + height / 2})`}
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingHeight(true)}
                >
                  {height}
                </text>
              </g>

              {/* Overall Width (Bottom) in Blue (#1B64F2) */}
              <g>
                <line
                  x1={winX}
                  y1={winY + height + 50}
                  x2={winX + width}
                  y2={winY + height + 50}
                  stroke="#1B64F2"
                  strokeWidth="2"
                />
                {/* Left Arrowhead */}
                <polygon
                  points={`${winX + 14},${winY + height + 46} ${winX},${winY + height + 50} ${winX + 14},${winY + height + 54}`}
                  fill="#1B64F2"
                />
                {/* Right Arrowhead */}
                <polygon
                  points={`${winX + width - 14},${winY + height + 46} ${winX + width},${winY + height + 50} ${winX + width - 14},${winY + height + 54}`}
                  fill="#1B64F2"
                />
                {/* Left Extension */}
                <line x1={winX} y1={winY + height} x2={winX} y2={winY + height + 65} stroke="#1B64F2" strokeWidth="1" strokeDasharray="2 2" />
                {/* Right Extension */}
                <line x1={winX + width} y1={winY + height} x2={winX + width} y2={winY + height + 65} stroke="#1B64F2" strokeWidth="1" strokeDasharray="2 2" />

                {/* Overall Width Text label: 1925 */}
                <text
                  x={winX + width / 2}
                  y={winY + height + 42}
                  fill="#1B64F2"
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
                    fill="#1B64F2"
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
                    fill="#1B64F2"
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
                      stroke="#1B64F2"
                      strokeWidth="1.5"
                    />
                    <text
                      x={winX + width + 60}
                      y={winY + (height * 3) / 4 + 8}
                      fill="#1B64F2"
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
                <text x={winX - 55} y="10" fill="#1B64F2" fontSize="9" fontWeight="bold">
                  OUTSIDE
                </text>
                <line x1={winX - 55} y1="14" x2={winX - 15} y2="14" stroke="#1B64F2" strokeWidth="0.8" />
                <text x={winX - 55} y="24" fill="#1B64F2" fontSize="9" fontWeight="bold">
                  INSIDE
                </text>

                {/* Reference Baseline */}
                <line
                  x1={winX}
                  y1="14"
                  x2={winX + width}
                  y2="14"
                  stroke="#1B64F2"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Bi-Fold / Slide Nodes and Folding Angles */}
                <polyline
                  points={`${winX},14 ${winX + width * 0.25},24 ${winX + width * 0.5},10 ${winX + width * 0.75},24 ${winX + width},14`}
                  stroke="#1B64F2"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Circular Hinge Nodes */}
                <circle cx={winX} cy="14" r="4" fill="#1B64F2" />
                <circle cx={winX + width * 0.25} cy="24" r="4" fill="#1B64F2" />
                <circle cx={winX + width * 0.5} cy="10" r="4" fill="#1B64F2" />
                <circle cx={winX + width * 0.75} cy="24" r="4" fill="#1B64F2" />
                <circle cx={winX + width} cy="14" r="4" fill="#1B64F2" />

                {/* Panel Kinematic Number Badges ① ② ③ ④ */}
                {Array.from({ length: panelCount }, (_, i) => {
                  const circleX = winX + (innerW / panelCount) * (i + 0.5);
                  const circleNum = String.fromCharCode(0x2460 + i); // ①, ②, ③, ④
                  return (
                    <text
                      key={i}
                      x={circleX}
                      y="42"
                      fill="#1B64F2"
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
        <div className="absolute bottom-4 right-4 z-20 flex items-center bg-white/90 backdrop-blur-md rounded-xl shadow-xs border border-slate-200/90 p-1 gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 w-12 text-center select-none font-mono">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Dimension Edit Modals (when clicked) */}
        {isEditingWidth && (
          <div className="absolute z-30 bg-white p-3 rounded-xl shadow-xl border border-indigo-200 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Width (mm):</span>
            <input
              type="number"
              value={tempWidth}
              onChange={(e) => setTempWidth(e.target.value)}
              className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold"
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
              className="px-2 py-1 text-slate-500 text-xs font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {isEditingHeight && (
          <div className="absolute z-30 bg-white p-3 rounded-xl shadow-xl border border-indigo-200 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Height (mm):</span>
            <input
              type="number"
              value={tempHeight}
              onChange={(e) => setTempHeight(e.target.value)}
              className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold"
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
              className="px-2 py-1 text-slate-500 text-xs font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
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
