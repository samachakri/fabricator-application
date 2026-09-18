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
import { WindoorQuoteModal } from './WindoorQuoteModal';
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
  Trash2,
  Columns,
  Rows,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Shield,
  Layers,
  Check,
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
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // Drag over target cell tracking
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
  const [isDraggingOverTop, setIsDraggingOverTop] = useState(false);

  // Inline / Modal Dimension Editing States
  const [isEditingWidth, setIsEditingWidth] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempWidth, setTempWidth] = useState(String(design.width || 1800));
  const [tempHeight, setTempHeight] = useState(String(design.height || 1200));

  const [isEditingArchHeight, setIsEditingArchHeight] = useState(false);
  const [tempArchHeight, setTempArchHeight] = useState(String(design.archHeight || 500));

  // Editing Column Width
  const [editingColRange, setEditingColRange] = useState<{ start: number; end: number; widthMm: number } | null>(null);
  const [tempColWidth, setTempColWidth] = useState<string>('');

  // Editing Row Height
  const [editingRowRange, setEditingRowRange] = useState<{ start: number; end: number; heightMm: number } | null>(null);
  const [tempRowHeight, setTempRowHeight] = useState<string>('');

  // Overall Dimensions
  const panels = design.panels || [];
  const isStandaloneArch = Boolean(design.hasArch && (panels.length === 0 || (design.height || 0) === 0));
  const width = Math.max(400, design.width || 1800);
  const archHeight = design.hasArch ? (design.archHeight || 600) : 0;
  const height = isStandaloneArch ? 0 : Math.max(300, design.height || 1200);
  const totalWindowHeight = isStandaloneArch ? archHeight + 260 : height + archHeight;

  // CAD Canvas ViewBox Dimensions with padding for precision dimension lines
  const padX = 180;
  const padY = 160;
  const vbWidth = width + padX * 2;
  const vbHeight = totalWindowHeight + padY * 2 + 40;

  const winX = padX;
  const winY = padY + archHeight; // Rectangular base starts below arch

  const frameFace = 60; // 60mm outer frame profile extrusion width
  const innerX = winX + frameFace;
  const innerY = winY + frameFace;
  const innerW = Math.max(200, width - frameFace * 2);
  const innerH = Math.max(200, isStandaloneArch ? 200 : height - frameFace * 2);

  const hasElements = panels.length > 0 || Boolean(design.hasArch);

  // Selected cell
  const selectedPanel = panels.find((p) => p.id === selectedComponentId) || null;

  // Zoom Controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(180, z + 10));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 10));
  const handleZoomReset = () => setZoomLevel(100);

  // Submit Total Width
  const submitWidth = () => {
    setIsEditingWidth(false);
    const val = Number(tempWidth);
    if (val >= 400 && val <= 6000 && onDimensionChange) {
      onDimensionChange(val, height);
    } else {
      setTempWidth(String(width));
    }
  };

  // Submit Total Height
  const submitHeight = () => {
    setIsEditingHeight(false);
    const val = Number(tempHeight);
    if (val >= 300 && val <= 4000 && onDimensionChange) {
      onDimensionChange(width, val);
    } else {
      setTempHeight(String(height));
    }
  };

  // Submit Arch Rise
  const submitArchHeight = () => {
    setIsEditingArchHeight(false);
    const val = Number(tempArchHeight);
    if (val >= 150 && val <= 2500 && onUpdateDesign) {
      onUpdateDesign({ ...design, archHeight: val });
    } else {
      setTempArchHeight(String(design.archHeight || 500));
    }
  };

  // =========================================================================
  // PRECISION COLUMN & ROW BOUNDARY EXTRACTION
  // =========================================================================

  // Find unique vertical column boundaries [xStart, xEnd]
  const colBoundariesSet = new Set<number>([0, 1]);
  panels.forEach((p) => {
    const x0 = parseFloat(Number(p.xRatio || 0).toFixed(4));
    const x1 = parseFloat(Number((p.xRatio || 0) + (p.widthRatio || 1)).toFixed(4));
    colBoundariesSet.add(x0);
    colBoundariesSet.add(x1);
  });
  const sortedX = Array.from(colBoundariesSet).sort((a, b) => a - b);
  const columnIntervals: { start: number; end: number; widthMm: number }[] = [];
  for (let i = 0; i < sortedX.length - 1; i++) {
    const start = sortedX[i];
    const end = sortedX[i + 1];
    if (end - start > 0.02) {
      columnIntervals.push({
        start,
        end,
        widthMm: Math.round(innerW * (end - start)),
      });
    }
  }

  // Find unique horizontal row boundaries [yStart, yEnd]
  const rowBoundariesSet = new Set<number>([0, 1]);
  panels.forEach((p) => {
    const y0 = parseFloat(Number(p.yRatio || 0).toFixed(4));
    const y1 = parseFloat(Number((p.yRatio || 0) + (p.heightRatio || 1)).toFixed(4));
    rowBoundariesSet.add(y0);
    rowBoundariesSet.add(y1);
  });
  const sortedY = Array.from(rowBoundariesSet).sort((a, b) => a - b);
  const rowIntervals: { start: number; end: number; heightMm: number }[] = [];
  for (let i = 0; i < sortedY.length - 1; i++) {
    const start = sortedY[i];
    const end = sortedY[i + 1];
    if (end - start > 0.02) {
      rowIntervals.push({
        start,
        end,
        heightMm: Math.round(innerH * (end - start)),
      });
    }
  }

  // Submit Column Width Edit
  const submitColumnWidth = () => {
    if (!editingColRange || !onUpdateDesign) {
      setEditingColRange(null);
      return;
    }
    const targetMm = Number(tempColWidth);
    if (!targetMm || targetMm < 150) {
      setEditingColRange(null);
      return;
    }

    const currentSpan = editingColRange.end - editingColRange.start;
    const targetSpan = targetMm / innerW;
    if (targetSpan >= 0.95 || targetSpan <= 0.05) {
      setEditingColRange(null);
      return;
    }

    const diff = targetSpan - currentSpan;
    const otherSpan = 1 - currentSpan;
    if (otherSpan <= 0.05) {
      setEditingColRange(null);
      return;
    }

    // Scale other intervals proportionately
    const scale = (otherSpan - diff) / otherSpan;
    const updated = panels.map((p) => {
      const pX0 = p.xRatio || 0;
      const pW = p.widthRatio || 1;
      const pX1 = pX0 + pW;

      // If panel is inside the edited column interval
      if (Math.abs(pX0 - editingColRange.start) < 0.02 && Math.abs(pX1 - editingColRange.end) < 0.02) {
        return {
          ...p,
          widthRatio: targetSpan,
        };
      }
      return p;
    });

    // Recompute X positions cleanly
    let curX = 0;
    const recomputed = updated.map((p) => {
      const w = p.widthRatio;
      const res = { ...p, xRatio: curX };
      curX += w;
      return res;
    });

    onUpdateDesign({
      ...design,
      panels: recomputed,
    });
    setEditingColRange(null);
  };

  // Submit Row Height Edit
  const submitRowHeight = () => {
    if (!editingRowRange || !onUpdateDesign) {
      setEditingRowRange(null);
      return;
    }
    const targetMm = Number(tempRowHeight);
    if (!targetMm || targetMm < 150) {
      setEditingRowRange(null);
      return;
    }

    const currentSpan = editingRowRange.end - editingRowRange.start;
    const targetSpan = targetMm / innerH;
    if (targetSpan >= 0.95 || targetSpan <= 0.05) {
      setEditingRowRange(null);
      return;
    }

    const diff = targetSpan - currentSpan;
    const otherSpan = 1 - currentSpan;
    if (otherSpan <= 0.05) {
      setEditingRowRange(null);
      return;
    }

    const scale = (otherSpan - diff) / otherSpan;
    const updated = panels.map((p) => {
      const pY0 = p.yRatio || 0;
      const pH = p.heightRatio || 1;
      const pY1 = pY0 + pH;

      if (Math.abs(pY0 - editingRowRange.start) < 0.02 && Math.abs(pY1 - editingRowRange.end) < 0.02) {
        return {
          ...p,
          heightRatio: targetSpan,
        };
      } else {
        return {
          ...p,
          heightRatio: pH * scale,
        };
      }
    });

    // Recompute Y positions
    const recomputed = updated.map((p) => {
      const isTop = (p.yRatio || 0) < 0.2;
      return {
        ...p,
        yRatio: isTop ? 0 : targetSpan,
      };
    });

    onUpdateDesign({
      ...design,
      panels: recomputed,
      transoms: [{ id: 'transom-01', positionRatio: targetSpan, height: 60 }],
    });
    setEditingRowRange(null);
  };

  // =========================================================================
  // BACKEND LOGIC: SPLITTING CELLS & ADDING ELEMENTS
  // =========================================================================

  // Split a specific cell vertically into two cells
  const splitCellVertically = (cellId: string) => {
    if (!onUpdateDesign) return;
    const idx = panels.findIndex((p) => p.id === cellId);
    if (idx === -1) return;

    const target = panels[idx];
    const halfW = (target.widthRatio || 1) / 2;

    const cellA: DesignPanel = {
      ...target,
      id: `cell-${Date.now()}-A`,
      name: `${target.name || 'A'}-1`,
      widthRatio: halfW,
    };
    const cellB: DesignPanel = {
      ...target,
      id: `cell-${Date.now()}-B`,
      name: `${target.name || 'A'}-2`,
      xRatio: (target.xRatio || 0) + halfW,
      widthRatio: halfW,
      openingDirection: target.openingDirection === 'sliding_right' ? 'sliding_left' : 'sliding_right',
      sashId: `sash-${Date.now()}-B`,
      glassId: `glass-${Date.now()}-B`,
    };

    const nextPanels = [...panels];
    nextPanels.splice(idx, 1, cellA, cellB);

    // Re-index names cleanly
    const renumbered = nextPanels.map((p, i) => ({
      ...p,
      name: `A${i + 1}`,
    }));

    onUpdateDesign({
      ...design,
      panels: renumbered,
    });
    onSelectComponent(cellA.id, 'panel');
  };

  // Split a specific cell horizontally into two cells (Top & Bottom Transom)
  const splitCellHorizontally = (cellId: string) => {
    if (!onUpdateDesign) return;
    const idx = panels.findIndex((p) => p.id === cellId);
    if (idx === -1) return;

    const target = panels[idx];
    const topH = 0.35 * (target.heightRatio || 1);
    const botH = 0.65 * (target.heightRatio || 1);

    const cellTop: DesignPanel = {
      ...target,
      id: `cell-${Date.now()}-top`,
      name: `T${idx + 1}`,
      panelType: 'casement' as const,
      openingDirection: 'top_hung' as const,
      yRatio: target.yRatio || 0,
      heightRatio: topH,
      sashId: `sash-${Date.now()}-top`,
      glassId: `glass-${Date.now()}-top`,
    };
    const cellBot: DesignPanel = {
      ...target,
      id: `cell-${Date.now()}-bot`,
      name: `B${idx + 1}`,
      yRatio: (target.yRatio || 0) + topH,
      heightRatio: botH,
      sashId: `sash-${Date.now()}-bot`,
      glassId: `glass-${Date.now()}-bot`,
    };

    const nextPanels = [...panels];
    nextPanels.splice(idx, 1, cellTop, cellBot);

    onUpdateDesign({
      ...design,
      panels: nextPanels,
      transoms: [{ id: 'transom-01', positionRatio: 0.35, height: 60 }],
    });
    onSelectComponent(cellBot.id, 'panel');
  };

  // Delete / Merge a cell with its adjacent neighbor
  const deleteCell = (cellId: string) => {
    if (!onUpdateDesign || panels.length <= 1) return;
    const idx = panels.findIndex((p) => p.id === cellId);
    if (idx === -1) return;

    const target = panels[idx];
    const filtered = panels.filter((p) => p.id !== cellId);

    // If deleting from same row, distribute width
    const sameRow = filtered.filter((p) => Math.abs((p.yRatio || 0) - (target.yRatio || 0)) < 0.05);
    if (sameRow.length > 0) {
      const neighbor = sameRow[0];
      const updated = filtered.map((p) => {
        if (p.id === neighbor.id) {
          return {
            ...p,
            widthRatio: (p.widthRatio || 0) + (target.widthRatio || 0),
            xRatio: Math.min(p.xRatio || 0, target.xRatio || 0),
          };
        }
        return p;
      });
      onUpdateDesign({ ...design, panels: updated });
    } else {
      // Scale remaining panels
      const factor = 1 / (1 - (target.widthRatio || 0.5));
      let curX = 0;
      const updated = filtered.map((p) => {
        const nw = (p.widthRatio || 0.5) * factor;
        const res = { ...p, xRatio: curX, widthRatio: nw };
        curX += nw;
        return res;
      });
      onUpdateDesign({ ...design, panels: updated });
    }
    onSelectComponent(null);
  };

  // Set opening operation for a cell
  const setCellOperation = (
    cellId: string,
    type: 'fixed' | 'sliding' | 'casement',
    dir: OpeningDirectionType
  ) => {
    if (!onUpdateDesign) return;
    const updated = panels.map((p) => {
      if (p.id === cellId) {
        return {
          ...p,
          panelType: type,
          openingDirection: dir,
          sashId: type === 'fixed' ? undefined : (p.sashId || `sash-${p.id}`),
        };
      }
      return p;
    });
    onUpdateDesign({ ...design, panels: updated });
  };

  // Toggle Bug Mesh on Cell
  const toggleCellMesh = (cellId: string) => {
    if (!onUpdateDesign) return;
    const updated = panels.map((p) => {
      if (p.id === cellId) {
        return {
          ...p,
          meshId: p.meshId ? undefined : `mesh-${p.id}`,
        };
      }
      return p;
    });
    onUpdateDesign({ ...design, panels: updated });
  };

  // Toggle Arch Head
  const toggleArch = (style: 'round' | 'gothic' = 'round') => {
    if (!onUpdateDesign) return;
    if (design.hasArch) {
      onUpdateDesign({
        ...design,
        hasArch: false,
        archHeight: 0,
        windowType: panels.length > 0 ? 'Sliding Window' : 'Sliding Window',
      });
    } else {
      const hasPanels = design.panels && design.panels.length > 0;
      onUpdateDesign({
        ...design,
        hasArch: true,
        archType: style,
        archHeight: 600,
        height: hasPanels ? design.height || 1200 : 0,
        panels: hasPanels ? design.panels : [],
        windowType: hasPanels ? 'Combination Window' : 'Arch Window',
      });
    }
  };

  // =========================================================================
  // UNIVERSAL ELEMENT APPLICATION (DRAG & DROP OR PALETTE CLICK)
  // =========================================================================
  const applyElementToCanvas = (itemId: string, targetCellId?: string) => {
    if (!onUpdateDesign) return;

    if (!isConfigPanelOpen && onToggleConfigPanel) {
      onToggleConfigPanel();
    }

    const updated = { ...design };

    // 1. Arch Head Elements (Supports Standalone Arch, Replacement, or Combination)
    if (itemId === 'shape_arch_round' || itemId === 'shape_arch_gothic' || itemId === 'shape_circle') {
      const hasPanels = updated.panels && updated.panels.length > 0;
      const newArchType = itemId === 'shape_arch_gothic' ? 'gothic' : 'round';
      updated.hasArch = true;
      updated.archType = newArchType;
      updated.archHeight = updated.archHeight || 600;
      if (!hasPanels) {
        // Standalone Arch Window
        updated.height = 0;
        updated.panels = [];
        updated.windowType = 'Arch Window';
      } else {
        // Arch + Window Combination
        updated.height = updated.height || 1200;
        updated.windowType = 'Combination Window';
      }
      onUpdateDesign(updated);
      onSelectComponent('arch-head', 'arch');
      return;
    }

    // 2. Base Frame Shapes (Replaces / Initializes Layout, or attaches below standalone arch)
    if (itemId === 'shape_rect_1') {
      if (updated.hasArch && (!updated.height || updated.height === 0)) {
        updated.height = 1200;
        updated.windowType = 'Combination Window';
      }
      updated.panels = [
        {
          id: 'panel-01',
          name: 'A1',
          panelType: 'fixed',
          openingDirection: 'fixed',
          xRatio: 0,
          widthRatio: 1,
          yRatio: 0,
          heightRatio: 1,
          glassId: 'glass-01',
        },
      ];
      updated.mullions = [];
      updated.transoms = [];
      onUpdateDesign(updated);
      return;
    }

    if (itemId === 'shape_rect_2') {
      if (updated.hasArch && (!updated.height || updated.height === 0)) {
        updated.height = 1200;
        updated.windowType = 'Combination Window';
      }
      updated.panels = [
        {
          id: 'panel-01',
          name: 'A1',
          panelType: 'sliding',
          openingDirection: 'sliding_right',
          xRatio: 0,
          widthRatio: 0.5,
          yRatio: 0,
          heightRatio: 1,
          sashId: 'sash-01',
          glassId: 'glass-01',
        },
        {
          id: 'panel-02',
          name: 'A2',
          panelType: 'sliding',
          openingDirection: 'sliding_left',
          xRatio: 0.5,
          widthRatio: 0.5,
          yRatio: 0,
          heightRatio: 1,
          sashId: 'sash-02',
          glassId: 'glass-02',
        },
      ];
      updated.mullions = [{ id: 'mullion-01', positionRatio: 0.5, width: 60 }];
      updated.transoms = [];
      onUpdateDesign(updated);
      return;
    }

    if (itemId === 'shape_rect_3') {
      if (updated.hasArch && (!updated.height || updated.height === 0)) {
        updated.height = 1200;
        updated.windowType = 'Combination Window';
      }
      const pCount = 3;
      updated.panels = Array.from({ length: pCount }, (_, i) => ({
        id: `panel-0${i + 1}`,
        name: `A${i + 1}`,
        panelType: 'sliding' as const,
        openingDirection: i === 0 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        yRatio: 0,
        heightRatio: 1,
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
      if (updated.hasArch && (!updated.height || updated.height === 0)) {
        updated.height = 1200;
        updated.windowType = 'Combination Window';
      }
      const pCount = 4;
      updated.panels = Array.from({ length: pCount }, (_, i) => ({
        id: `panel-0${i + 1}`,
        name: `A${i + 1}`,
        panelType: 'sliding' as const,
        openingDirection: i < 2 ? ('sliding_right' as const) : ('sliding_left' as const),
        xRatio: i / pCount,
        widthRatio: 1 / pCount,
        yRatio: 0,
        heightRatio: 1,
        sashId: `sash-0${i + 1}`,
        glassId: `glass-0${i + 1}`,
      }));
      onUpdateDesign(updated);
      return;
    }

    // 3. Vertical Mullion: Split target cell or widest cell
    if (itemId === 'mullion_vertical') {
      const targetId = targetCellId || selectedComponentId;
      if (targetId) {
        splitCellVertically(targetId);
      } else if (panels.length > 0) {
        const widest = [...panels].sort((a, b) => (b.widthRatio || 0) - (a.widthRatio || 0))[0];
        splitCellVertically(widest.id);
      } else {
        applyElementToCanvas('shape_rect_2');
      }
      return;
    }

    // 4. Horizontal Transom: Split target cell or add global transom
    if (itemId === 'transom_horizontal') {
      const targetId = targetCellId || selectedComponentId;
      if (targetId) {
        splitCellHorizontally(targetId);
      } else {
        // Global transom across all panels
        const topH = 0.35;
        const botH = 0.65;
        const topCells = panels.map((p, i) => ({
          ...p,
          id: `cell-top-${i + 1}`,
          name: `T${i + 1}`,
          panelType: 'casement' as const,
          openingDirection: 'top_hung' as const,
          yRatio: 0,
          heightRatio: topH,
        }));
        const botCells = panels.map((p, i) => ({
          ...p,
          id: `cell-bot-${i + 1}`,
          name: `B${i + 1}`,
          yRatio: topH,
          heightRatio: botH,
        }));
        onUpdateDesign({
          ...design,
          panels: [...topCells, ...botCells],
          transoms: [{ id: 'transom-01', positionRatio: topH, height: 60 }],
        });
      }
      return;
    }

    // 5. Operational Sashes & Mesh (Applied to target or selected cell)
    const activeTargetId = targetCellId || selectedComponentId || panels[0]?.id;

    if (itemId === 'sash_sliding_left') {
      if (activeTargetId) setCellOperation(activeTargetId, 'sliding', 'sliding_left');
      return;
    }
    if (itemId === 'sash_sliding_right') {
      if (activeTargetId) setCellOperation(activeTargetId, 'sliding', 'sliding_right');
      return;
    }
    if (itemId === 'sash_casement_left') {
      if (activeTargetId) setCellOperation(activeTargetId, 'casement', 'casement_left');
      return;
    }
    if (itemId === 'sash_casement_right') {
      if (activeTargetId) setCellOperation(activeTargetId, 'casement', 'casement_right');
      return;
    }
    if (itemId === 'sash_top_hung') {
      if (activeTargetId) setCellOperation(activeTargetId, 'casement', 'top_hung');
      return;
    }
    if (itemId === 'sash_tilt_turn') {
      if (activeTargetId) setCellOperation(activeTargetId, 'casement', 'tilt_turn');
      return;
    }
    if (itemId === 'sash_fixed') {
      if (activeTargetId) setCellOperation(activeTargetId, 'fixed', 'fixed');
      return;
    }
    if (itemId === 'sash_louver') {
      if (activeTargetId) setCellOperation(activeTargetId, 'louver' as any, 'fixed');
      return;
    }
    if (itemId === 'mesh_bug') {
      if (activeTargetId) toggleCellMesh(activeTargetId);
      return;
    }

    // Fallback if empty canvas
    if (panels.length === 0) {
      applyElementToCanvas('shape_rect_2');
    }
  };

  // Clear Canvas
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

  const areaSqM = parseFloat(((width * totalWindowHeight) / 1000000).toFixed(2));
  const seriesDisplayName = design.seriesName || 'S_CRAFT_PREMIUM_SLIDING_SERIES';

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-white text-slate-800 font-sans">
      {/* 1. Left Docked WindoorCraft Two-Tier Shape & Element Palette */}
      <DraggableShapePalette
        onSelectItem={(item) => applyElementToCanvas(item.id)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenQuote={() => setIsQuoteOpen(true)}
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)}
      />

      {/* 2. Main Precision CAD Canvas Area (Clean Architectural Light Theme) */}
      <div
        className="relative flex-1 h-full overflow-hidden flex flex-col items-center justify-center p-4 bg-[#f8fafc]"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const itemId = e.dataTransfer.getData('text/plain');
          applyElementToCanvas(itemId);
          setHoveredCellId(null);
        }}
      >
        {/* Top Header & Breadcrumb Bar (Matching WindoorCraft wc_07_shape1.png) */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Window Identifier & Title */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
            <span className="text-xs font-black uppercase text-blue-600 tracking-wider font-mono">
              {design.id || 'W01'}
            </span>
            <span className="text-slate-300">|</span>
            <input
              type="text"
              value={design.name || ''}
              placeholder="Window Name (e.g. Master Bedroom, Balcony)..."
              onChange={(e) => {
                if (onUpdateDesign) {
                  onUpdateDesign({ ...design, name: e.target.value });
                }
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none w-44 sm:w-64"
            />
          </div>

          {/* Center WindoorCraft Breadcrumb: {SERIES_NAME} / {Area} m² / {N} openings */}
          <div className="hidden md:flex items-center bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-auto text-xs font-medium text-blue-600 font-mono">
            <span className="font-bold hover:underline cursor-pointer" onClick={() => setIsCatalogOpen(true)}>
              {seriesDisplayName}
            </span>
            <span className="text-slate-400 mx-1.5">/</span>
            <span className="text-slate-700">{areaSqM}m²</span>
            <span className="text-slate-400 mx-1.5">/</span>
            <span className="text-slate-700">{panels.length} openings</span>
          </div>

          {/* Right Mode Switchers & Details Toggle */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
            {(hasElements || viewMode === '3d') && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                {viewMode === '3d' ? (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to 2D CAD</span>
                  </>
                ) : (
                  <>
                    <Box className="w-3.5 h-3.5" />
                    <span>3D</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="px-2.5 py-1.5 rounded-md text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Select from catalog templates"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>

            {hasElements && (
              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Sidebar Toggle for Right Details Panel */}
            {onToggleConfigPanel && (
              <>
                <div className="w-px h-4 bg-slate-200 mx-0.5" />
                <button
                  type="button"
                  onClick={onToggleConfigPanel}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isConfigPanelOpen
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={isConfigPanelOpen ? 'Hide Inspector' : 'Show Inspector'}
                >
                  {isConfigPanelOpen ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRight className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Inspector</span>
                </button>
              </>
            )}
          </div>
        </div>


        {/* ------------------------------------------------------------- */}
        {/* BLANK STATE: CLEAN CAD BLUEPRINT LAYOUT                      */}
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

              {/* Top Width Dimension */}
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

              {/* Left Height Dimension */}
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

              {/* Interactive Quick-Add Options on Empty Canvas */}
              <g transform={`translate(${winX + width / 2}, ${winY + height / 2 - 50})`}>
                <text
                  x="0"
                  y="-15"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="15"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  Canvas Cleared • Select a Window Configuration or Drag from Palette:
                </text>

                <g transform="translate(-255, 20)">
                  {/* Option 1: 2-Panel Sliding */}
                  <g
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyElementToCanvas('shape_rect_2');
                    }}
                  >
                    <rect width="160" height="52" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="group-hover:fill-indigo-900 transition-colors" />
                    <text x="80" y="24" fill="#e0e7ff" fontSize="12" fontWeight="bold" textAnchor="middle">+ 2-Panel Sliding</text>
                    <text x="80" y="41" fill="#818cf8" fontSize="10" textAnchor="middle">2-Track Window (Standard)</text>
                  </g>

                  {/* Option 2: 3-Panel Sliding */}
                  <g
                    transform="translate(175, 0)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyElementToCanvas('shape_rect_3');
                    }}
                  >
                    <rect width="160" height="52" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="group-hover:fill-indigo-900 transition-colors" />
                    <text x="80" y="24" fill="#e0e7ff" fontSize="12" fontWeight="bold" textAnchor="middle">+ 3-Panel Sliding</text>
                    <text x="80" y="41" fill="#818cf8" fontSize="10" textAnchor="middle">3-Track System</text>
                  </g>

                  {/* Option 3: Arch Combination */}
                  <g
                    transform="translate(350, 0)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyElementToCanvas('shape_arch_round');
                      applyElementToCanvas('shape_rect_2');
                    }}
                  >
                    <rect width="160" height="52" rx="10" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" className="group-hover:fill-purple-950 transition-colors" />
                    <text x="80" y="24" fill="#f3e8ff" fontSize="12" fontWeight="bold" textAnchor="middle">+ Arch Combination</text>
                    <text x="80" y="41" fill="#c084fc" fontSize="10" textAnchor="middle">Arch + 2-Door Window</text>
                  </g>

                  {/* Option 4: Gothic Arch Head */}
                  <g
                    transform="translate(85, 68)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyElementToCanvas('shape_arch_gothic');
                    }}
                  >
                    <rect width="160" height="46" rx="10" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" className="group-hover:fill-purple-950 transition-colors" />
                    <text x="80" y="22" fill="#f3e8ff" fontSize="12" fontWeight="bold" textAnchor="middle">+ Gothic Arch Head</text>
                    <text x="80" y="36" fill="#c084fc" fontSize="10" textAnchor="middle">Pointed Architectural</text>
                  </g>

                  {/* Option 5: 1-Panel Casement */}
                  <g
                    transform="translate(265, 68)"
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyElementToCanvas('shape_rect_1');
                    }}
                  >
                    <rect width="160" height="46" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" className="group-hover:fill-slate-800 transition-colors" />
                    <text x="80" y="22" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">+ 1-Panel Casement</text>
                    <text x="80" y="36" fill="#94a3b8" fontSize="10" textAnchor="middle">Fixed or Hinged</text>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        ) : viewMode === '3d' ? (
          /* 3D WebGL Engine */
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Precision3DView design={design} onClose={() => setViewMode('2d')} />
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* 2D TECHNICAL CAD ELEVATION: TRUE MULTI-ELEMENT PARAMETRIC SVG */
          /* ------------------------------------------------------------- */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out select-none"
            style={{ transform: `scale(${zoomLevel / 100})` }}
            onClick={(e) => {
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
                <linearGradient id="windoorGreenGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e676" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#00c853" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="glassFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e676" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#00c853" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f8fafc" />
                </linearGradient>

                <linearGradient id="archGlassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00e676" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#00c853" stopOpacity="0.95" />
                </linearGradient>

                <pattern id="cadGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="0.8" fill="#94a3b8" opacity="0.35" />
                </pattern>

                {/* Bug mesh pattern */}
                <pattern id="meshGridPattern" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#0f172a" strokeWidth="0.6" opacity="0.3" />
                </pattern>
              </defs>

              {/* Background CAD Grid on Clean White */}
              <rect width={vbWidth} height={vbHeight} fill="#ffffff" />
              <rect width={vbWidth} height={vbHeight} fill="url(#cadGrid)" />


              {/* ============================================================= */}
              {/* 1. ARCH HEAD COMBINATION (Attached on top of window frame)    */}
              {/* ============================================================= */}
              {design.hasArch && (
                <g
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent('arch-head', 'arch');
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const itemId = e.dataTransfer.getData('text/plain');
                    applyElementToCanvas(itemId || 'shape_arch_round');
                  }}
                >
                  {/* Outer Arch Frame Profile */}
                  <path
                    d={
                      design.archType === 'gothic'
                        ? `M ${winX} ${winY} Q ${winX} ${winY - archHeight * 0.88} ${winX + width / 2} ${winY - archHeight} Q ${winX + width} ${winY - archHeight * 0.88} ${winX + width} ${winY} Z`
                        : `M ${winX} ${winY} A ${width / 2} ${archHeight} 0 0 1 ${winX + width} ${winY} Z`
                    }
                    fill="url(#frameGradient)"
                    stroke={selectedComponentId === 'arch-head' ? '#c084fc' : '#ffffff'}
                    strokeWidth={selectedComponentId === 'arch-head' ? '4' : '2.5'}
                    className="cursor-pointer hover:stroke-purple-400 transition-colors"
                  />
                  {/* Inner Arch Glass Opening */}
                  <path
                    d={
                      design.archType === 'gothic'
                        ? `M ${innerX} ${winY} Q ${innerX} ${winY - Math.max(50, archHeight - frameFace) * 0.88} ${innerX + innerW / 2} ${winY - Math.max(50, archHeight - frameFace)} Q ${innerX + innerW} ${winY - Math.max(50, archHeight - frameFace) * 0.88} ${innerX + innerW} ${winY} Z`
                        : `M ${innerX} ${winY} A ${innerW / 2} ${Math.max(50, archHeight - frameFace)} 0 0 1 ${innerX + innerW} ${winY} Z`
                    }
                    fill="url(#archGlassGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                  />

                  {/* Mullions / Spokes */}
                  {design.archType === 'gothic' ? (
                    // Gothic Pointed Arch Mullions
                    <>
                      {/* Center Apex Mullion */}
                      <line
                        x1={winX + width / 2}
                        y1={winY}
                        x2={winX + width / 2}
                        y2={winY - Math.max(50, archHeight - frameFace)}
                        stroke="#e2e8f0"
                        strokeWidth="2.5"
                      />
                      {/* Left Lancet Mullion */}
                      <line
                        x1={winX + width * 0.28}
                        y1={winY}
                        x2={winX + width * 0.28}
                        y2={winY - Math.max(50, archHeight - frameFace) * 0.65}
                        stroke="#e2e8f0"
                        strokeWidth="1.8"
                        strokeDasharray="2 1"
                      />
                      {/* Right Lancet Mullion */}
                      <line
                        x1={winX + width * 0.72}
                        y1={winY}
                        x2={winX + width * 0.72}
                        y2={winY - Math.max(50, archHeight - frameFace) * 0.65}
                        stroke="#e2e8f0"
                        strokeWidth="1.8"
                        strokeDasharray="2 1"
                      />
                    </>
                  ) : (
                    // Sunburst Radial Mullions
                    Array.from({ length: 5 }, (_, i) => {
                      const angleDeg = 30 + i * 30;
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
                    })
                  )}

                  {/* Arch Head Badge */}
                  <g transform={`translate(${winX + width / 2}, ${winY - archHeight / 2})`}>
                    <rect
                      x="-85"
                      y="-14"
                      width="170"
                      height="28"
                      rx="14"
                      fill="#0f172a"
                      stroke={design.archType === 'gothic' ? '#a855f7' : '#c084fc'}
                      strokeWidth="1.5"
                      className="shadow-md"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={design.archType === 'gothic' ? '#d8b4fe' : '#c084fc'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {design.archType === 'gothic' ? 'Gothic Pointed Arch (Fixed)' : 'Semi-Circular Arch (Fixed)'}
                    </text>
                  </g>

                  {/* Quick Controls when Arch Head is Selected */}
                  {selectedComponentId === 'arch-head' && (
                    <g transform={`translate(${winX + width / 2}, ${winY - archHeight - 22})`}>
                      {/* Switch Style Button */}
                      <g
                        className="cursor-pointer hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpdateDesign) {
                            onUpdateDesign({
                              ...design,
                              archType: design.archType === 'gothic' ? 'round' : 'gothic',
                            });
                          }
                        }}
                      >
                        <rect x="-105" y="-12" width="145" height="24" rx="12" fill="#581c87" stroke="#c084fc" strokeWidth="1.2" />
                        <text x="-32" y="4" fill="#f3e8ff" fontSize="10" fontWeight="bold" textAnchor="middle">
                          ⇄ Switch to {design.archType === 'gothic' ? 'Round' : 'Gothic'}
                        </text>
                      </g>

                      {/* Remove Arch Button */}
                      <g
                        className="cursor-pointer hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpdateDesign) {
                            onUpdateDesign({
                              ...design,
                              hasArch: false,
                              archHeight: 0,
                              windowType: panels.length > 0 ? 'Sliding Window' : 'Sliding Window',
                            });
                            onSelectComponent(null);
                          }
                        }}
                      >
                        <rect x="48" y="-12" width="62" height="24" rx="12" fill="#881337" stroke="#fda4af" strokeWidth="1.2" />
                        <text x="79" y="4" fill="#ffe4e6" fontSize="10" fontWeight="bold" textAnchor="middle">
                          ✕ Delete
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Coupling Transom Profile Beam */}
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

              {/* Top Boundary Drop Zone when NO Arch is present */}
              {!design.hasArch && (
                <g
                  className="cursor-pointer group"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const itemId = e.dataTransfer.getData('text/plain');
                    applyElementToCanvas(itemId || 'shape_arch_round');
                  }}
                >
                  <rect
                    x={winX}
                    y={winY - 35}
                    width={width}
                    height="35"
                    fill="transparent"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                  />
                  <text
                    x={winX + width / 2}
                    y={winY - 14}
                    textAnchor="middle"
                    fill="#c084fc"
                    fontSize="11"
                    fontWeight="bold"
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    + Drop Arch Head Here
                  </text>
                </g>
              )}

              {/* ============================================================= */}
              {/* 2. RECTANGULAR WINDOW OUTER FRAME (OR STANDALONE ARCH ATTACHMENT) */}
              {/* ============================================================= */}
              {isStandaloneArch ? (
                /* STANDALONE ARCH WINDOW DROPZONE & ATTACHMENT SECTION */
                <g
                  className="cursor-pointer group"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const itemId = e.dataTransfer.getData('text/plain');
                    applyElementToCanvas(itemId || 'shape_rect_2');
                  }}
                >
                  {/* Bottom Arch Sill Profile */}
                  <rect
                    x={winX}
                    y={winY}
                    width={width}
                    height="18"
                    fill="url(#frameGradient)"
                    stroke="#ffffff"
                    strokeWidth="2"
                    rx="2"
                  />

                  {/* Dashed Attachment Zone below Arch */}
                  <rect
                    x={winX}
                    y={winY + 36}
                    width={width}
                    height="200"
                    rx="12"
                    fill="#0b1329"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                    className="hover:stroke-indigo-400 hover:fill-slate-900/80 transition-colors"
                  />

                  {/* Attachment Zone Callout */}
                  <g transform={`translate(${winX + width / 2}, ${winY + 95})`}>
                    <circle cx="0" cy="0" r="22" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                    <text x="0" y="7" fill="#818cf8" fontSize="24" fontWeight="bold" textAnchor="middle">
                      +
                    </text>
                    <text x="0" y="42" fill="#c7d2fe" fontSize="16" fontWeight="bold" textAnchor="middle">
                      Attach Window Below Arch
                    </text>
                    <text x="0" y="64" fill="#94a3b8" fontSize="12" textAnchor="middle">
                      Drag shapes from left palette here, or click a layout below:
                    </text>
                  </g>

                  {/* Quick Layout Attachment Buttons */}
                  <g transform={`translate(${winX + width / 2 - 210}, ${winY + 185})`}>
                    {/* 1 Panel Button */}
                    <g
                      className="cursor-pointer hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyElementToCanvas('shape_rect_1');
                      }}
                    >
                      <rect width="95" height="32" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                      <text x="47" y="20" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                        + 1-Panel
                      </text>
                    </g>
                    {/* 2 Panel Button */}
                    <g
                      transform="translate(110, 0)"
                      className="cursor-pointer hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyElementToCanvas('shape_rect_2');
                      }}
                    >
                      <rect width="95" height="32" rx="8" fill="#4f46e5" stroke="#818cf8" strokeWidth="1.5" />
                      <text x="47" y="20" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                        + 2-Panel
                      </text>
                    </g>
                    {/* 3 Panel Button */}
                    <g
                      transform="translate(220, 0)"
                      className="cursor-pointer hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyElementToCanvas('shape_rect_3');
                      }}
                    >
                      <rect width="95" height="32" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                      <text x="47" y="20" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                        + 3-Panel
                      </text>
                    </g>
                    {/* 4 Panel Button */}
                    <g
                      transform="translate(330, 0)"
                      className="cursor-pointer hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyElementToCanvas('shape_rect_4');
                      }}
                    >
                      <rect width="95" height="32" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                      <text x="47" y="20" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                        + 4-Panel
                      </text>
                    </g>
                  </g>
                </g>
              ) : (
                <g>
                  {/* Outer White Profile Extrusion */}
                  <rect
                    x={winX}
                    y={winY}
                    width={width}
                    height={height}
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="2"
                    rx="1"
                  />
                  {/* Corner Miter 45-degree joint lines */}
                  <line x1={winX} y1={winY} x2={innerX} y2={innerY} stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1={winX + width} y1={winY} x2={innerX + innerW} y2={innerY} stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1={winX} y1={winY + height} x2={innerX} y2={innerY + innerH} stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1={winX + width} y1={winY + height} x2={innerX + innerW} y2={innerY + innerH} stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Top Frame Series Label & AI Badge matching WindoorCraft wc_07_shape1.png */}
                  <text
                    x={winX + width / 2}
                    y={winY - 14}
                    fill="#0f172a"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    {seriesDisplayName}
                  </text>
                  <g transform={`translate(${winX + width - 26}, ${winY - 26})`}>
                    <rect width="22" height="18" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                    <text x="11" y="13" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">AI</text>
                  </g>

                  {/* Top-Left Red 4-Way Movement Crosshair Handle */}
                  <g transform={`translate(${winX - 10}, ${winY - 10})`} className="cursor-move">
                    <title>Window Canvas Handle</title>
                    <rect x="-3" y="-3" width="18" height="18" rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
                    <path d="M6 1 L6 11 M1 6 L11 6 M6 1 L4 3 M6 1 L8 3 M6 11 L4 9 M6 11 L8 9 M1 6 L3 4 M1 6 L3 8 M11 6 L9 4 M11 6 L9 8" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </g>
              )}

              {/* Inner frame perimeter opening */}
              <rect
                x={innerX}
                y={innerY}
                width={innerW}
                height={innerH}
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="1.8"
              />


              {/* ============================================================= */}
              {/* 3. MULTI-ELEMENT 2D CELLS (PANELS, SASHES, TRANSOMS, MULLIONS)*/}
              {/* ============================================================= */}
              {panels.map((panel, idx) => {
                const isSelected = selectedComponentId === panel.id;
                const isHovered = hoveredCellId === panel.id;

                // Accurate 2D Cell Coordinates & Sizes
                const pX = innerX + innerW * (panel.xRatio || 0);
                const pY = innerY + innerH * (panel.yRatio || 0);
                const pW = innerW * (panel.widthRatio || 1);
                const pH = innerH * (panel.heightRatio || 1);

                const glassW = Math.max(50, Math.round(panel.panelType === 'fixed' ? pW - 20 : pW - 90));
                const glassH = Math.max(50, Math.round(panel.panelType === 'fixed' ? pH - 20 : pH - 90));

                return (
                  <g
                    key={panel.id || idx}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(panel.id, 'panel');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'copy';
                      if (hoveredCellId !== panel.id) {
                        setHoveredCellId(panel.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoveredCellId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const itemId = e.dataTransfer.getData('text/plain');
                      applyElementToCanvas(itemId, panel.id);
                      setHoveredCellId(null);
                    }}
                  >
                    {/* Sash Outer Frame Profile */}
                    <rect
                      x={pX}
                      y={pY}
                      width={pW}
                      height={pH}
                      fill={isSelected ? '#1e293b' : isHovered ? '#1e293b/80' : '#ffffff'}
                      stroke={isSelected ? '#38bdf8' : isHovered ? '#22c55e' : '#94a3b8'}
                      strokeWidth={isSelected || isHovered ? '2.5' : '1.8'}
                      className="transition-colors duration-150"
                    />

                    {/* Glass Pane (Independently Selectable) */}
                    {(() => {
                      const isGlassSelected = selectedComponentId === panel.glassId;
                      return (
                        <g>
                          <rect
                            x={pX + 8}
                            y={pY + 8}
                            width={Math.max(10, pW - 16)}
                            height={Math.max(10, pH - 16)}
                            fill="url(#glassFillGradient)"
                            stroke={isGlassSelected ? '#38bdf8' : '#0284c7'}
                            strokeWidth={isGlassSelected ? '2.5' : '1.2'}
                            className="cursor-pointer hover:stroke-sky-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComponent(panel.glassId, 'glass');
                            }}
                          />
                          {isGlassSelected && (
                            <g className="pointer-events-none">
                              <rect
                                x={pX + 7}
                                y={pY + 7}
                                width={Math.max(10, pW - 14)}
                                height={Math.max(10, pH - 14)}
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="2.5"
                                strokeDasharray="5 3"
                                className="animate-pulse"
                              />
                            </g>
                          )}
                        </g>
                      );
                    })()}

                    {/* Horizontal Ventilation Louver Slats */}
                    {panel.panelType === 'louver' && (
                      <g className="pointer-events-none">
                        {(() => {
                          const count = Math.max(5, Math.min(20, Math.round(pH / 24)));
                          return Array.from({ length: count }, (_, lIdx) => {
                            const slatY = pY + 14 + (lIdx + 0.5) * ((pH - 28) / count);
                            return (
                            <g key={lIdx}>
                              <line
                                x1={pX + 12}
                                y1={slatY - 3}
                                x2={pX + pW - 12}
                                y2={slatY - 3}
                                stroke="#94a3b8"
                                strokeWidth="2.5"
                              />
                              <line
                                x1={pX + 12}
                                y1={slatY + 2}
                                x2={pX + pW - 12}
                                y2={slatY + 2}
                                stroke="#38bdf8"
                                strokeWidth="1.2"
                              />
                            </g>
                          );
                        });
                      })()}
                    </g>
                  )}

                    {/* Bug Mesh Overlay if enabled */}
                    {panel.meshId && (
                      <rect
                        x={pX + 8}
                        y={pY + 8}
                        width={Math.max(10, pW - 16)}
                        height={Math.max(10, pH - 16)}
                        fill="url(#meshGridPattern)"
                      />
                    )}

                    {/* Subtle Architectural Glass Reflection */}
                    <line
                      x1={pX + 12}
                      y1={pY + 12}
                      x2={pX + pW - 12}
                      y2={pY + pH - 12}
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      strokeDasharray="4 4"
                      className="opacity-40"
                    />

                    {/* Architectural Opening Symbols */}
                    {/* Sliding Left (◄) */}
                    {panel.openingDirection === 'sliding_left' && (
                      <g transform={`translate(${pX + pW / 2 - 18}, ${pY + 16})`}>
                        <rect width="36" height="18" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="24" y1="9" x2="10" y2="9" stroke="#38bdf8" strokeWidth="2" />
                        <polygon points="12,5 6,9 12,13" fill="#38bdf8" />
                      </g>
                    )}

                    {/* Sliding Right (►) */}
                    {panel.openingDirection === 'sliding_right' && (
                      <g transform={`translate(${pX + pW / 2 - 18}, ${pY + 16})`}>
                        <rect width="36" height="18" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="12" y1="9" x2="26" y2="9" stroke="#38bdf8" strokeWidth="2" />
                        <polygon points="24,5 30,9 24,13" fill="#38bdf8" />
                      </g>
                    )}

                    {/* Casement Left (◄ Hinged) */}
                    {panel.openingDirection === 'casement_left' && (
                      <polyline
                        points={`${pX + 14},${pY + 14} ${pX + pW - 14},${pY + pH / 2} ${pX + 14},${pY + pH - 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Casement Right (► Hinged) */}
                    {panel.openingDirection === 'casement_right' && (
                      <polyline
                        points={`${pX + pW - 14},${pY + 14} ${pX + 14},${pY + pH / 2} ${pX + pW - 14},${pY + pH - 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Top Hung / Awning */}
                    {panel.openingDirection === 'top_hung' && (
                      <polyline
                        points={`${pX + 14},${pY + 14} ${pX + pW / 2},${pY + pH - 14} ${pX + pW - 14},${pY + 14}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="opacity-90"
                      />
                    )}

                    {/* Tilt & Turn */}
                    {panel.openingDirection === 'tilt_turn' && (
                      <>
                        <polyline
                          points={`${pX + 14},${pY + pH - 14} ${pX + pW / 2},${pY + 14} ${pX + pW - 14},${pY + pH - 14}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <polyline
                          points={`${pX + 14},${pY + 14} ${pX + pW - 14},${pY + pH / 2} ${pX + 14},${pY + pH - 14}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="opacity-60"
                        />
                      </>
                    )}

                    {/* Central Cell Badge & Glass Dimensions matching WindoorCraft wc_07_shape1.png */}
                    <g transform={`translate(${pX + pW / 2}, ${pY + pH / 2})`}>
                      {/* Crisp Bold Opening Identifier (F1, F2, S1) */}
                      <text
                        x="0"
                        y="-4"
                        fill="#0f172a"
                        fontSize="18"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                      >
                        {panel.name || (panel.panelType === 'fixed' ? `F${idx + 1}` : `S${idx + 1}`)}
                      </text>

                      {/* Sliding Direction Arrows or Operation badge */}
                      {panel.panelType === 'sliding' && (
                        <text
                          x="0"
                          y="13"
                          fill="#0f172a"
                          fontSize="13"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {panel.openingDirection === 'sliding_left' ? '◄──' : '──►'}
                        </text>
                      )}

                      {/* Glass Cut Size */}
                      <text
                        x="0"
                        y={panel.panelType === 'sliding' ? "28" : "15"}
                        fill="#334155"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {glassW} × {glassH}
                      </text>
                    </g>


                    {/* Meeting Stile Handle if sliding / casement */}
                    {(panel.panelType === 'sliding' || panel.panelType === 'casement') && (
                      <rect
                        x={pX + (idx % 2 === 0 ? pW - 7 : 3)}
                        y={pY + pH / 2 - 22}
                        width="4"
                        height="44"
                        fill="#cbd5e1"
                        stroke="#475569"
                        strokeWidth="0.8"
                        rx="2"
                      />
                    )}

                    {/* Selection Active Border */}
                    {isSelected && (
                      <g>
                        <rect
                          x={pX - 2}
                          y={pY - 2}
                          width={pW + 4}
                          height={pH + 4}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          className="animate-pulse"
                        />
                        <circle cx={pX - 2} cy={pY - 2} r="4" fill="#38bdf8" />
                        <circle cx={pX + pW + 2} cy={pY - 2} r="4" fill="#38bdf8" />
                        <circle cx={pX - 2} cy={pY + pH + 2} r="4" fill="#38bdf8" />
                        <circle cx={pX + pW + 2} cy={pY + pH + 2} r="4" fill="#38bdf8" />
                      </g>
                    )}

                    {/* Drag Hover Target Indicator */}
                    {isHovered && (
                      <rect
                        x={pX}
                        y={pY}
                        width={pW}
                        height={pH}
                        fill="#22c55e"
                        fillOpacity="0.25"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeDasharray="4 4"
                      />
                    )}
                  </g>
                );
              })}

              {/* ============================================================= */}
              {/* 4. INTERNAL DIVISION MULLIONS & TRANSOMS BEAMS                */}
              {/* ============================================================= */}
              {/* Vertical Mullion Beams between distinct columns (Interactive & Selectable) */}
              {sortedX.slice(1, -1).map((xVal, i) => {
                const mX = innerX + innerW * xVal;
                const mullionId = design.mullions?.[i]?.id || `mullion-0${i + 1}`;
                const isMullionSelected = selectedComponentId === mullionId;
                return (
                  <g
                    key={i}
                    className="cursor-ew-resize group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(mullionId, 'mullion');
                    }}
                  >
                    {/* Wider invisible target area for easy clicking */}
                    <line
                      x1={mX}
                      y1={innerY}
                      x2={mX}
                      y2={innerY + innerH}
                      stroke="transparent"
                      strokeWidth="16"
                    />
                    {/* Visible Mullion Extrusion Beam */}
                    <line
                      x1={mX}
                      y1={innerY}
                      x2={mX}
                      y2={innerY + innerH}
                      stroke={isMullionSelected ? '#818cf8' : '#cbd5e1'}
                      strokeWidth={isMullionSelected ? '6' : '4'}
                      className="group-hover:stroke-indigo-400 transition-colors"
                    />
                  </g>
                );
              })}

              {/* Horizontal Transom Beams between distinct rows (Interactive & Selectable) */}
              {sortedY.slice(1, -1).map((yVal, i) => {
                const tY = innerY + innerH * yVal;
                const transomId = design.transoms?.[i]?.id || `transom-0${i + 1}`;
                const isTransomSelected = selectedComponentId === transomId;
                return (
                  <g
                    key={i}
                    className="cursor-ns-resize group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComponent(transomId, 'transom');
                    }}
                  >
                    <line
                      x1={innerX}
                      y1={tY}
                      x2={innerX + innerW}
                      y2={tY}
                      stroke="transparent"
                      strokeWidth="16"
                    />
                    <line
                      x1={innerX}
                      y1={tY}
                      x2={innerX + innerW}
                      y2={tY}
                      stroke={isTransomSelected ? '#818cf8' : '#cbd5e1'}
                      strokeWidth={isTransomSelected ? '6' : '4'}
                      className="group-hover:stroke-indigo-400 transition-colors"
                    />
                  </g>
                );
              })}

              {/* ============================================================= */}
              {/* 5. PRECISION BLUEPRINT DIMENSION LINES                        */}
              {/* ============================================================= */}

              {/* A. COLUMN WIDTH DIMENSIONS (TOP TIER)                         */}
              {columnIntervals.map((col, i) => {
                const bX = innerX + innerW * col.start;
                const bW = innerW * (col.end - col.start);
                const dimY = winY - 35;

                return (
                  <g key={i}>
                    {/* Dimension Line */}
                    <line x1={bX + 2} y1={dimY} x2={bX + bW - 2} y2={dimY} stroke="#38bdf8" strokeWidth="1.5" />
                    {/* Tick marks */}
                    <line x1={bX} y1={dimY - 5} x2={bX} y2={dimY + 5} stroke="#38bdf8" strokeWidth="1.5" />
                    <line x1={bX + bW} y1={dimY - 5} x2={bX + bW} y2={dimY + 5} stroke="#38bdf8" strokeWidth="1.5" />
                    {/* Droplines */}
                    <line x1={bX} y1={dimY + 5} x2={bX} y2={winY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                    {i === columnIntervals.length - 1 && (
                      <line x1={bX + bW} y1={dimY + 5} x2={bX + bW} y2={winY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                    )}

                    {/* Clickable Column Width mm */}
                    <text
                      x={bX + bW / 2}
                      y={dimY - 8}
                      fill="#38bdf8"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        setEditingColRange(col);
                        setTempColWidth(String(col.widthMm));
                      }}
                    >
                      {col.widthMm} mm
                    </text>
                  </g>
                );
              })}

              {/* B. OVERALL WIDTH (BOTTOM TIER)                                */}
              <g>
                {(() => {
                  const dimY = isStandaloneArch ? winY + 265 : winY + height + 50;
                  return (
                    <>
                      {/* Dimension Line with Witness Ticks */}
                      <line
                        x1={winX}
                        y1={dimY}
                        x2={winX + width}
                        y2={dimY}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <line x1={winX} y1={dimY - 10} x2={winX} y2={dimY + 10} stroke="#0f172a" strokeWidth="2.5" />
                      <line x1={winX + width} y1={dimY - 10} x2={winX + width} y2={dimY + 10} stroke="#0f172a" strokeWidth="2.5" />
                      <line x1={winX} y1={isStandaloneArch ? winY : winY + height} x2={winX} y2={dimY + 14} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1={winX + width} y1={isStandaloneArch ? winY : winY + height} x2={winX + width} y2={dimY + 14} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

                      {/* Crisp Bold Black Dimension Value */}
                      <text
                        x={winX + width / 2}
                        y={dimY - 8}
                        fill="#0f172a"
                        fontSize="26"
                        fontWeight="900"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        className="cursor-pointer hover:underline"
                        onClick={() => setIsEditingWidth(true)}
                      >
                        {width}
                      </text>

                      {/* WindoorCraft External / Internal Boundary Indicator Line */}
                      <g transform={`translate(${winX}, ${dimY + 38})`}>
                        <text x="-12" y="-4" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="end">External</text>
                        <line x1="-58" y1="0" x2="-8" y2="0" stroke="#0f172a" strokeWidth="1" />
                        <text x="-12" y="11" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="end">Internal</text>

                        <line x1="0" y1="0" x2={width} y2="0" stroke="#0f172a" strokeWidth="2" strokeDasharray="6 4" />
                        <line x1="0" y1="-8" x2="0" y2="8" stroke="#0f172a" strokeWidth="4" />
                        <line x1={width} y1="-8" x2={width} y2="8" stroke="#0f172a" strokeWidth="4" />
                      </g>
                    </>
                  );
                })()}
              </g>

              {/* C. OVERALL HEIGHT (LEFT TIER)                                 */}
              {!isStandaloneArch && (
              <g>
                <line
                  x1={winX - 45}
                  y1={winY}
                  x2={winX - 45}
                  y2={winY + height}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <line x1={winX - 55} y1={winY} x2={winX - 35} y2={winY} stroke="#0f172a" strokeWidth="2.5" />
                <line x1={winX - 55} y1={winY + height} x2={winX - 35} y2={winY + height} stroke="#0f172a" strokeWidth="2.5" />
                <line x1={winX - 60} y1={winY} x2={winX} y2={winY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1={winX - 60} y1={winY + height} x2={winX} y2={winY + height} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

                <text
                  x={winX - 58}
                  y={winY + height / 2 + 8}
                  fill="#0f172a"
                  fontSize="26"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  transform={`rotate(-90 ${winX - 58}, ${winY + height / 2})`}
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsEditingHeight(true)}
                >
                  {height}
                </text>
              </g>
              )}

              {/* D. ARCH RISE & TOTAL HEIGHT (IF ARCH PRESENT)                 */}
              {design.hasArch && (
                <>
                  {/* Arch Rise */}
                  <g>
                    <line
                      x1={winX - 45}
                      y1={winY - archHeight}
                      x2={winX - 45}
                      y2={winY}
                      stroke="#7c3aed"
                      strokeWidth="2"
                    />
                    <line x1={winX - 55} y1={winY - archHeight} x2={winX - 35} y2={winY - archHeight} stroke="#7c3aed" strokeWidth="2.5" />
                    <line x1={winX - 55} y1={winY} x2={winX - 35} y2={winY} stroke="#7c3aed" strokeWidth="2.5" />
                    <line x1={winX - 60} y1={winY - archHeight} x2={winX + width / 2} y2={winY - archHeight} stroke="#7c3aed" strokeWidth="1" strokeDasharray="2 2" />

                    <text
                      x={winX - 58}
                      y={winY - archHeight / 2 + 8}
                      fill="#7c3aed"
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      transform={`rotate(-90 ${winX - 58}, ${winY - archHeight / 2})`}
                      className="cursor-pointer hover:underline"
                      onClick={() => setIsEditingArchHeight(true)}
                    >
                      {archHeight}
                    </text>
                  </g>

                  {/* Combined Outer Elevation */}
                  {!isStandaloneArch && (
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
                      {height + archHeight} mm Combined Total
                    </text>
                  </g>
                  )}
                </>
              )}

              {/* E. ROW / TRANSOM HEIGHT DIMENSIONS (RIGHT TIER)               */}
              {rowIntervals.length > 1 &&
                rowIntervals.map((row, i) => {
                  const rY = innerY + innerH * row.start;
                  const rH = innerH * (row.end - row.start);
                  const dimX = winX + width + 45;

                  return (
                    <g key={i}>
                      <line x1={dimX} y1={rY + 2} x2={dimX} y2={rY + rH - 2} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={dimX - 5} y1={rY} x2={dimX + 5} y2={rY} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={dimX - 5} y1={rY + rH} x2={dimX + 5} y2={rY + rH} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={winX + width} y1={rY} x2={dimX + 5} y2={rY} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                      {i === rowIntervals.length - 1 && (
                        <line x1={winX + width} y1={rY + rH} x2={dimX + 5} y2={rY + rH} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 2" />
                      )}

                      <text
                        x={dimX + 18}
                        y={rY + rH / 2 + 5}
                        fill="#38bdf8"
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        transform={`rotate(-90 ${dimX + 18}, ${rY + rH / 2})`}
                        className="cursor-pointer hover:underline"
                        onClick={() => {
                          setEditingRowRange(row);
                          setTempRowHeight(String(row.heightMm));
                        }}
                      >
                        {row.heightMm} mm
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        )}

        {/* ============================================================= */}
        {/* 6. CONTEXTUAL BOTTOM CELL ACTION BAR                          */}
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
                  {Math.round(innerW * (selectedPanel.widthRatio || 1))} × {Math.round(innerH * (selectedPanel.heightRatio || 1))} mm
                </span>
              </div>
            </div>

            {/* Quick Opening Style Switcher */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCellOperation(selectedPanel.id, 'fixed', 'fixed')}
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
                onClick={() => setCellOperation(selectedPanel.id, 'sliding', 'sliding_left')}
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
                onClick={() => setCellOperation(selectedPanel.id, 'sliding', 'sliding_right')}
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
                onClick={() => setCellOperation(selectedPanel.id, 'casement', 'casement_left')}
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
                onClick={() => setCellOperation(selectedPanel.id, 'casement', 'casement_right')}
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
                onClick={() => setCellOperation(selectedPanel.id, 'casement', 'top_hung')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  selectedPanel.openingDirection === 'top_hung'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Top Hung
              </button>
              <button
                type="button"
                onClick={() => toggleCellMesh(selectedPanel.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
                  selectedPanel.meshId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Mesh</span>
              </button>
            </div>

            {/* Split & Structure Actions */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <button
                type="button"
                onClick={() => splitCellVertically(selectedPanel.id)}
                className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                title="Split this cell vertically in half"
              >
                <Columns className="w-3 h-3" />
                <span>+ Mullion</span>
              </button>
              <button
                type="button"
                onClick={() => splitCellHorizontally(selectedPanel.id)}
                className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                title="Split this cell horizontally into Top & Bottom Transom"
              >
                <Rows className="w-3 h-3" />
                <span>+ Transom</span>
              </button>
              {panels.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteCell(selectedPanel.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="Delete this cell and merge with adjacent"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectComponent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg ml-1"
                title="Deselect cell"
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

        {/* Modal: Overall Width */}
        {isEditingWidth && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Total Width (mm):</span>
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

        {/* Modal: Overall Height */}
        {isEditingHeight && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Total Height (mm):</span>
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

        {/* Modal: Arch Rise */}
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

        {/* Modal: Column Width */}
        {editingColRange && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Column Width (mm):</span>
            <input
              type="number"
              value={tempColWidth}
              onChange={(e) => setTempColWidth(e.target.value)}
              className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitColumnWidth()}
            />
            <button
              onClick={submitColumnWidth}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button
              onClick={() => setEditingColRange(null)}
              className="px-2.5 py-1.5 text-slate-400 text-xs font-semibold hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Modal: Row Height */}
        {editingRowRange && (
          <div className="absolute z-40 bg-slate-900 p-4 rounded-xl shadow-2xl border border-cyan-500 text-white flex items-center gap-2 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-300">Row Height (mm):</span>
            <input
              type="number"
              value={tempRowHeight}
              onChange={(e) => setTempRowHeight(e.target.value)}
              className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRowHeight()}
            />
            <button
              onClick={submitRowHeight}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Apply
            </button>
            <button
              onClick={() => setEditingRowRange(null)}
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
        onSelectTemplate={(tpl) => {
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
              yRatio: 0,
              heightRatio: 1,
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
        }}
      />

      {/* 4. Full Architectural CAD Production Sheet */}
      <ArchitecturalSheetModal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        design={design}
      />

      {/* 5. WindoorCraft Itemized Quote & Cutting List Modal */}
      <WindoorQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        design={design}
      />
    </div>
  );
};

