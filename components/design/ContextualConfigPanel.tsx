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

function OutlinedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative border border-slate-300 rounded px-2.5 pt-4 pb-1.5 mb-2">
      <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-500 font-medium">
        {label}
      </span>
      {children}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<'order' | 'color'>('order');

  // Dual color toggle
  const [dualColor, setDualColor] = useState(false);
  const [interiorColor, setInteriorColor] = useState(design.profileColor || 'WHITE');
  const [exteriorColor, setExteriorColor] = useState(design.profileColor || 'WHITE');

  // Add screenshot unit and dim
  const [screenshotUnit, setScreenshotUnit] = useState('Millimeters');
  const [showDim, setShowDim] = useState(false);

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

  const selectedPanelIdx = (design.panels || []).findIndex(
    (p) => p.id === selectedId || p.sashId === selectedId || p.glassId === selectedId
  );
  const selectedPanel = selectedPanelIdx !== -1 ? design.panels[selectedPanelIdx] : null;
  const selectedGlassDetails = selectedPanelIdx !== -1 ? calculateGlassDimensions(design, selectedPanelIdx) : null;
  const selectedMullionIdx = (design.mullions || []).findIndex((m) => m.id === selectedId);
  const selectedMullion = selectedMullionIdx !== -1 ? design.mullions[selectedMullionIdx] : null;
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

  // Helper for rendering color swatches
  const colorSwatches = [
    { name: 'WHITE', hex: '#FFFFFF' },
    { name: 'MAHOGANY', hex: '#4A1D1D' },
    { name: 'GOLDEN OAK', hex: '#C28945' },
    { name: 'ANTHRACITE GREY', hex: '#383E42' },
    { name: 'JET BLACK', hex: '#111111' },
    { name: 'BRONZE', hex: '#594A3D' },
  ];

  return (
    <div className="flex h-full bg-white border-l border-slate-200 overflow-hidden text-slate-800 text-xs font-sans w-[280px] shrink-0">
      
      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-white">
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {activeTab === 'order' && (
            <div className="space-y-1">
              <OutlinedField label="width">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={design.width || 0}
                    onChange={(e) => updateField('width', Number(e.target.value) || 0)}
                    className="flex-1 w-full text-xs font-medium focus:outline-none bg-transparent"
                  />
                  <span className="text-slate-500 font-medium">mm</span>
                  <button className="bg-slate-200 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-slate-700 hover:bg-slate-300">d</button>
                </div>
              </OutlinedField>

              <OutlinedField label="height">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={design.height || 0}
                    onChange={(e) => updateField('height', Number(e.target.value) || 0)}
                    className="flex-1 w-full text-xs font-medium focus:outline-none bg-transparent"
                  />
                  <span className="text-slate-500 font-medium">mm</span>
                  <button className="bg-slate-200 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-slate-700 hover:bg-slate-300">d</button>
                </div>
              </OutlinedField>

              <OutlinedField label="area">
                <div className="w-full text-xs font-medium py-0.5 text-slate-600 bg-slate-50/50 rounded flex items-center">
                  {areaM2} m²
                </div>
              </OutlinedField>

              <OutlinedField label="win_no">
                <input
                  type="text"
                  value={design.id || ''}
                  onChange={(e) => updateField('id', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                />
              </OutlinedField>

              <OutlinedField label="count">
                <input
                  type="number"
                  value={design.quantity || 1}
                  onChange={(e) => updateField('quantity', Number(e.target.value) || 1)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                />
              </OutlinedField>

              <OutlinedField label="price">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">₹</span>
                  <input
                    type="number"
                    value={estimate.totalCost.toFixed(2)}
                    readOnly
                    className="flex-1 w-full text-xs font-medium focus:outline-none bg-transparent"
                  />
                </div>
              </OutlinedField>

              <OutlinedField label="frame">
                <select
                  value={design.profileSystem || ''}
                  onChange={(e) => updateField('profileSystem', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="RSC-42VF OUTER FRAME">RSC-42VF OUTER FRAME</option>
                  <option value="60mm Casement">60mm Casement</option>
                  <option value="88mm Sliding">88mm Sliding</option>
                </select>
              </OutlinedField>

              <OutlinedField label="mullion">
                <select className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none">
                  <option value="SLIDING MULLION">SLIDING MULLION</option>
                  <option value="CASEMENT MULLION">CASEMENT MULLION</option>
                  <option value="None">None</option>
                </select>
              </OutlinedField>

              <OutlinedField label="sash">
                <select className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none">
                  <option value="SLIDING SASH-84X">SLIDING SASH-84X</option>
                  <option value="CASEMENT SASH-60X">CASEMENT SASH-60X</option>
                  <option value="None">None</option>
                </select>
              </OutlinedField>

              <OutlinedField label="glass">
                <select
                  value={`${design.defaultGlass.thickness}mm ${design.defaultGlass.glassType} ${design.defaultGlass.color === 'Clear' ? 'Non T' : design.defaultGlass.color}`}
                  onChange={(e) => {}}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="5mm Clear Non T">5mm Clear Non T</option>
                  <option value="6mm Clear Toughened">6mm Clear Toughened</option>
                  <option value="8mm Frosted">8mm Frosted</option>
                  <option value="DGU 5-9-5">DGU 5-9-5</option>
                </select>
              </OutlinedField>

              <OutlinedField label="connector">
                <select
                  value={design.connector || 'H-COUPLER'}
                  onChange={(e) => updateField('connector', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="H-COUPLER">H-COUPLER</option>
                  <option value="None">None</option>
                </select>
              </OutlinedField>

              <OutlinedField label="cornerJoiner">
                <select
                  value={design.cornerJoiner || 'BAYPOLE-60X60'}
                  onChange={(e) => updateField('cornerJoiner', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="BAYPOLE-60X60">BAYPOLE-60X60</option>
                  <option value="90 DEGREE">90 DEGREE CORNER</option>
                  <option value="None">None</option>
                </select>
              </OutlinedField>

              <OutlinedField label="hardware">
                <select
                  value={design.defaultHardware.type}
                  onChange={(e) => updateField('defaultHardware', { ...design.defaultHardware, type: e.target.value as any })}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="Casement Window">Casement Window</option>
                  <option value="Sliding Window">Sliding Window</option>
                  <option value="Standard Sliding Set">Standard Sliding Set</option>
                  <option value="Touch Lock">Touch Lock</option>
                  <option value="Espag Handle">Espag Handle</option>
                </select>
              </OutlinedField>

              <OutlinedField label="internal">
                <select
                  value={interiorColor}
                  onChange={(e) => {
                    setInteriorColor(e.target.value);
                    if (!dualColor) setExteriorColor(e.target.value);
                    updateField('profileColor', e.target.value);
                  }}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="WHITE">WHITE</option>
                  <option value="MAHOGANY">MAHOGANY</option>
                  <option value="GOLDEN OAK">GOLDEN OAK</option>
                  <option value="ANTHRACITE GREY">ANTHRACITE GREY</option>
                </select>
              </OutlinedField>

              <OutlinedField label="position">
                <input
                  type="text"
                  value={design.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                  placeholder="Room name"
                />
              </OutlinedField>

              <OutlinedField label="screen">
                <select
                  value={design.screenType || 'None'}
                  onChange={(e) => updateField('screenType', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="None">None</option>
                  <option value="Fiber Mesh">Fiber Mesh</option>
                  <option value="SS304">SS304</option>
                </select>
              </OutlinedField>

              <OutlinedField label="hinge">
                <select
                  value={design.hingeType || 'None'}
                  onChange={(e) => updateField('hingeType', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="None">None</option>
                  <option value="Butt Hinge">Butt Hinge</option>
                  <option value="Friction Stay">Friction Stay</option>
                </select>
              </OutlinedField>

              <OutlinedField label="brand">
                <select
                  value={design.profileBrand || 'VEKA'}
                  onChange={(e) => updateField('profileBrand', e.target.value as ProfileBrandName)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="VEKA">VEKA</option>
                  <option value="REHAU">REHAU</option>
                  <option value="KOMMERLING">KOMMERLING</option>
                  <option value="ALUPLAST">ALUPLAST</option>
                  <option value="Other">Other</option>
                </select>
              </OutlinedField>

              <OutlinedField label="reinforcement">
                <select
                  value={design.reinforcement || '1.5mm GI Steel'}
                  onChange={(e) => updateField('reinforcement', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                >
                  <option value="1.5mm GI Steel">1.5mm GI Steel</option>
                  <option value="1.2mm GI Steel">1.2mm GI Steel</option>
                  <option value="2.0mm GI Steel">2.0mm GI Steel</option>
                  <option value="None">None</option>
                </select>
              </OutlinedField>

              <OutlinedField label="note">
                <textarea
                  value={design.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full text-xs font-medium focus:outline-none resize-none h-10 bg-transparent pt-1"
                />
              </OutlinedField>

              <div className="mt-4 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-slate-800 uppercase text-[10px]">opening</span>
                  <button className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                    edit
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={design.defaultGlass.color === 'Frosted'}
                        onChange={(e) => updateDefaultGlass({ color: e.target.checked ? 'Frosted' : 'Clear' })}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">frosted</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showDim}
                        onChange={(e) => setShowDim(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">dim</span>
                  </label>
                </div>

                <div className="mt-2">
                  <OutlinedField label="screenshot unit">
                    <select
                      value={screenshotUnit}
                      onChange={(e) => setScreenshotUnit(e.target.value)}
                      className="w-full text-xs font-medium focus:outline-none bg-transparent appearance-none"
                    >
                      <option value="Millimeters">Millimeters</option>
                      <option value="Inches">Inches</option>
                    </select>
                  </OutlinedField>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'color' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Dual Color</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={dualColor} onChange={(e) => setDualColor(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Interior Profile Color</h4>
                <div className="grid grid-cols-2 gap-2">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={`int-${swatch.name}`}
                      type="button"
                      onClick={() => {
                        setInteriorColor(swatch.name);
                        if (!dualColor) setExteriorColor(swatch.name);
                        updateField('profileColor', swatch.name);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded border ${interiorColor === swatch.name ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-slate-300 mb-1" style={{ backgroundColor: swatch.hex }} />
                      <span className="text-[9px] font-semibold text-center leading-tight">{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {dualColor && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 mt-4">Exterior Profile Color</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {colorSwatches.map((swatch) => (
                      <button
                        key={`ext-${swatch.name}`}
                        type="button"
                        onClick={() => {
                          setExteriorColor(swatch.name);
                          // Exterior color updating logic could go here
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded border ${exteriorColor === swatch.name ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="w-6 h-6 rounded-full border border-slate-300 mb-1" style={{ backgroundColor: swatch.hex }} />
                        <span className="text-[9px] font-semibold text-center leading-tight">{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 1. WINDOORCRAFT RIGHT VERTICAL TABS STRIP (~28px) */}
      <div className="w-7 bg-slate-100 border-l border-slate-300 flex flex-col items-center py-0 select-none shrink-0 z-10 shadow-[-1px_0_4px_rgba(0,0,0,0.05)]">
        {/* Order Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`w-full py-6 flex items-center justify-center transition-all border-b border-slate-300 ${
            activeTab === 'order'
              ? 'bg-red-600 text-white'
              : 'text-slate-600 hover:bg-slate-200 bg-slate-100'
          }`}
          title="Order Specifications"
        >
          <span className="text-[11px] font-bold tracking-widest uppercase origin-center -rotate-90 whitespace-nowrap inline-block w-4 h-16">
            order
          </span>
        </button>

        {/* Color Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('color')}
          className={`w-full py-6 flex items-center justify-center transition-all border-b border-slate-300 ${
            activeTab === 'color'
              ? 'bg-red-600 text-white'
              : 'text-slate-600 hover:bg-slate-200 bg-slate-100'
          }`}
          title="Profile Color"
        >
          <span className="text-[11px] font-bold tracking-widest uppercase origin-center -rotate-90 whitespace-nowrap inline-block w-4 h-16">
            color
          </span>
        </button>
      </div>

    </div>
  );
}
