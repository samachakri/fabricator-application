'use client';

import React, { useState } from 'react';
import {
  ParametricWindowDesign,
  WindowComponentType,
  DesignPanel,
  DesignMullion,
  DesignTransom,
  OpeningDirectionType,
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
  Columns,
  Rows,
  Plus,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronsLeftRight,
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

  // Direct dimension inline editing states
  const [isEditingWidth, setIsEditingWidth] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempWidth, setTempWidth] = useState(String(design.width || 1800));
  const [tempHeight, setTempHeight] = useState(String(design.height || 1200));
  const [isEditingArchHeight, setIsEditingArchHeight] = useState(false);
  const [tempArchHeight, setTempArchHeight] = useState(String(design.archHeight || 500));

  // Editing individual bay width
  const [editingBayId, setEditingBayId] = useState<string | null>(null);
  const [tempBayWidth, setTempBayWidth] = useState<string>('');

  // Determine if canvas has active elements
  const hasElements = design.panels && design.panels.length > 0;

  const width = Math.max(400, design.width || 1800);
  const height = Math.max(300, design.height || 1200);
  const archHeight = design.hasArch ? (design.archHeight || 500) : 0;
  const totalWindowHeight = height + archHeight;

  // Padding around window for engineering dimension lines
  const padX = 180;
  const padY = 160;
  const vbWidth = width + padX * 2;
  const vbHeight = totalWindowHeight + padY * 2 + 40;

  const winX = padX;
  const winY = padY + archHeight; // Rectangular frame starts below the arch!

  const frameFace = 60;
  const innerX = winX + frameFace;
  const innerY = winY + frameFace;
  const innerW = width - frameFace * 2;
  const innerH = height - frameFace * 2;

  const panelCount = Math.max(1, design.panels?.length || 1);

  // Active selected panel
  const selectedPanel = design.panels?.find((p) => p.id === selectedComponentId) || null;

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(180, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleZoomReset = () => setZoomLevel(100);

  // Submit Overall Width
  const submitWidth = () => {
    setIsEditingWidth(false);
    const val = Number(tempWidth);
    if (val >= 400 && val <= 6000 && onDimensionChange) {
      onDimensionChange(val, height);
    } else {
      setTempWidth(String(width));
    }
  };

  // Submit Overall Height
  const submitHeight = () => {
    setIsEditingHeight(false);
    const val = Number(tempHeight);
    if (val >= 300 && val <= 4000 && onDimensionChange) {
      onDimensionChange(width, val);
    } else {
      setTempHeight(String(height));
    }
  };

  // Submit Arch Height
  const submitArchHeight = () => {
    setIsEditingArchHeight(false);
    const val = Number(tempArchHeight);
    if (val >= 150 && val <= 2500 && onUpdateDesign) {
      onUpdateDesign({ ...design, archHeight: val });
    } else {
      setTempArchHeight(String(design.archHeight || 500));
    }
  };

  // Submit Individual Bay Width in mm
  const submitBayWidth = (bayId: string) => {
    setEditingBayId(null);
    const targetVal = Number(tempBayWidth);
    if (!targetVal || targetVal <= 100 || !onUpdateDesign) return;

    const panelIdx = design.panels.findIndex((p) => p.id === bayId);
    if (panelIdx === -1) return;

    const targetRatio = targetVal / innerW;
    if (targetRatio >= 0.95 || targetRatio <= 0.05) return;

    // Adjust other panels proportionately
    const currentRatio = design.panels[panelIdx].widthRatio;
    const diff = targetRatio - currentRatio;
    const remainingCount = design.panels.length - 1;

    if (remainingCount <= 0) return;

    const deltaPerRemaining = diff / remainingCount;
    let accumX = 0;
    const updatedPanels = design.panels.map((p, idx) => {
      const newRatio = idx === panelIdx ? targetRatio : Math.max(0.08, p.widthRatio - deltaPerRemaining);
      const res = {
        ...p,
        xRatio: accumX,
        widthRatio: newRatio,
      };
      accumX += newRatio;
      return res;
    });

    // Recompute mullions
    const newMullions: DesignMullion[] = [];
    let mX = 0;
    for (let i = 0; i < updatedPanels.length - 1; i++) {
      mX += updatedPanels[i].widthRatio;
      newMullions.push({
        id: `mullion-0${i + 1}`,
        positionRatio: mX,
        width: 60,
      });
    }

    onUpdateDesign({
      ...design,
      panels: updatedPanels,
      mullions: newMullions,
    });
  };

  // Split a specific bay vertically into 2 sub-bays
  const splitBayVertically = (panelId: string) => {
    if (!onUpdateDesign) return;
    const panelIdx = design.panels.findIndex((p) => p.id === panelId);
    if (panelIdx === -1) return;

    const target = design.panels[panelIdx];
    const halfW = target.widthRatio / 2;

    const panelA: DesignPanel = {
      ...target,
      id: `panel-${Date.now()}-1`,
      name: `A${panelIdx + 1}`,
      widthRatio: halfW,
    };
    const panelB: DesignPanel = {
      ...target,
      id: `panel-${Date.now()}-2`,
      name: `A${panelIdx + 2}`,
      xRatio: target.xRatio + halfW,
      widthRatio: halfW,
      openingDirection: target.openingDirection === 'sliding_right' ? 'sliding_left' : 'sliding_right',
      sashId: `sash-${Date.now()}-2`,
      glassId: `glass-${Date.now()}-2`,
    };

    const newPanels = [...design.panels];
    newPanels.splice(panelIdx, 1, panelA, panelB);

    // Re-index names A1, A2, A3...
    const renumbered = newPanels.map((p, i) => ({
      ...p,
      name: `A${i + 1}`,
    }));

    // Recalculate mullions
    const newMullions: DesignMullion[] = [];
    let accumX = 0;
    for (let i = 0; i < renumbered.length - 1; i++) {
      accumX += renumbered[i].widthRatio;
      newMullions.push({
        id: `mullion-0${i + 1}`,
        positionRatio: accumX,
        width: 60,
      });
    }

    onUpdateDesign({
      ...design,
      panels: renumbered,
      mullions: newMullions,
    });
    onSelectComponent(panelA.id, 'panel');
  };

  // Remove / Delete a specific bay and distribute width to neighbor
  const deleteBay = (panelId: string) => {
    if (!onUpdateDesign || design.panels.length <= 1) return;
    const panelIdx = design.panels.findIndex((p) => p.id === panelId);
    if (panelIdx === -1) return;

    const removed = design.panels[panelIdx];
    const newPanels = design.panels.filter((p) => p.id !== panelId);

    const factor = 1 / (1 - removed.widthRatio);
    let currX = 0;
    const updatedPanels = newPanels.map((p, i) => {
      const newW = p.widthRatio * factor;
      const updatedP = {
        ...p,
        name: `A${i + 1}`,
        xRatio: currX,
        widthRatio: newW,
      };
      currX += newW;
      return updatedP;
    });

    const newMullions: DesignMullion[] = [];
    let accumX = 0;
    for (let i = 0; i < updatedPanels.length - 1; i++) {
      accumX += updatedPanels[i].widthRatio;
      newMullions.push({
        id: `mullion-0${i + 1}`,
        positionRatio: accumX,
        width: 60,
      });
    }

    onUpdateDesign({
      ...design,
      panels: updatedPanels,
      mullions: newMullions,
    });
    onSelectComponent(null);
  };

  // Set opening type of specific bay
  const setBayOperation = (
    panelId: string,
    type: 'fixed' | 'sliding' | 'casement',
    dir: OpeningDirectionType
  ) => {
    if (!onUpdateDesign) return;
    const updated = design.panels.map((p) => {
      if (p.id === panelId) {
        return {
          ...p,
          panelType: type,
          openingDirection: dir,
          sashId: type === 'fixed' ? undefined : p.sashId || `sash-${p.id}`,
        };
      }
      return p;
    });
    onUpdateDesign({
      ...design,
      panels: updated,
    });
  };

  // Toggle Horizontal Transom (Transom bar dividing window into top/bottom)
  const toggleTransom = () => {
    if (!onUpdateDesign) return;
    if (design.transoms && design.transoms.length > 0) {
      // Remove transom bar
      onUpdateDesign({
        ...design,
        transoms: [],
      });
    } else {
      // Add horizontal transom at 35% height
      onUpdateDesign({
        ...design,
        transoms: [{ id: 'transom-01', positionRatio: 0.35, height: 60 }],
      });
    }
  };

  // Toggle Arch Head Attachment
  const toggleArch = (style: 'round' | 'gothic' = 'round') => {
    if (!onUpdateDesign) return;
    if (design.hasArch) {
      onUpdateDesign({
        ...design,
        hasArch: false,
        archHeight: 0,
        windowType: 'Sliding Window',
      });
    } else {
      if (!design.panels || design.panels.length === 0) {
        // Default 2-panel base
        applyElementToCanvas('shape_rect_2');
      }
      onUpdateDesign({
        ...design,
        hasArch: true,
        archType: style,
        archHeight: 500,
        windowType: 'Combination Window',
      });
    }
  };

  // Apply Element / Action from Palette or Drag-and-Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    applyElementToCanvas(itemId);
  };

  const applyElementToCanvas = (itemId: string, targetPanelId?: string) => {
    if (!onUpdateDesign) return;

    // If auto opening details panel
    if (!isConfigPanelOpen && onToggleConfigPanel) {
      onToggleConfigPanel();
    }

    const updated = { ...design };

    // 1. Arch attachments
    if (itemId === 'shape_arch_round' || itemId === 'shape_arch_gothic' || itemId === 'shape_circle') {
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
      return;
    }

    // 2. Base Geometric Frame Openings
    if (itemId === 'shape_rect_1') {
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
      updated.mullions = [];
      onUpdateDesign(updated);
      return;
    }

    if (itemId === 'shape_rect_2') {
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
      updated.mullions = [{ id: 'mullion-01', positionRatio: 0.5, width: 60 }];
      onUpdateDesign(updated);
      return;
    }

    if (itemId === 'shape_rect_3') {
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
      updated.mullions = [
        { id: 'mullion-01', positionRatio: 1 / 3, width: 60 },
        { id: 'mullion-02', positionRatio: 2 / 3, width: 60 },
      ];
      onUpdateDesign(updated);
      return;
    }

    if (itemId === 'shape_rect_4') {
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
      updated.mullions = [
        { id: 'mullion-01', positionRatio: 0.25, width: 60 },
        { id: 'mullion-02', positionRatio: 0.5, width: 60 },
        { id: 'mullion-03', positionRatio: 0.75, width: 60 },
      ];
      onUpdateDesign(updated);
      return;
    }

    // 3. Structural Divisions: Vertical Mullion
    if (itemId === 'mullion_vertical') {
      if (targetPanelId || selectedComponentId) {
        splitBayVertically(targetPanelId || selectedComponentId!);
      } else {
        // If no panel selected, split the widest panel
        if (updated.panels && updated.panels.length > 0) {
          const widest = [...updated.panels].sort((a, b) => b.widthRatio - a.widthRatio)[0];
          splitBayVertically(widest.id);
        } else {
          applyElementToCanvas('shape_rect_2');
        }
      }
      return;
    }

    // 4. Structural Divisions: Horizontal Transom
    if (itemId === 'transom_horizontal') {
      toggleTransom();
      return;
    }

    // 5. Sashes & Operational Units (Applied to selected or target panel)
    const activeTargetId = targetPanelId || selectedComponentId || (updated.panels?.[0]?.id);

    if (itemId === 'sash_sliding_left') {
      if (activeTargetId) setBayOperation(activeTargetId, 'sliding', 'sliding_left');
      return;
    }
    if (itemId === 'sash_sliding_right') {
      if (activeTargetId) setBayOperation(activeTargetId, 'sliding', 'sliding_right');
      return;
    }
    if (itemId === 'sash_casement_left') {
      if (activeTargetId) setBayOperation(activeTargetId, 'casement', 'casement_left');
      return;
    }
    if (itemId === 'sash_casement_right') {
      if (activeTargetId) setBayOperation(activeTargetId, 'casement', 'casement_right');
      return;
    }
    if (itemId === 'sash_top_hung') {
      if (activeTargetId) setBayOperation(activeTargetId, 'casement', 'top_hung');
      return;
    }
    if (itemId === 'sash_tilt_turn') {
      if (activeTargetId) setBayOperation(activeTargetId, 'casement', 'tilt_turn');
      return;
    }
    if (itemId === 'sash_fixed') {
      if (activeTargetId) setBayOperation(activeTargetId, 'fixed', 'fixed');
      return;
    }
    if (itemId === 'mesh_bug') {
      if (activeTargetId) {
        const pan = updated.panels.find((p) => p.id === activeTargetId);
        if (pan) {
          pan.meshId = pan.meshId ? undefined : `mesh-${pan.id}`;
          onUpdateDesign(updated);
        }
      }
      return;
    }

    // Default fallback
    if (!updated.panels || updated.panels.length === 0) {
      applyElementToCanvas('shape_rect_2');
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
        hasArch: false,
      });
      onSelectComponent(null);
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

  // Helper to format opening label
  const formatOpeningLabel = (p: DesignPanel) => {
    if (p.panelType === 'fixed') return 'Fixed Glass';
    if (p.openingDirection === 'sliding_left') return 'Sliding (◄)';
    if (p.openingDirection === 'sliding_right') return 'Sliding (►)';
    if (p.openingDirection === 'casement_left') return 'Casement (◄ Hinged)';
    if (p.openingDirection === 'casement_right') return 'Casement (► Hinged)';
    if (p.openingDirection === 'top_hung') return 'Top Hung (Awning)';
    if (p.openingDirection === 'tilt_turn') return 'Tilt & Turn';
    return p.panelType;
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

      {/* 2. Main CAD Canvas Center Area (Clean Black CAD Drafting Theme) */}
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
          {/* Top Window Name Input */}
          <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md pointer-events-auto">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono">
              {design.id || 'W01'}
            </span>
            <span className="text-slate-600">|</span>
            <input
              type="text"
              value={design.name || ''}
              placeholder="Window Name (e.g. Master Bedroom, Balcony)..."
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
                <span>{viewMode === '3d' ? '2D CAD' : '3D View'}</span>
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

            {/* Sidebar Toggle for Right Details Panel */}
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
                className="cursor-pointer hover:underline"
                onClick={() => setIsEditingWidth(true)}
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
                className="cursor-pointer hover:underline"
                onClick={() => setIsEditingHeight(true)}
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
                Drag shapes or elements from left palette here to design window
              </text>
            </svg>
          </div>
        ) : viewMode === '3d' ? (
          /* 3D WebGL Engine */
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Precision3DView design={design} />
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* 2D TECHNICAL CAD ELEVATION (CRISP, PROFESSIONAL & UNCLUTTERED) */
          /* ------------------------------------------------------------- */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out select-none"
            style={{ transform: `scale(${zoomLevel / 100})` }}
            onClick={(e) => {
              // Click outside deselects bay
              if (e.target === e.currentTarget) {
                onSelectComponent(null);
              }
            }}
          >
            <svg
              viewBox={`0 0 ${vbWidth} ${vbHeight}`}
              className="max-w-full max-h-[82vh] drop-shadow-md"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="glassFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.55" />
                </linearGradient>

                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                <linearGradient id="archGlassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                </linearGradient>

                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>

                {/* Bug mesh pattern */}
                <pattern id="meshGridPattern" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#60a5fa" strokeWidth="0.6" opacity="0.4" />
                </pattern>
              </defs>

              {/* Background CAD Grid */}
              <rect width={vbWidth} height={vbHeight} fill="url(#cadGrid)" />

              {/* ============================================================= */}
              {/* 1. ARCH HEAD ATTACHED ON TOP (Arch + Window Combination)       */}
              {/* ============================================================= */}
              {design.hasArch && (
                <g className="cursor-pointer group">
                  {/* Outer Arch Profile */}
                  <path
                    d={`M ${winX} ${winY} A ${width / 2} ${archHeight} 0 0 1 ${winX + width} ${winY} Z`}
                    fill="url(#frameGradient)"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  {/* Inner Arch Glazing Opening */}
                  <path
                    d={`M ${innerX} ${winY} A ${innerW / 2} ${Math.max(50, archHeight - frameFace)} 0 0 1 ${innerX + innerW} ${winY} Z`}
                    fill="url(#archGlassGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                  />

                  {/* Sunburst Radial Mullion Spokes (Classic Arch Geometry) */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const angleDeg = 30 + i * 30; // 30, 60, 90, 120, 150 deg
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const rX = innerW / 2;
                    const rY = Math.max(50, archHeight - frameFace);
                    const spokeX = winX + width / 2 - rX * Math.cos(angleRad);
                    const spokeY = winY - rY * Math.sin(angleRad);
                    return (
                      <line
                        key={i}
                        x1={winX + width / 2}
                        y1={winY}
                        x2={spokeX}
                        y2={spokeY}
                        stroke="#e2e8f0"
                        strokeWidth="2"
                        strokeDasharray="2 1"
                      />
                    );
                  })}

                  {/* Arch Head Badge */}
                  <rect
                    x={winX + width / 2 - 65}
                    y={winY - archHeight / 2 - 14}
                    width="130"
                    height="28"
                    rx="14"
                    fill="#0f172a"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    className="shadow-md"
                  />
                  <text
                    x={winX + width / 2}
                    y={winY - archHeight / 2 + 4}
                    fill="#c084fc"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Arch Head (Fixed)
                  </text>

                  {/* Coupling Transom Profile between Arch and Lower Window */}
                  <rect
                    x={winX}
                    y={winY - 8}
                    width={width}
                    height="16"
                    fill="#cbd5e1"
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* ============================================================= */}
              {/* 2. RECTANGULAR WINDOW OUTER FRAME                             */}
              {/* ============================================================= */}
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

              {/* Horizontal Transom Profile Bar (If divided) */}
              {design.transoms && design.transoms.length > 0 && (
                <rect
                  x={innerX}
                  y={innerY + innerH * 0.35 - 15}
                  width={innerW}
                  height="30"
                  fill="#e2e8f0"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
              )}

              {/* ============================================================= */}
              {/* 3. BAYS / PANELS / SASHES (Clean, Interactive & Professional) */}
              {/* ============================================================= */}
              {design.panels.map((panel, idx) => {
                const isSelected = selectedComponentId === panel.id;
                const pW = innerW * (panel.widthRatio || 1 / panelCount);
                const pX = innerX + innerW * (panel.xRatio || idx / panelCount);
                const pY = innerY;
                const pTag = panel.name || `A${idx + 1}`;

                const glassW = Math.max(50, Math.round(pW - 30));
                const glassH = Math.max(50, Math.round(innerH - 30));

                return (
                  <g
                    key={panel.id || idx}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(panel.id, 'panel');
                    }}
                  >
                    {/* Sash Outer Frame Profile */}
                    <rect
                      x={pX}
                      y={pY}
                      width={pW}
                      height={innerH}
                      fill={isSelected ? '#1e293b' : '#ffffff'}
                      stroke={isSelected ? '#38bdf8' : '#94a3b8'}
                      strokeWidth={isSelected ? '2.5' : '2'}
                      className="transition-colors duration-150"
                    />

                    {/* Glass Pane */}
                    <rect
                      x={pX + 8}
                      y={pY + 8}
                      width={pW - 16}
                      height={innerH - 16}
                      fill="url(#glassFillGradient)"
                      stroke={isSelected ? '#38bdf8' : '#0284c7'}
                      strokeWidth="1.5"
                    />

                    {/* Optional Insect Mesh Texture */}
                    {panel.meshId && (
                      <rect
                        x={pX + 8}
                        y={pY + 8}
                        width={pW - 16}
                        height={innerH - 16}
                        fill="url(#meshGridPattern)"
                      />
                    )}

                    {/* Subtle Architectural Glass Reflection Lines */}
                    <line
                      x1={pX + 12}
                      y1={pY + 12}
                      x2={pX + pW - 12}
                      y2={pY + innerH - 12}
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="4 4"
                      className="opacity-50"
                    />
                    <line
                      x1={pX + pW - 12}
                      y1={pY + 12}
                      x2={pX + 12}
                      y2={pY + innerH - 12}
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="4 4"
                      className="opacity-50"
                    />

                    {/* Architectural Opening Symbols */}
                    {/* Case 1: Sliding Left (◄) */}
                    {panel.openingDirection === 'sliding_left' && (
                      <g transform={`translate(${pX + pW / 2 - 18}, ${pY + 24})`}>
                        <rect width="36" height="20" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="24" y1="10" x2="10" y2="10" stroke="#38bdf8" strokeWidth="2" />
                        <polygon points="12,6 6,10 12,14" fill="#38bdf8" />
                      </g>
                    )}

                    {/* Case 2: Sliding Right (►) */}
                    {panel.openingDirection === 'sliding_right' && (
                      <g transform={`translate(${pX + pW / 2 - 18}, ${pY + 24})`}>
                        <rect width="36" height="20" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="12" y1="10" x2="26" y2="10" stroke="#38bdf8" strokeWidth="2" />
                        <polygon points="24,6 30,10 24,14" fill="#38bdf8" />
                      </g>
                    )}

                    {/* Case 3: Casement Left (Hinged on left, apex points right) */}
                    {panel.openingDirection === 'casement_left' && (
                      <polyline
                        points={`${pX + 14},${pY + 14} ${pX + pW - 14},${pY + innerH / 2} ${pX + 14},${pY + innerH - 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Case 4: Casement Right (Hinged on right, apex points left) */}
                    {panel.openingDirection === 'casement_right' && (
                      <polyline
                        points={`${pX + pW - 14},${pY + 14} ${pX + 14},${pY + innerH / 2} ${pX + pW - 14},${pY + innerH - 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Case 5: Top Hung / Awning (Hinged at top, apex points down) */}
                    {panel.openingDirection === 'top_hung' && (
                      <polyline
                        points={`${pX + 14},${pY + 14} ${pX + pW / 2},${pY + innerH - 14} ${pX + pW - 14},${pY + 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Case 6: Tilt & Turn */}
                    {panel.openingDirection === 'tilt_turn' && (
                      <>
                        <polyline
                          points={`${pX + 14},${pY + innerH - 14} ${pX + pW / 2},${pY + 14} ${pX + pW - 14},${pY + innerH - 14}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <polyline
                          points={`${pX + 14},${pY + 14} ${pX + pW - 14},${pY + innerH / 2} ${pX + 14},${pY + innerH - 14}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="opacity-60"
                        />
                      </>
                    )}

                    {/* Central Panel Identifier Badge & Glass Cut Measurements */}
                    <g transform={`translate(${pX + pW / 2}, ${pY + innerH / 2})`}>
                      {/* Circular Badge Pill */}
                      <circle
                        cx="0"
                        cy="-16"
                        r="16"
                        fill={isSelected ? '#0284c7' : '#0f172a'}
                        stroke="#38bdf8"
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="shadow-md"
                      />
                      <text
                        x="0"
                        y="-11"
                        fill={isSelected ? '#ffffff' : '#38bdf8'}
                        fontSize="13"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pTag}
                      </text>

                      {/* Operation type description */}
                      <text
                        x="0"
                        y="8"
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {formatOpeningLabel(panel)}
                      </text>

                      {/* Glass cut size (mm) */}
                      <text
                        x="0"
                        y="24"
                        fill="#38bdf8"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {glassW} × {glassH} mm
                      </text>
                    </g>

                    {/* Hardware Handles on Meeting Stiles */}
                    {(panel.panelType === 'sliding' || panel.panelType === 'casement') && (
                      <rect
                        x={pX + (idx % 2 === 0 ? pW - 7 : 3)}
                        y={pY + innerH / 2 - 25}
                        width="4"
                        height="50"
                        fill="#cbd5e1"
                        stroke="#475569"
                        strokeWidth="0.8"
                        rx="2"
                      />
                    )}

                    {/* Selection Active Ring Highlight with Corner Drafting Marks */}
                    {isSelected && (
                      <g>
                        <rect
                          x={pX - 2}
                          y={pY - 2}
                          width={pW + 4}
                          height={innerH + 4}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          className="animate-pulse"
                        />
                        {/* 4 Corner Markers */}
                        <circle cx={pX - 2} cy={pY - 2} r="4" fill="#38bdf8" />
                        <circle cx={pX + pW + 2} cy={pY - 2} r="4" fill="#38bdf8" />
                        <circle cx={pX - 2} cy={pY + innerH + 2} r="4" fill="#38bdf8" />
                        <circle cx={pX + pW + 2} cy={pY + innerH + 2} r="4" fill="#38bdf8" />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ============================================================= */}
              {/* 4. MULLION PROFILES (Between Bays)                            */}
              {/* ============================================================= */}
              {design.panels.length > 1 &&
                design.panels.slice(0, -1).map((p, i) => {
                  const mPosRatio = (p.xRatio || 0) + (p.widthRatio || 1 / panelCount);
                  const mX = innerX + innerW * mPosRatio;
                  return (
                    <g key={i}>
                      <line
                        x1={mX}
                        y1={innerY}
                        x2={mX}
                        y2={innerY + innerH}
                        stroke="#cbd5e1"
                        strokeWidth="3"
                      />
                    </g>
                  );
                })}

              {/* ============================================================= */}
              {/* 5. PRECISION BLUEPRINT DIMENSION LINES (CAD STANDARD)         */}
              {/* ============================================================= */}

              {/* A. SUB-BAY WIDTH DIMENSIONS (TOP TIER)                        */}
              {/* Cleanly shows the width of each bay above the frame           */}
              {design.panels.map((p, i) => {
                const bW = innerW * (p.widthRatio || 1 / panelCount);
                const bX = innerX + innerW * (p.xRatio || i / panelCount);
                const dimY = winY - 35;
                const bayMm = Math.round(bW);

                return (
                  <g key={p.id || i}>
                    {/* Dimension line */}
                    <line x1={bX + 2} y1={dimY} x2={bX + bW - 2} y2={dimY} stroke="#38bdf8" strokeWidth="1.5" />
                    {/* Tick marks */}
                    <line x1={bX} y1={dimY - 5} x2={bX} y2={dimY + 5} stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={bX + bW} y1={dimY - 5} x2={bX + bW} y2={dimY + 5} stroke="#38bdf8" strokeWidth="1.5" />
                    {/* Dropline to frame */}
                    <line x1={bX} y1={dimY + 5} x2={bX} y2={winY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                    {i === design.panels.length - 1 && (
                      <line x1={bX + bW} y1={dimY + 5} x2={bX + bW} y2={winY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                    )}

                    {/* Numeric value (clickable to edit) */}
                    <text
                      x={bX + bW / 2}
                      y={dimY - 8}
                      fill="#38bdf8"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        setEditingBayId(p.id);
                        setTempBayWidth(String(bayMm));
                      }}
                      
                    >
                      {bayMm}
                    </text>
                  </g>
                );
              })}

              {/* B. OVERALL WIDTH (BOTTOM TIER)                                */}
              <g>
                <line
                  x1={winX}
                  y1={winY + height + 45}
                  x2={winX + width}
                  y2={winY + height + 45}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Left Arrowhead */}
                <polygon
                  points={`${winX + 12},${winY + height + 41} ${winX},${winY + height + 45} ${winX + 12},${winY + height + 49}`}
                  fill="#38bdf8"
                />
                {/* Right Arrowhead */}
                <polygon
                  points={`${winX + width - 12},${winY + height + 41} ${winX + width},${winY + height + 45} ${winX + width - 12},${winY + height + 49}`}
                  fill="#38bdf8"
                />
                {/* Left/Right Extension lines */}
                <line x1={winX} y1={winY + height} x2={winX} y2={winY + height + 55} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={winX + width} y1={winY + height} x2={winX + width} y2={winY + height + 55} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                <text
                  x={winX + width / 2}
                  y={winY + height + 36}
                  fill="#38bdf8"
                  fontSize="22"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingWidth(true)}
                  
                >
                  {width} mm
                </text>
              </g>

              {/* C. OVERALL HEIGHT (LEFT TIER)                                 */}
              <g>
                <line
                  x1={winX - 45}
                  y1={winY}
                  x2={winX - 45}
                  y2={winY + height}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <polygon
                  points={`${winX - 49},${winY + 12} ${winX - 45},${winY} ${winX - 41},${winY + 12}`}
                  fill="#38bdf8"
                />
                <polygon
                  points={`${winX - 49},${winY + height - 12} ${winX - 45},${winY + height} ${winX - 41},${winY + height - 12}`}
                  fill="#38bdf8"
                />
                <line x1={winX - 58} y1={winY} x2={winX} y2={winY} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={winX - 58} y1={winY + height} x2={winX} y2={winY + height} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                <text
                  x={winX - 60}
                  y={winY + height / 2 + 8}
                  fill="#38bdf8"
                  fontSize="20"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                  transform={`rotate(-90 ${winX - 60}, ${winY + height / 2})`}
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingHeight(true)}
                  
                >
                  {height} mm
                </text>
              </g>

              {/* D. ARCH RISE & TOTAL HEIGHT DIMENSIONS (IF ARCH ATTACHED)      */}
              {design.hasArch && (
                <>
                  {/* Arch Rise Dimension */}
                  <g>
                    <line
                      x1={winX - 45}
                      y1={winY - archHeight}
                      x2={winX - 45}
                      y2={winY}
                      stroke="#c084fc"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`${winX - 49},${winY - archHeight + 12} ${winX - 45},${winY - archHeight} ${winX - 41},${winY - archHeight + 12}`}
                      fill="#c084fc"
                    />
                    <polygon
                      points={`${winX - 49},${winY - 12} ${winX - 45},${winY} ${winX - 41},${winY - 12}`}
                      fill="#c084fc"
                    />
                    <line x1={winX - 58} y1={winY - archHeight} x2={winX + width / 2} y2={winY - archHeight} stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />

                    <text
                      x={winX - 60}
                      y={winY - archHeight / 2 + 8}
                      fill="#c084fc"
                      fontSize="18"
                      fontWeight="900"
                      fontFamily="monospace"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX - 60}, ${winY - archHeight / 2})`}
                      className="cursor-pointer hover:underline"
                      onClick={() => setIsEditingArchHeight(true)}
                      
                    >
                      {archHeight} mm (Arch)
                    </text>
                  </g>

                  {/* Outer Combined Height Dimension Line */}
                  <g>
                    <line
                      x1={winX - 105}
                      y1={winY - archHeight}
                      x2={winX - 105}
                      y2={winY + height}
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <polygon
                      points={`${winX - 110},${winY - archHeight + 14} ${winX - 105},${winY - archHeight} ${winX - 100},${winY - archHeight + 14}`}
                      fill="#38bdf8"
                    />
                    <polygon
                      points={`${winX - 110},${winY + height - 14} ${winX - 105},${winY + height} ${winX - 100},${winY + height - 14}`}
                      fill="#38bdf8"
                    />
                    <line x1={winX - 118} y1={winY - archHeight} x2={winX - 45} y2={winY - archHeight} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1={winX - 118} y1={winY + height} x2={winX - 45} y2={winY + height} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />

                    <text
                      x={winX - 120}
                      y={winY + (height - archHeight) / 2 + 8}
                      fill="#38bdf8"
                      fontSize="18"
                      fontWeight="900"
                      fontFamily="monospace"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX - 120}, ${winY + (height - archHeight) / 2})`}
                    >
                      {height + archHeight} mm Total
                    </text>
                  </g>
                </>
              )}

              {/* E. TRANSOM SUB-HEIGHTS (RIGHT TIER IF TRANSOM PRESENT)         */}
              {design.transoms && design.transoms.length > 0 && (
                <g>
                  {/* Top Transom Height */}
                  <line
                    x1={winX + width + 45}
                    y1={innerY}
                    x2={winX + width + 45}
                    y2={innerY + innerH * 0.35}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <line x1={winX + width} y1={innerY} x2={winX + width + 55} y2={innerY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1={winX + width} y1={innerY + innerH * 0.35} x2={winX + width + 55} y2={innerY + innerH * 0.35} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text
                    x={winX + width + 60}
                    y={innerY + (innerH * 0.35) / 2 + 5}
                    fill="#38bdf8"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    transform={`rotate(-90 ${winX + width + 60}, ${innerY + (innerH * 0.35) / 2})`}
                  >
                    {Math.round(innerH * 0.35)} mm
                  </text>

                  {/* Bottom Main Height */}
                  <line
                    x1={winX + width + 45}
                    y1={innerY + innerH * 0.35}
                    x2={winX + width + 45}
                    y2={innerY + innerH}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <line x1={winX + width} y1={innerY + innerH} x2={winX + width + 55} y2={innerY + innerH} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text
                    x={winX + width + 60}
                    y={innerY + innerH * 0.35 + (innerH * 0.65) / 2 + 5}
                    fill="#38bdf8"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    transform={`rotate(-90 ${winX + width + 60}, ${innerY + innerH * 0.35 + (innerH * 0.65) / 2})`}
                  >
                    {Math.round(innerH * 0.65)} mm
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* ============================================================= */}
        {/* 6. CONTEXTUAL BOTTOM BAY ACTION BAR (When a bay is clicked)   */}
        {/* ============================================================= */}
        {selectedPanel && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-2 px-4 shadow-2xl flex items-center gap-2.5 text-xs text-white animate-in slide-in-from-bottom-2 duration-150 max-w-full overflow-x-auto">
            <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
              <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-black text-xs flex items-center justify-center font-mono">
                {selectedPanel.name || 'A1'}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">
                  {formatOpeningLabel(selectedPanel)}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {Math.round(innerW * selectedPanel.widthRatio)} mm wide
                </span>
              </div>
            </div>

            {/* Quick Sash Operation Change Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'fixed', 'fixed')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  selectedPanel.panelType === 'fixed'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'sliding', 'sliding_left')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  selectedPanel.panelType === 'sliding' && selectedPanel.openingDirection === 'sliding_left'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Slide</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'sliding', 'sliding_right')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  selectedPanel.panelType === 'sliding' && selectedPanel.openingDirection === 'sliding_right'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Slide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'casement', 'casement_left')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  selectedPanel.panelType === 'casement' && selectedPanel.openingDirection === 'casement_left'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Case L
              </button>
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'casement', 'casement_right')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  selectedPanel.panelType === 'casement' && selectedPanel.openingDirection === 'casement_right'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Case R
              </button>
              <button
                type="button"
                onClick={() => setBayOperation(selectedPanel.id, 'casement', 'top_hung')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  selectedPanel.openingDirection === 'top_hung'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Top Hung
              </button>
            </div>

            {/* Split & Structure Actions */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <button
                type="button"
                onClick={() => splitBayVertically(selectedPanel.id)}
                className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                title="Split this bay vertically into two equal sub-bays"
              >
                <Columns className="w-3 h-3" />
                <span>+ Mullion</span>
              </button>
              <button
                type="button"
                onClick={toggleTransom}
                className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                title="Add or toggle horizontal transom bar"
              >
                <Rows className="w-3 h-3" />
                <span>+ Transom</span>
              </button>
              {design.panels.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteBay(selectedPanel.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="Delete this bay and merge with neighbor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectComponent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg ml-1"
                title="Deselect bay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Zoom Controls */}
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

        {/* Direct Dimension Edit Modal: Overall Width */}
        {isEditingWidth && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Overall Width (mm):</span>
            <input
              type="number"
              value={tempWidth}
              onChange={(e) => setTempWidth(e.target.value)}
              className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitWidth()}
            />
            <button
              onClick={submitWidth}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button
              onClick={() => setIsEditingWidth(false)}
              className="px-2.5 py-1.5 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Direct Dimension Edit Modal: Overall Height */}
        {isEditingHeight && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Overall Height (mm):</span>
            <input
              type="number"
              value={tempHeight}
              onChange={(e) => setTempHeight(e.target.value)}
              className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitHeight()}
            />
            <button
              onClick={submitHeight}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button
              onClick={() => setIsEditingHeight(false)}
              className="px-2.5 py-1.5 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Direct Dimension Edit Modal: Arch Rise */}
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

        {/* Direct Dimension Edit Modal: Individual Bay Width */}
        {editingBayId && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Bay Width (mm):</span>
            <input
              type="number"
              value={tempBayWidth}
              onChange={(e) => setTempBayWidth(e.target.value)}
              className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitBayWidth(editingBayId)}
            />
            <button
              onClick={() => submitBayWidth(editingBayId)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button
              onClick={() => setEditingBayId(null)}
              className="px-2.5 py-1.5 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
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
