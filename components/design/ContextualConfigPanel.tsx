'use client';

import React, { useState } from 'react';
import {
  ParametricWindowDesign,
  WindowPriceEstimate,
  WindowComponentType,
  GlassTypeName,
  ProfileBrandName,
  CustomSectionItem,
  OpeningDirectionType,
} from '@/lib/design/types';
import {
  calculateWindowPrice,
  calculatePanelDimensions,
  calculateGlassDimensions,
  calculateProfileLength,
  calculateMeshArea,
  calculateHardwareQuantity,
  mm2ToSqFt,
} from '@/lib/design/calculations';
import {
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Shield,
  Layers,
  Wrench,
  Check,
  FolderTree,
  Sliders,
  Box,
  ChevronRight,
  Grid,
  Circle,
  MoveHorizontal,
  MoveVertical,
  Maximize2,
  Lock,
  ClipboardList,
  Palette,
  Sun,
  Eye,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface ContextualConfigPanelProps {
  design: ParametricWindowDesign;
  selectedComponent: {
    type: WindowComponentType;
    id: string;
    subId?: string;
  } | null;
  onSelectComponent: (comp: {
    type: WindowComponentType;
    id: string;
    subId?: string;
  } | null) => void;
  onUpdateDesign: (updated: ParametricWindowDesign) => void;
  onSaveDesign: () => void;
  onContinueToQuotation: () => void;
  isSaving?: boolean;
}

export function ContextualConfigPanel({
  design,
  selectedComponent,
  onSelectComponent,
  onUpdateDesign,
  onSaveDesign,
  onContinueToQuotation,
  isSaving = false,
}: ContextualConfigPanelProps) {
  // WindoorCraft vertical left tabs: 'props' | 'order' | 'color' | 'tree'
  const [activeTab, setActiveTab] = useState<'props' | 'order' | 'color' | 'tree'>('props');

  // Dual color toggle
  const [dualColor, setDualColor] = useState(false);
  const [interiorColor, setInteriorColor] = useState(design.profileColor || 'Pure White');

  const estimate = calculateWindowPrice(design);

  // Helper to update top-level design fields
  const updateField = <K extends keyof ParametricWindowDesign>(
    key: K,
    value: ParametricWindowDesign[K]
  ) => {
    onUpdateDesign({
      ...design,
      [key]: value,
    });
  };

  // Helper to update default glass config
  const updateDefaultGlass = (patch: Partial<typeof design.defaultGlass>) => {
    const updatedGlass = { ...design.defaultGlass, ...patch };
    const updatedGlassConfigs = { ...design.glassConfigs };
    Object.keys(updatedGlassConfigs).forEach((k) => {
      updatedGlassConfigs[k] = { ...updatedGlassConfigs[k], ...patch };
    });

    onUpdateDesign({
      ...design,
      defaultGlass: updatedGlass,
      glassConfigs: updatedGlassConfigs,
    });
  };

  // Calculate inner geometry
  const innerW = Math.max(200, (design.width || 1800) - 120);
  const innerH = Math.max(200, (design.height || 1500) - 120);
  const areaM2 = ((design.width * design.height) / 1_000_000).toFixed(2);

  // Find active selected items
  const selectedType = selectedComponent?.type;
  const selectedId = selectedComponent?.id;

  // Selected panel / sash
  const selectedPanelIdx = (design.panels || []).findIndex(
    (p) => p.id === selectedId || p.sashId === selectedId || p.glassId === selectedId
  );
  const selectedPanel = selectedPanelIdx !== -1 ? design.panels[selectedPanelIdx] : null;

  // Selected glass details
  const selectedGlassDetails = selectedPanelIdx !== -1 ? calculateGlassDimensions(design, selectedPanelIdx) : null;

  // Selected mullion
  const selectedMullionIdx = (design.mullions || []).findIndex((m) => m.id === selectedId);
  const selectedMullion = selectedMullionIdx !== -1 ? design.mullions[selectedMullionIdx] : null;

  // Selected transom
  const selectedTransomIdx = (design.transoms || []).findIndex((t) => t.id === selectedId);
  const selectedTransom = selectedTransomIdx !== -1 ? design.transoms[selectedTransomIdx] : null;

  // Split selected bay vertically
  const handleSplitSelectedBay = () => {
    if (!selectedPanel) return;
    const panelIdx = design.panels.findIndex((p) => p.id === selectedPanel.id);
    if (panelIdx === -1) return;

    const target = design.panels[panelIdx];
    const halfW = (target.widthRatio || 1) / 2;

    const panelA = {
      ...target,
      id: `panel-${Date.now()}-1`,
      name: `A${panelIdx + 1}`,
      widthRatio: halfW,
    };
    const panelB = {
      ...target,
      id: `panel-${Date.now()}-2`,
      name: `A${panelIdx + 2}`,
      xRatio: (target.xRatio || 0) + halfW,
      widthRatio: halfW,
      openingDirection: target.openingDirection === 'sliding_right' ? ('sliding_left' as const) : ('sliding_right' as const),
      sashId: `sash-${Date.now()}-2`,
      glassId: `glass-${Date.now()}-2`,
    };

    const newPanels = [...design.panels];
    newPanels.splice(panelIdx, 1, panelA, panelB);
    const renumbered = newPanels.map((p, i) => ({ ...p, name: `A${i + 1}` }));

    // Recompute mullions
    const newMullions = [];
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
    onSelectComponent({ type: 'panel', id: panelA.id });
  };

  // Split selected bay horizontally (Transom)
  const handleSplitSelectedBayHorizontally = () => {
    if (!selectedPanel) return;
    const panelIdx = design.panels.findIndex((p) => p.id === selectedPanel.id);
    if (panelIdx === -1) return;

    const target = design.panels[panelIdx];
    const topH = 0.35 * (target.heightRatio || 1);
    const botH = 0.65 * (target.heightRatio || 1);

    const cellTop = {
      ...target,
      id: `cell-${Date.now()}-top`,
      name: `T${panelIdx + 1}`,
      panelType: 'casement' as const,
      openingDirection: 'top_hung' as const,
      yRatio: target.yRatio || 0,
      heightRatio: topH,
      sashId: `sash-${Date.now()}-top`,
      glassId: `glass-${Date.now()}-top`,
    };
    const cellBot = {
      ...target,
      id: `cell-${Date.now()}-bot`,
      name: `B${panelIdx + 1}`,
      yRatio: (target.yRatio || 0) + topH,
      heightRatio: botH,
      sashId: `sash-${Date.now()}-bot`,
      glassId: `glass-${Date.now()}-bot`,
    };

    const nextPanels = [...design.panels];
    nextPanels.splice(panelIdx, 1, cellTop, cellBot);

    onUpdateDesign({
      ...design,
      panels: nextPanels,
      transoms: [{ id: 'transom-01', positionRatio: 0.35, height: 60 }],
    });
    onSelectComponent({ type: 'panel', id: cellBot.id });
  };

  // Delete selected bay
  const handleDeleteSelectedBay = () => {
    if (!selectedPanel || design.panels.length <= 1) return;
    const panelIdx = design.panels.findIndex((p) => p.id === selectedPanel.id);
    if (panelIdx === -1) return;

    const deletedRatio = selectedPanel.widthRatio || (1 / design.panels.length);
    const remaining = design.panels.filter((p) => p.id !== selectedPanel.id);
    const bonusPerPanel = deletedRatio / remaining.length;

    let accumX = 0;
    const adjustedPanels = remaining.map((p, idx) => {
      const newWidthRatio = (p.widthRatio || 1 / design.panels.length) + bonusPerPanel;
      const res = {
        ...p,
        name: `A${idx + 1}`,
        xRatio: accumX,
        widthRatio: newWidthRatio,
      };
      accumX += newWidthRatio;
      return res;
    });

    const newMullions = [];
    let mX = 0;
    for (let i = 0; i < adjustedPanels.length - 1; i++) {
      mX += adjustedPanels[i].widthRatio;
      newMullions.push({
        id: `mullion-0${i + 1}`,
        positionRatio: mX,
        width: 60,
      });
    }

    onUpdateDesign({
      ...design,
      panels: adjustedPanels,
      mullions: newMullions,
    });
    onSelectComponent(null);
  };

  // Delete Mullion & Merge Adjacent Openings
  const handleDeleteMullion = (mullionId: string) => {
    const idx = (design.mullions || []).findIndex((m) => m.id === mullionId);
    if (idx === -1) return;

    const updatedMullions = design.mullions.filter((m) => m.id !== mullionId);
    if (design.panels.length >= 2) {
      const p1 = design.panels[idx];
      const p2 = design.panels[idx + 1];
      const mergedWidth = (p1.widthRatio || 0.5) + (p2.widthRatio || 0.5);

      const mergedPanel = {
        ...p1,
        widthRatio: mergedWidth,
      };

      const newPanels = [...design.panels];
      newPanels.splice(idx, 2, mergedPanel);
      const renumbered = newPanels.map((p, i) => ({ ...p, name: `A${i + 1}` }));

      onUpdateDesign({
        ...design,
        panels: renumbered,
        mullions: updatedMullions,
      });
    } else {
      onUpdateDesign({
        ...design,
        mullions: updatedMullions,
      });
    }
    onSelectComponent(null);
  };

  // Delete Arch
  const handleDeleteArch = () => {
    onUpdateDesign({
      ...design,
      hasArch: false,
      archHeight: 0,
      windowType: 'Sliding Window',
    });
    onSelectComponent(null);
  };

  return (
    <div className="flex h-full bg-[#f8fafc] border-l border-slate-200 overflow-hidden text-slate-800 text-xs font-sans">
      {/* ===================================================================== */}
      {/* 1. WINDOORCRAFT LEFT VERTICAL TABS STRIP (48px)                       */}
      {/* ===================================================================== */}
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-2.5 gap-2 select-none shrink-0 z-10">
        {/* Props Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('props')}
          className={`w-9 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'props'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Component Properties (props)"
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">props</span>
        </button>

        {/* Order Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`w-9 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'order'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Order Specifications (order)"
        >
          <ClipboardList className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">order</span>
        </button>

        {/* Color Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('color')}
          className={`w-9 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'color'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Profile Color & Lamination (color)"
        >
          <Palette className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">color</span>
        </button>

        {/* Tree Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('tree')}
          className={`w-9 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'tree'
              ? 'bg-blue-600 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Design Hierarchy Tree (tree)"
        >
          <FolderTree className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">tree</span>
        </button>

        <div className="flex-1" />

        {/* Window Type Indicator */}
        <div
          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold"
          title={`${design.id} - ${design.windowType}`}
        >
          {design.id?.slice(0, 3) || 'W01'}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MAIN SCROLLABLE CONTENT BODY                                       */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Title Bar */}
        <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {activeTab === 'props' && 'Component Properties'}
              {activeTab === 'order' && 'Order Specifications'}
              {activeTab === 'color' && 'Color & Lamination'}
              {activeTab === 'tree' && 'Hierarchical Tree'}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            {selectedType ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {selectedType.toUpperCase()}
              </span>
            ) : (
              <span className="text-slate-400 font-mono text-[10px]">{design.id || 'W01'}</span>
            )}
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* ================================================================= */}
          {/* TAB: PROPS                                                        */}
          {/* ================================================================= */}
          {activeTab === 'props' && (
            <div className="space-y-3.5">
              {/* If nothing is selected, prompt or show outer frame */}
              {!selectedType && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-700 text-xs flex items-center justify-between">
                  <span>Click on any frame, bay, glass or arch on the canvas to configure.</span>
                  <button
                    type="button"
                    onClick={() => onSelectComponent({ type: 'frame', id: 'frame-outer' })}
                    className="px-2 py-1 bg-white border border-blue-300 rounded text-blue-700 font-bold hover:bg-blue-50"
                  >
                    Select Frame
                  </button>
                </div>
              )}

              {/* 1.1 OUTER FRAME SELECTED */}
              {selectedType === 'frame' && (
                <div className="bg-white rounded-xl border border-blue-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900 text-xs">Outer Frame</span>
                    </div>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                      Frame P-101
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={design.width || 1800}
                        onChange={(e) => {
                          const val = Math.max(400, parseInt(e.target.value) || 1800);
                          updateField('width', val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Height (mm)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={design.height || 1500}
                        onChange={(e) => {
                          const val = Math.max(300, parseInt(e.target.value) || 1500);
                          updateField('height', val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Profile System
                      </label>
                      <select
                        value={design.profileBrand}
                        onChange={(e) => updateField('profileBrand', e.target.value as ProfileBrandName)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="VEKA">VEKA 60 mm</option>
                        <option value="REHAU">REHAU 70 mm</option>
                        <option value="KOMMERLING">Kömmerling 88 mm</option>
                        <option value="ALUPLAST">Aluplast Ideal</option>
                        <option value="Other">Standard Profile</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Color / Finish
                      </label>
                      <select
                        value={design.profileColor || 'Pure White'}
                        onChange={(e) => updateField('profileColor', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="Pure White">Pure White</option>
                        <option value="Anthracite Grey">Anthracite Grey</option>
                        <option value="Golden Oak">Golden Oak</option>
                        <option value="Bronze">Architectural Bronze</option>
                        <option value="Jet Black">Jet Black</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Perimeter / Length:</span>
                    <span className="font-mono font-bold text-blue-900">
                      {calculateProfileLength(design).frameRunningFt} running ft
                    </span>
                  </div>
                </div>
              )}

              {/* 1.2 SASH / PANEL SELECTED (WindoorCraft Props Controls) */}
              {(selectedType === 'sash' || selectedType === 'panel') && selectedPanel && (
                <div className="bg-white rounded-xl border border-cyan-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-cyan-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                        {selectedPanel.name || 'S01'}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedPanel.panelType === 'sliding' ? 'Sliding Sash' : selectedPanel.panelType === 'casement' ? 'Casement Sash' : 'Panel Opening'}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full font-semibold">
                      {Math.round(innerW * (selectedPanel.widthRatio || 1))} × {Math.round(innerH * (selectedPanel.heightRatio || 1))} mm
                    </span>
                  </div>

                  {/* WindoorCraft Quick Toggles Bar: Frosted | Normal | Shade | SQT */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.defaultGlass.color === 'Frosted'}
                        onChange={(e) => updateDefaultGlass({ color: e.target.checked ? 'Frosted' : 'Clear' })}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">Frosted Glass</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.defaultGlass.glassType === 'Toughened'}
                        onChange={(e) => updateDefaultGlass({ glassType: e.target.checked ? 'Toughened' : 'Clear' })}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">Toughened</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedPanel.meshId}
                        onChange={(e) => {
                          const updated = design.panels.map((p) =>
                            p.id === selectedPanel.id
                              ? { ...p, meshId: e.target.checked ? `mesh-${p.id}` : undefined }
                              : p
                          );
                          onUpdateDesign({ ...design, panels: updated });
                        }}
                        className="rounded text-cyan-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">w/sqt (Bead)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedPanel.meshId}
                        onChange={(e) => {
                          const updated = design.panels.map((p) =>
                            p.id === selectedPanel.id
                              ? { ...p, meshId: e.target.checked ? `mesh-${p.id}` : undefined }
                              : p
                          );
                          onUpdateDesign({ ...design, panels: updated });
                        }}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">SS304 Screen</span>
                    </label>
                  </div>

                  {/* Operation & Opening Style */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Operation & Opening Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { type: 'fixed', dir: 'fixed', label: 'Fixed' },
                        { type: 'sliding', dir: 'sliding_left', label: 'Slide (◄)' },
                        { type: 'sliding', dir: 'sliding_right', label: 'Slide (►)' },
                        { type: 'casement', dir: 'casement_left', label: 'Casement (◄)' },
                        { type: 'casement', dir: 'casement_right', label: 'Casement (►)' },
                        { type: 'casement', dir: 'top_hung', label: 'Top Hung' },
                        { type: 'casement', dir: 'tilt_turn', label: 'Tilt & Turn' },
                        { type: 'louver', dir: 'fixed', label: 'Louver' },
                      ].map((opt) => {
                        const isCurrent =
                          selectedPanel.panelType === opt.type &&
                          (selectedPanel.openingDirection === opt.dir ||
                            (opt.type === 'fixed' && selectedPanel.panelType === 'fixed'));
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              const updated = design.panels.map((p) =>
                                p.id === selectedPanel.id
                                  ? {
                                      ...p,
                                      panelType: opt.type as any,
                                      openingDirection: opt.dir as any,
                                      sashId: opt.type === 'fixed' ? undefined : (p.sashId || `sash-${p.id}`),
                                    }
                                  : p
                              );
                              onUpdateDesign({ ...design, panels: updated });
                            }}
                            className={`px-1.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all text-center ${
                              isCurrent
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-400 font-bold shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bay Width & Pulling Height */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Bay Width (mm)
                      </label>
                      <input
                        type="number"
                        value={Math.round(innerW * (selectedPanel.widthRatio || 1))}
                        onChange={(e) => {
                          const targetVal = Number(e.target.value);
                          if (!targetVal || targetVal <= 100) return;
                          const targetRatio = targetVal / innerW;
                          if (targetRatio >= 0.95 || targetRatio <= 0.05) return;
                          const currentRatio = selectedPanel.widthRatio || 1;
                          const diff = targetRatio - currentRatio;
                          const remainingCount = design.panels.length - 1;
                          if (remainingCount <= 0) return;
                          const delta = diff / remainingCount;
                          let accumX = 0;
                          const updated = design.panels.map((p) => {
                            const newR = p.id === selectedPanel.id ? targetRatio : Math.max(0.08, (p.widthRatio || 1) - delta);
                            const res = { ...p, xRatio: accumX, widthRatio: newR };
                            accumX += newR;
                            return res;
                          });
                          onUpdateDesign({ ...design, panels: updated });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Pulling Height (mm)
                      </label>
                      <input
                        type="number"
                        defaultValue={1050}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        title="Handle / Hardware pulling height from floor"
                      />
                    </div>
                  </div>

                  {/* Sub-Actions: Split Mullion / Split Transom / Delete */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSplitSelectedBay}
                      className="flex-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      + Mullion (V)
                    </button>
                    <button
                      type="button"
                      onClick={handleSplitSelectedBayHorizontally}
                      className="flex-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      + Transom (H)
                    </button>
                    {design.panels.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedBay}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors"
                        title="Delete this bay and merge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 1.3 GLASS SELECTED */}
              {selectedType === 'glass' && (
                <div className="bg-white rounded-xl border border-sky-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span className="font-bold text-slate-900 text-xs">Glass Pane</span>
                    </div>
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedGlassDetails?.glassId || 'GL-01'}
                    </span>
                  </div>

                  {selectedGlassDetails && (
                    <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block">Width</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{selectedGlassDetails.width} mm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block">Height</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{selectedGlassDetails.height} mm</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block">Area</span>
                        <span className="font-mono font-bold text-sky-700 text-xs">{selectedGlassDetails.areaSqFt} sq.ft</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Glass Type
                      </label>
                      <select
                        value={design.defaultGlass.glassType}
                        onChange={(e) => updateDefaultGlass({ glassType: e.target.value as GlassTypeName })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="Toughened">Toughened Glass</option>
                        <option value="Clear">Clear Float Glass</option>
                        <option value="Laminated">Laminated Glass</option>
                        <option value="Frosted">Frosted / Obscure</option>
                        <option value="Tinted">Tinted Glass</option>
                        <option value="DGU / IGU">DGU / IGU Double Glazed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Thickness
                      </label>
                      <select
                        value={design.defaultGlass.thickness}
                        onChange={(e) => updateDefaultGlass({ thickness: parseInt(e.target.value) || 5 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value={4}>4 mm</option>
                        <option value={5}>5 mm</option>
                        <option value={6}>6 mm</option>
                        <option value={8}>8 mm</option>
                        <option value={10}>10 mm</option>
                        <option value={12}>12 mm</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Color / Tint
                      </label>
                      <select
                        value={design.defaultGlass.color}
                        onChange={(e) => updateDefaultGlass({ color: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="Clear">Clear</option>
                        <option value="Frosted">Frosted</option>
                        <option value="Bronze Tinted">Bronze Tinted</option>
                        <option value="Green Tinted">Green Tinted</option>
                        <option value="Grey Tinted">Grey Tinted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Rate (₹ / sq.ft)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="number"
                          step={5}
                          value={design.defaultGlass.ratePerSqFt}
                          onChange={(e) => updateDefaultGlass({ ratePerSqFt: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-semibold">Total Glass Cost:</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      ₹{selectedGlassDetails?.totalCost || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* 1.4 MULLION SELECTED */}
              {selectedType === 'mullion' && selectedMullion && (
                <div className="bg-white rounded-xl border border-indigo-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MoveVertical className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-900 text-xs">Vertical Mullion</span>
                    </div>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedMullion.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        X Position (mm from left)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={Math.round(innerW * (selectedMullion.positionRatio || 0.5))}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!val || val <= 100 || val >= innerW - 100) return;
                          const nextRatio = val / innerW;
                          const updatedMullions = design.mullions.map((m) =>
                            m.id === selectedMullion.id ? { ...m, positionRatio: nextRatio } : m
                          );
                          if (design.panels.length === 2) {
                            const updatedPanels = [
                              { ...design.panels[0], widthRatio: nextRatio },
                              { ...design.panels[1], xRatio: nextRatio, widthRatio: 1 - nextRatio },
                            ];
                            onUpdateDesign({ ...design, mullions: updatedMullions, panels: updatedPanels });
                          } else {
                            onUpdateDesign({ ...design, mullions: updatedMullions });
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Profile Width
                      </label>
                      <input
                        type="text"
                        disabled
                        value="60 mm (Standard)"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMullion(selectedMullion.id)}
                    className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Mullion & Merge Openings</span>
                  </button>
                </div>
              )}

              {/* 1.5 TRANSOM SELECTED */}
              {selectedType === 'transom' && selectedTransom && (
                <div className="bg-white rounded-xl border border-indigo-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MoveHorizontal className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-900 text-xs">Horizontal Transom</span>
                    </div>
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedTransom.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Y Position (mm from top)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={Math.round(innerH * (selectedTransom.positionRatio || 0.35))}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!val || val <= 100 || val >= innerH - 100) return;
                          const nextRatio = val / innerH;
                          const updated = design.transoms.map((t) =>
                            t.id === selectedTransom.id ? { ...t, positionRatio: nextRatio } : t
                          );
                          onUpdateDesign({ ...design, transoms: updated });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Profile Height
                      </label>
                      <input
                        type="text"
                        disabled
                        value="60 mm (Standard)"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = design.transoms.filter((t) => t.id !== selectedTransom.id);
                      onUpdateDesign({ ...design, transoms: updated });
                      onSelectComponent(null);
                    }}
                    className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Transom Bar</span>
                  </button>
                </div>
              )}

              {/* 1.6 ARCH SELECTED */}
              {selectedType === 'arch' && design.hasArch && (
                <div className="bg-white rounded-xl border border-purple-400 p-3.5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-900 text-xs">Arch Head Element</span>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
                      {design.archType === 'gothic' ? 'Gothic' : 'Semi-Circular'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Base Width (mm)
                      </label>
                      <input
                        type="number"
                        value={design.width || 1800}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                        Arch Rise (mm)
                      </label>
                      <input
                        type="number"
                        step={10}
                        min={150}
                        max={2500}
                        value={design.archHeight || 350}
                        onChange={(e) => {
                          const val = Math.max(150, parseInt(e.target.value) || 350);
                          updateField('archHeight', val);
                        }}
                        className="w-full bg-purple-50/50 border border-purple-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Arch Profile Style
                    </label>
                    <select
                      value={design.archType || 'round'}
                      onChange={(e) => updateField('archType', e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
                    >
                      <option value="round">Semi-Circular Arch</option>
                      <option value="gothic">Gothic Pointed Arch</option>
                      <option value="segmental">Segmental Low Rise Arch</option>
                    </select>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-purple-900">Total Unit Elevation:</div>
                      <div className="text-[10px] text-purple-700">
                        Base {design.height || 1200}mm + Arch {design.archHeight || 350}mm
                      </div>
                    </div>
                    <div className="font-black text-xs text-purple-900 font-mono">
                      {(design.height || 1200) + (design.archHeight || 350)} mm
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteArch}
                    className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Arch Head</span>
                  </button>
                </div>
              )}

              {/* Real-Time Price & Quick Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Live Estimate
                  </span>
                  <span className="font-mono font-black text-sm text-emerald-600">
                    ₹{estimate.totalCost.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Profile: <span className="font-mono font-bold text-slate-900">₹{estimate.profileCost}</span></div>
                  <div>Glass: <span className="font-mono font-bold text-slate-900">₹{estimate.glassCost}</span></div>
                  <div>Hardware: <span className="font-mono font-bold text-slate-900">₹{estimate.hardwareCost}</span></div>
                  <div>Labor: <span className="font-mono font-bold text-slate-900">₹{estimate.labourCost}</span></div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onSaveDesign}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onContinueToQuotation}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: ORDER (WindoorCraft Order Specifications Sheet)              */}
          {/* ================================================================= */}
          {activeTab === 'order' && (
            <div className="space-y-3.5">
              {/* Order Overview Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">Order Parameters</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {areaM2} m² ({estimate.totalAreaSqFt.toFixed(1)} sq.ft)
                  </span>
                </div>

                {/* Window Name & Qty */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Window No / Tag
                    </label>
                    <input
                      type="text"
                      value={design.id || 'W01'}
                      onChange={(e) => updateField('id', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Count
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => updateField('quantity', Math.max(1, (design.quantity || 1) - 1))}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-l-lg text-slate-700 font-bold flex items-center justify-center border border-r-0 border-slate-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={design.quantity || 1}
                        onChange={(e) => updateField('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-9 h-7 bg-slate-50 border-t border-b border-slate-200 text-center text-xs font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('quantity', (design.quantity || 1) + 1)}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-r-lg text-slate-700 font-bold flex items-center justify-center border border-l-0 border-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Width & Height mm */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      step={10}
                      value={design.width || 1800}
                      onChange={(e) => updateField('width', Math.max(400, parseInt(e.target.value) || 1800))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      step={10}
                      value={design.height || 1500}
                      onChange={(e) => updateField('height', Math.max(300, parseInt(e.target.value) || 1500))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Exact WindoorCraft Order Specification Dropdowns */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                <div className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Fabrication Components</span>
                  <span className="text-[10px] text-slate-400 font-normal">WindoorCraft Spec</span>
                </div>

                {/* 1. frame */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    frame
                  </label>
                  <select
                    value={design.profileSystem || '60 mm Outer Frame'}
                    onChange={(e) => updateField('profileSystem', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="60 mm Outer Frame">60 mm Casement Outer Frame</option>
                    <option value="60 mm 2-Track Sliding">60 mm 2-Track Sliding Outer Frame</option>
                    <option value="88 mm 3-Track Sliding">88 mm 3-Track Sliding Outer Frame</option>
                    <option value="70 mm Heavy Duty Frame">70 mm Heavy Duty System</option>
                  </select>
                </div>

                {/* 2. mullion */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    mullion
                  </label>
                  <select
                    defaultValue="Standard Mullion 60mm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="Standard Mullion 60mm">Standard Mullion 60mm</option>
                    <option value="Heavy Mullion 70mm">Heavy Mullion 70mm</option>
                    <option value="Coupling Mullion">Coupling Mullion Adaptor</option>
                  </select>
                </div>

                {/* 3. sash */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    sash
                  </label>
                  <select
                    defaultValue="Sliding Sash 60mm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="Sliding Sash 60mm">Sliding Sash 60mm</option>
                    <option value="Casement Sash Z-Type">Casement Sash Z-Type 60mm</option>
                    <option value="Heavy Duty Sliding Sash">Heavy Duty Sliding Sash</option>
                  </select>
                </div>

                {/* 4. glass */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    glass
                  </label>
                  <select
                    value={design.defaultGlass.glassType}
                    onChange={(e) => updateDefaultGlass({ glassType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="Clear">5mm Clear Float Glass</option>
                    <option value="Toughened">6mm Toughened Clear Glass</option>
                    <option value="Frosted">5mm Frosted / Obscure Glass</option>
                    <option value="DGU / IGU">12mm DGU (5+12A+5mm Clear)</option>
                    <option value="Laminated">24mm DGU Low-E (6+12A+6mm)</option>
                  </select>
                </div>

                {/* 5. connector & cornerJoiner */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      connector
                    </label>
                    <select
                      value={design.connector || 'None'}
                      onChange={(e) => updateField('connector', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="None">None</option>
                      <option value="90deg Corner">90° Corner Post</option>
                      <option value="135deg Corner">135° Bay Post</option>
                      <option value="Coupling Tube">Coupling Adaptor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      cornerJoiner
                    </label>
                    <select
                      value={design.cornerJoiner || 'Crimped corner'}
                      onChange={(e) => updateField('cornerJoiner', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="Crimped corner">Crimped corner</option>
                      <option value="Screw mechanical">Screw mechanical</option>
                      <option value="Welded 45deg">Welded 45° corner</option>
                    </select>
                  </div>
                </div>

                {/* 6. hardware & brand */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      hardware
                    </label>
                    <select
                      value={design.defaultHardware.type}
                      onChange={(e) => updateField('defaultHardware', { ...design.defaultHardware, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="Touch Lock with Keeper">Touch Lock with Keeper</option>
                      <option value="Crescent Lock">Crescent Lock Set</option>
                      <option value="Espag Multi-point">Espag Multi-point</option>
                      <option value="Cockspur Handle">Cockspur Handle</option>
                      <option value="Friction Stay 12 inch">Friction Stay 12"</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      brand
                    </label>
                    <select
                      value={design.profileBrand}
                      onChange={(e) => updateField('profileBrand', e.target.value as ProfileBrandName)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="VEKA">VEKA</option>
                      <option value="REHAU">REHAU</option>
                      <option value="KOMMERLING">Kömmerling</option>
                      <option value="ALUPLAST">Aluplast</option>
                      <option value="Other">Dimex</option>
                    </select>
                  </div>
                </div>

                {/* 7. screen & hinge */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      screen
                    </label>
                    <select
                      value={design.screenType || 'None'}
                      onChange={(e) => updateField('screenType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="None">None</option>
                      <option value="SS 304 Mesh">SS 304 Mesh Sash</option>
                      <option value="Fiberglass">Fiberglass Screen</option>
                      <option value="Pleated">Pleated Retractable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      hinge / roller
                    </label>
                    <select
                      value={design.hingeType || 'Bearing Roller'}
                      onChange={(e) => updateField('hingeType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="Bearing Roller">Heavy Duty Roller (Bearing)</option>
                      <option value="4-Bar SS Hinge">Concealed 4-Bar SS Hinge</option>
                      <option value="Surface Butt Hinge">Surface Butt Hinge</option>
                      <option value="Top Hung Restrictor">Top Hung Friction Stay</option>
                    </select>
                  </div>
                </div>

                {/* 8. position & reinforcement */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      position
                    </label>
                    <input
                      type="text"
                      value={design.name || 'Living Room'}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                      reinforcement
                    </label>
                    <select
                      value={design.reinforcement || '1.5mm GI Steel'}
                      onChange={(e) => updateField('reinforcement', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="1.5mm GI Steel">1.5mm GI Steel Galvanized</option>
                      <option value="2.0mm GI Steel">2.0mm GI Heavy Galvanized</option>
                      <option value="1.2mm GI Steel">1.2mm GI Light Galvanized</option>
                      <option value="None">None (Unreinforced)</option>
                    </select>
                  </div>
                </div>

                {/* 9. note */}
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    note
                  </label>
                  <textarea
                    rows={2}
                    value={design.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Fabrication instructions, site tolerances, glass stickers..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSaveDesign}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Specs</span>
                </button>
                <button
                  type="button"
                  onClick={onContinueToQuotation}
                  className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Open Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: COLOR (Lamination & Finishes)                                */}
          {/* ================================================================= */}
          {activeTab === 'color' && (
            <div className="space-y-3.5">
              {/* Exterior Finish */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-600" />
                    Exterior Profile Lamination
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {design.profileColor || 'Pure White'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Pure White', hex: '#ffffff', border: 'border-slate-300' },
                    { name: 'Anthracite Grey', hex: '#374151', text: 'text-white' },
                    { name: 'Jet Black', hex: '#18181b', text: 'text-white' },
                    { name: 'Golden Oak', hex: '#b45309', text: 'text-white' },
                    { name: 'Dark Walnut', hex: '#5c3a21', text: 'text-white' },
                    { name: 'Bronze', hex: '#78350f', text: 'text-white' },
                  ].map((color) => {
                    const isSelected = (design.profileColor || 'Pure White') === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => updateField('profileColor', color.name)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border shrink-0 ${color.border || 'border-transparent'}`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[11px] font-semibold text-slate-800 truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Color Option */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Interior Dual-Color
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dualColor}
                      onChange={(e) => setDualColor(e.target.checked)}
                      className="rounded text-blue-600 w-3.5 h-3.5"
                    />
                    <span className="text-[10px] font-semibold text-slate-600">Enable Dual-Tone</span>
                  </label>
                </div>

                {dualColor ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Pure White', hex: '#ffffff', border: 'border-slate-300' },
                      { name: 'Anthracite Grey', hex: '#374151' },
                      { name: 'Golden Oak', hex: '#b45309' },
                      { name: 'Dark Walnut', hex: '#5c3a21' },
                    ].map((color) => {
                      const isSelected = interiorColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setInteriorColor(color.name)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border shrink-0 ${color.border || 'border-transparent'}`}
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-[11px] font-semibold text-slate-800 truncate">{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 py-1">
                    Profile uses uniform exterior finish ({design.profileColor || 'Pure White'}) for both sides.
                  </div>
                )}
              </div>

              {/* Surface Finish / Texture */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                <span className="font-bold text-slate-900 text-xs block pb-1 border-b border-slate-100">
                  Surface Texture
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Smooth Matte', 'High Gloss', 'Woodgrain Embossed'].map((finish) => {
                    const isSelected = (design.finishType || 'Smooth Matte') === finish;
                    return (
                      <button
                        key={finish}
                        type="button"
                        onClick={() => updateField('finishType', finish)}
                        className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {finish}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: TREE (Hierarchical Structure)                                */}
          {/* ================================================================= */}
          {activeTab === 'tree' && (
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5 font-mono text-xs">
              <div className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between font-sans">
                <span>Design Tree Structure</span>
                <span className="text-[10px] text-slate-400">{design.id}</span>
              </div>

              {/* Root Window */}
              <div
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer font-bold text-slate-800 flex items-center justify-between"
                onClick={() => onSelectComponent({ type: 'frame', id: 'frame-outer' })}
              >
                <span>{design.id} ({design.windowType})</span>
                <span className="text-slate-400 text-[10px]">{design.width}×{design.height}mm</span>
              </div>

              {/* Outer Frame */}
              <div
                className={`pl-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedType === 'frame' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => onSelectComponent({ type: 'frame', id: 'frame-outer' })}
              >
                <span>├─ Outer Frame ({design.profileBrand} {design.profileSystem})</span>
              </div>

              {/* Arch Head if present */}
              {design.hasArch && (
                <div
                  className={`pl-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedType === 'arch' ? 'text-purple-600 font-bold' : 'text-purple-700 hover:text-purple-900'
                  }`}
                  onClick={() => onSelectComponent({ type: 'arch', id: 'arch-head' })}
                >
                  <span>├─ Arch Head (Rise: {design.archHeight}mm)</span>
                </div>
              )}

              {/* Openings & Panels */}
              {design.panels.map((p, idx) => {
                const isSelected = selectedId === p.id || selectedId === p.sashId || selectedId === p.glassId;
                const gDims = calculateGlassDimensions(design, idx);

                return (
                  <div key={p.id} className="pl-4 space-y-1">
                    <div
                      className={`py-1 flex items-center gap-2 cursor-pointer transition-colors ${
                        isSelected ? 'text-cyan-700 font-bold' : 'text-slate-700 hover:text-slate-900'
                      }`}
                      onClick={() => onSelectComponent({ type: 'panel', id: p.id })}
                    >
                      <span>├─ Opening {p.name || `A${idx + 1}`} ({p.panelType})</span>
                    </div>

                    {/* Sash */}
                    {p.panelType !== 'fixed' && (
                      <div
                        className="pl-4 py-0.5 text-slate-500 hover:text-cyan-600 cursor-pointer text-[11px]"
                        onClick={() => onSelectComponent({ type: 'sash', id: p.sashId || p.id })}
                      >
                        <span>│  ├─ Sash ({p.openingDirection})</span>
                      </div>
                    )}

                    {/* Glass */}
                    <div
                      className="pl-4 py-0.5 text-sky-600 hover:text-sky-800 cursor-pointer text-[11px] font-semibold"
                      onClick={() => onSelectComponent({ type: 'glass', id: p.glassId })}
                    >
                      <span>│  └─ Glass {p.glassId} ({gDims.width}×{gDims.height}mm)</span>
                    </div>
                  </div>
                );
              })}

              {/* Mullions */}
              {(design.mullions || []).map((m) => (
                <div
                  key={m.id}
                  className={`pl-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedId === m.id ? 'text-indigo-600 font-bold' : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                  onClick={() => onSelectComponent({ type: 'mullion', id: m.id })}
                >
                  <span>├─ Mullion {m.id} (X: {Math.round(innerW * (m.positionRatio || 0.5))}mm)</span>
                </div>
              ))}

              {/* Transoms */}
              {(design.transoms || []).map((t) => (
                <div
                  key={t.id}
                  className={`pl-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedId === t.id ? 'text-indigo-600 font-bold' : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                  onClick={() => onSelectComponent({ type: 'transom', id: t.id })}
                >
                  <span>└─ Transom {t.id} (Y: {Math.round(innerH * (t.positionRatio || 0.35))}mm)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
