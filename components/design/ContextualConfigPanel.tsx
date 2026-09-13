'use client';

import React, { useState } from 'react';
import {
  ParametricWindowDesign,
  WindowPriceEstimate,
  WindowComponentType,
  GlassTypeName,
  ProfileBrandName,
  CustomSectionItem,
} from '@/lib/design/types';
import {
  calculateWindowPrice,
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

  // Custom sections helper
  const customSections: CustomSectionItem[] = design.customSections || [];

  const handleAddCustomSection = () => {
    const newId = `sec-${Date.now()}`;
    const newItem: CustomSectionItem = {
      id: newId,
      name: 'New Hardware / Section',
      category: 'Hardware',
      quantity: 1,
      unitPrice: 250,
    };
    onUpdateDesign({
      ...design,
      customSections: [...customSections, newItem],
    });
  };

  const handleUpdateCustomSection = (id: string, patch: Partial<CustomSectionItem>) => {
    const updated = customSections.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    onUpdateDesign({
      ...design,
      customSections: updated,
    });
  };

  const handleDeleteCustomSection = (id: string) => {
    const updated = customSections.filter((item) => item.id !== id);
    onUpdateDesign({
      ...design,
      customSections: updated,
    });
  };

  // Calculate glass panels dimensions
  const innerW = Math.max(200, (design.width || 1800) - 120);
  const innerH = Math.max(200, (design.height || 1200) - 120);
  const panelCount = Math.max(1, design.panels?.length || 1);

  const glassPanels = (design.panels || []).map((panel, idx) => {
    const pW = Math.round(innerW * (panel.widthRatio || 1 / panelCount));
    const pH = Math.round(innerH * (panel.heightRatio || 1));
    const glassW = Math.max(50, panel.panelType === 'fixed' ? pW - 20 : pW - 90);
    const glassH = Math.max(50, panel.panelType === 'fixed' ? pH - 20 : pH - 90);
    const areaSqFt = parseFloat(mm2ToSqFt(glassW * glassH).toFixed(2));
    const cost = Math.round(areaSqFt * (design.defaultGlass.ratePerSqFt || 180));
    return {
      id: panel.id,
      name: panel.name || `Panel ${idx + 1}`,
      glassW,
      glassH,
      areaSqFt,
      cost,
    };
  });

  // Active selected panel for inspector
  const selectedPanelId = selectedComponent?.id;
  const selectedPanel = design.panels?.find((p) => p.id === selectedPanelId) || null;

  // Split selected bay vertically
  const handleSplitSelectedBay = () => {
    if (!selectedPanel) return;
    const panelIdx = design.panels.findIndex((p) => p.id === selectedPanel.id);
    if (panelIdx === -1) return;

    const target = design.panels[panelIdx];
    const halfW = target.widthRatio / 2;

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
      xRatio: target.xRatio + halfW,
      widthRatio: halfW,
      openingDirection: target.openingDirection === 'sliding_right' ? 'sliding_left' as const : 'sliding_right' as const,
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

    const removed = design.panels[panelIdx];
    const newPanels = design.panels.filter((p) => p.id !== selectedPanel.id);

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

    const newMullions = [];
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

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] border-l border-slate-200 overflow-hidden text-slate-800 text-xs font-sans">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        
                {/* ========================================================= */}
        {/* 0. ACTIVE BAY / ELEMENT INSPECTOR (WinQuoter Standard)    */}
        {/* ========================================================= */}
        {selectedPanel ? (
          <div className="bg-white rounded-xl border border-cyan-400 p-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[11px] font-mono">
                  {selectedPanel.name || 'A1'}
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  Active Bay Configuration
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectComponent(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Deselect
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                  Operation / Opening Style
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { type: 'fixed', dir: 'fixed', label: 'Fixed Glass' },
                    { type: 'sliding', dir: 'sliding_left', label: 'Sliding (◄)' },
                    { type: 'sliding', dir: 'sliding_right', label: 'Sliding (►)' },
                    { type: 'casement', dir: 'casement_left', label: 'Casement (◄)' },
                    { type: 'casement', dir: 'casement_right', label: 'Casement (►)' },
                    { type: 'casement', dir: 'top_hung', label: 'Top Hung' },
                  ].map((opt) => {
                    const isCurrent =
                      selectedPanel.panelType === opt.type &&
                      (selectedPanel.openingDirection === opt.dir ||
                        (opt.type === 'fixed' && selectedPanel.panelType === 'fixed'));
                    return (
                      <button
                        key={opt.dir}
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
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                          isCurrent
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bay Dimensions in mm */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Width (mm)
                  </label>
                  <div className="relative">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-5 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-bold">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Height (mm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={Math.round(innerH * (selectedPanel.heightRatio || 1))}
                      onChange={(e) => {
                        const targetVal = Number(e.target.value);
                        if (!targetVal || targetVal <= 100) return;
                        const targetRatio = targetVal / innerH;
                        if (targetRatio >= 0.95 || targetRatio <= 0.05) return;
                        const updated = design.panels.map((p) =>
                          p.id === selectedPanel.id ? { ...p, heightRatio: targetRatio } : p
                        );
                        onUpdateDesign({ ...design, panels: updated });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-5 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-bold">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Bug Mesh
                  </label>
                  <label className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
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
                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                    />
                    <span className="text-[10px] font-semibold text-slate-700">SS304</span>
                  </label>
                </div>
              </div>

              {/* Split or Delete Actions */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSplitSelectedBay}
                  className="flex-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1B64F2] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors text-center"
                  title="Split this bay vertically in half"
                >
                  + Mullion (V)
                </button>
                <button
                  type="button"
                  onClick={handleSplitSelectedBayHorizontally}
                  className="flex-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors text-center"
                  title="Split this bay horizontally into Top & Bottom Transom"
                >
                  + Transom (H)
                </button>
                {design.panels.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelectedBay}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Delete Bay
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100 p-3 text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                Click any bay on the canvas to configure its sliding/casement type, split with mullions, or edit width.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. GLASS DETAILS & MEASUREMENTS (Per user request)         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B64F2]" />
              Glass Details & Measurements
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
              Live Design Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Glass Type
              </label>
              <select
                value={design.defaultGlass.glassType}
                onChange={(e) =>
                  updateDefaultGlass({
                    glassType: e.target.value as GlassTypeName,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
              >
                <option value="Toughened">Toughened Glass</option>
                <option value="Clear">Clear Float Glass</option>
                <option value="Laminated">Laminated Glass</option>
                <option value="Frosted">Frosted Glass</option>
                <option value="Tinted">Tinted Glass</option>
                <option value="DGU / IGU">DGU / IGU Double Glazed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Thickness
              </label>
              <select
                value={design.defaultGlass.thickness}
                onChange={(e) =>
                  updateDefaultGlass({
                    thickness: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
              >
                <option value={4}>4 mm</option>
                <option value={5}>5 mm</option>
                <option value={6}>6 mm</option>
                <option value={8}>8 mm</option>
                <option value={10}>10 mm</option>
                <option value={12}>12 mm</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Color / Shade
              </label>
              <select
                value={design.defaultGlass.color}
                onChange={(e) =>
                  updateDefaultGlass({
                    color: e.target.value,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
              >
                <option value="Clear">Clear</option>
                <option value="Frosted">Frosted / Obscure</option>
                <option value="Bronze Tinted">Bronze Tinted</option>
                <option value="Green Tinted">Green Tinted</option>
                <option value="Grey Tinted">Grey Tinted</option>
                <option value="Reflective">Reflective</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Glass Rate (₹ / sq.ft)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  step={5}
                  value={design.defaultGlass.ratePerSqFt}
                  onChange={(e) =>
                    updateDefaultGlass({
                      ratePerSqFt: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Panel Glass Cut Measurements List */}
          <div className="space-y-1.5">
            <span className="block text-[11px] text-slate-500 font-semibold mb-1">
              Glass Cut Sizes Per Panel (Auto-Transferred to Technical Drawing):
            </span>
            {glassPanels.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No panels placed on canvas yet.</p>
            ) : (
              glassPanels.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#1B64F2] text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.glassW} × {p.glassH} mm
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {p.areaSqFt} sq.ft
                    </span>
                    <span className="text-slate-900 font-bold">
                      ₹{p.cost}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ARCH HEAD ATTACHMENT SETTINGS (Arch + Window Combination) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Arch Head Configuration
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!design.hasArch}
                onChange={(e) => {
                  onUpdateDesign({
                    ...design,
                    hasArch: e.target.checked,
                    archType: design.archType || 'round',
                    archHeight: design.archHeight || 500,
                    windowType: e.target.checked ? 'Combination Window' : design.windowType,
                  });
                }}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
              <span className="text-[11px] font-bold text-slate-700">Arch Attached</span>
            </label>
          </div>

          {design.hasArch && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Arch Style
                  </label>
                  <select
                    value={design.archType || 'round'}
                    onChange={(e) => updateField('archType', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <option value="round">Semi-Circular Round Arch</option>
                    <option value="gothic">Gothic Pointed Arch</option>
                    <option value="segmental">Segmental Low Rise Arch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                    Arch Rise / Height (mm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={10}
                      min={150}
                      max={2500}
                      value={design.archHeight || 500}
                      onChange={(e) =>
                        updateField('archHeight', Math.max(150, parseInt(e.target.value) || 500))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                      mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-purple-900">Total Unit Elevation:</div>
                  <div className="text-[11px] text-purple-700">
                    Window {design.height || 1200}mm + Arch {design.archHeight || 500}mm
                  </div>
                </div>
                <div className="font-black text-sm text-purple-800 font-mono">
                  {(design.height || 1200) + (design.archHeight || 500)} mm
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. PROFILE SYSTEM SPECIFICATIONS                          */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1B64F2]" />
              Profile System
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              uPVC Extrusions
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Profile Brand
              </label>
              <select
                value={design.profileBrand}
                onChange={(e) =>
                  updateField('profileBrand', e.target.value as ProfileBrandName)
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="VEKA">VEKA Systems</option>
                <option value="REHAU">REHAU</option>
                <option value="KOMMERLING">Kömmerling</option>
                <option value="ALUPLAST">Aluplast</option>
                <option value="Other">Other uPVC</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                Profile Color / Finish
              </label>
              <select
                value={design.profileColor}
                onChange={(e) => updateField('profileColor', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="Clear">Clear / Pure White</option>
                <option value="Anthracite Grey">Anthracite Grey</option>
                <option value="Golden Oak">Golden Oak (Wood Finish)</option>
                <option value="Walnut">Walnut</option>
                <option value="Jet Black">Jet Black</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. HARDWARE & CUSTOM SECTIONS (With "+ Add New" Button)   */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#1B64F2]" />
              Window Hardware & Custom Sections
            </span>
            <button
              type="button"
              onClick={handleAddCustomSection}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1B64F2] border border-blue-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Standard hardware package */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 text-xs">Standard Sliding Hardware</div>
                <div className="text-[10px] text-slate-400">Tandem rollers, interlocks & touch lock</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Rate:</span>
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={design.defaultHardware?.rate || 450}
                    onChange={(e) =>
                      updateField('defaultHardware', {
                        ...design.defaultHardware,
                        rate: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded px-2 pl-5 py-1 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Custom Sections / Hardware Added Manually by User */}
            {customSections.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.name}
                    placeholder="Section or Hardware Name..."
                    onChange={(e) => handleUpdateCustomSection(item.id, { name: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                  />
                  <select
                    value={item.category || 'Hardware'}
                    onChange={(e) => handleUpdateCustomSection(item.id, { category: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Profile Section">Profile Section</option>
                    <option value="Reinforcement">Reinforcement</option>
                    <option value="Accessory">Accessory</option>
                    <option value="Sealant">Sealant</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomSection(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateCustomSection(item.id, {
                          quantity: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-14 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Unit Price:</span>
                    <div className="relative w-20">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateCustomSection(item.id, {
                            unitPrice: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded pl-5 pr-1.5 py-1 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="font-bold text-slate-900 font-mono">
                    ₹{item.quantity * item.unitPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MANUAL PRICE DETAILS OF EVERY PART                      */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Price Details (Manual Override per Part)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {design.quantity} unit{design.quantity > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Profile Frame Rate */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">Profile System (Frame + Sash)</span>
                <span className="block text-[10px] text-slate-400">Frame: ₹{design.frameRatePerFt}/ft • Sash: ₹{design.sashRatePerFt}/ft</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={design.manualProfileCost !== undefined ? design.manualProfileCost : estimate.profileCost}
                  onChange={(e) =>
                    updateField('manualProfileCost', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-right text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Glass Cost */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">Glass ({estimate.totalGlassAreaSqFt} sq.ft)</span>
                <span className="block text-[10px] text-slate-400">{design.defaultGlass.thickness}mm {design.defaultGlass.glassType}</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={design.manualGlassCost !== undefined ? design.manualGlassCost : estimate.glassCost}
                  onChange={(e) =>
                    updateField('manualGlassCost', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-right text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Hardware & Rollers Cost */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">Hardware & Rollers</span>
                <span className="block text-[10px] text-slate-400">Base sliding set</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={design.manualHardwareCost !== undefined ? design.manualHardwareCost : estimate.hardwareCost}
                  onChange={(e) =>
                    updateField('manualHardwareCost', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-right text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Insect Screen / Mesh */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">Insect Screen / Mesh</span>
                <span className="block text-[10px] text-slate-400">Fiberglass mesh</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={design.manualMeshCost !== undefined ? design.manualMeshCost : estimate.meshCost}
                  onChange={(e) =>
                    updateField('manualMeshCost', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-right text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Labour & Fabrication */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">Fabrication & Labour</span>
                <span className="block text-[10px] text-slate-400">Welding, grooving & assembly</span>
              </div>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                <input
                  type="number"
                  value={design.manualLabourCost !== undefined ? design.manualLabourCost : estimate.labourCost}
                  onChange={(e) =>
                    updateField('manualLabourCost', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1 text-xs font-bold text-right text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Custom Sections Total */}
            {estimate.customSectionsCost ? (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="font-medium text-slate-700">Custom Sections / Hardware Total</span>
                <span className="font-bold text-slate-800 font-mono">₹{estimate.customSectionsCost}</span>
              </div>
            ) : null}

            {/* Grand Total */}
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">Grand Total Window Price</span>
              <span className="font-black text-base text-[#1B64F2] font-mono">
                ₹{estimate.totalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* STICKY BOTTOM SAVE & CONTINUE BAR                         */}
      {/* ========================================================= */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2 shadow-xs shrink-0">
        <div>
          <div className="font-bold text-slate-900 text-xs">
            {design.id} {design.name ? `• ${design.name}` : ''}
          </div>
          <div className="text-[11px] text-[#1B64F2] font-bold font-mono">
            ₹{estimate.totalCost.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveDesign}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={onContinueToQuotation}
            className="px-3.5 py-1.5 rounded-lg bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 hover:shadow-md cursor-pointer"
          >
            <span>Continue to Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
