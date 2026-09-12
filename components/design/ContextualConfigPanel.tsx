'use client';

import React, { useState } from 'react';
import {
  ParametricWindowDesign,
  WindowPriceEstimate,
  WindowComponentType,
  GlassTypeName,
  ProfileBrandName,
  OpeningDirectionType,
  MeshTypeName,
  HardwareTypeName,
} from '@/lib/design/types';
import {
  calculateWindowPrice,
  getComponentSummaryList,
  mm2ToSqFt,
} from '@/lib/design/calculations';
import {
  Check,
  ChevronRight,
  Layers,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Maximize2,
  Box,
  DollarSign,
  ArrowRight,
  Save,
  Info,
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
  const componentSummary = getComponentSummaryList(design, estimate);

  // Active selected component type defaults to 'glass' if none selected
  const activeType: WindowComponentType = selectedComponent?.type || 'glass';

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
    // Also update all panels that use this glass or all panels
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

  // Helper to update selected panel's sash config
  const updateSashConfig = (
    sashId: string,
    patch: Partial<import('@/lib/design/types').SashComponentConfig>
  ) => {
    const existing = design.sashConfigs[sashId] || {
      openingDirection: 'sliding_right',
      hasMesh: false,
      glassConfig: design.defaultGlass,
      hardwareType: design.defaultHardware.type,
      hardwareRate: design.defaultHardware.rate,
    };
    onUpdateDesign({
      ...design,
      sashConfigs: {
        ...design.sashConfigs,
        [sashId]: {
          ...existing,
          ...patch,
        },
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] border-l border-slate-200 overflow-hidden text-slate-800 text-xs">
      {/* Scrollable two-column or stacked content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {/* ========================================================= */}
          {/* LEFT CARD: Window Details + Profile System + Components */}
          {/* ========================================================= */}
          <div className="space-y-3">
            {/* Window Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#1B64F2]" />
                  Window Details
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 text-[#1B64F2]">
                  {design.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Window ID
                  </label>
                  <input
                    type="text"
                    value={design.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Window Type
                  </label>
                  <select
                    value={design.windowType}
                    onChange={(e) => updateField('windowType', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                  >
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Casement Window">Casement Window</option>
                    <option value="Combination Window">Combination Window</option>
                    <option value="Fixed Window">Fixed Window</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Overall Width
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={10}
                      value={design.width}
                      onChange={(e) =>
                        updateField('width', Math.max(300, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-7 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Overall Height
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={10}
                      value={design.height}
                      onChange={(e) =>
                        updateField('height', Math.max(300, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-7 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                      mm
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 font-medium">
                      Quantity:
                    </label>
                    <select
                      value={design.quantity}
                      onChange={(e) =>
                        updateField('quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold text-slate-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Daylight Area:{' '}
                    <span className="font-semibold text-slate-700">
                      {estimate.totalAreaSqFt} sq.ft
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile System Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1B64F2]" />
                  Profile System
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  uPVC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Brand
                  </label>
                  <select
                    value={design.profileBrand}
                    onChange={(e) =>
                      updateField('profileBrand', e.target.value as ProfileBrandName)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                  >
                    <option value="VEKA">VEKA</option>
                    <option value="REHAU">REHAU</option>
                    <option value="KOMMERLING">Kömmerling</option>
                    <option value="ALUPLAST">Aluplast</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    System
                  </label>
                  <select
                    value={design.profileSystem}
                    onChange={(e) => updateField('profileSystem', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                  >
                    <option value="60 mm">60 mm System</option>
                    <option value="70 mm">70 mm System</option>
                    <option value="88 mm">88 mm System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Series
                  </label>
                  <select
                    value={design.profileSeries}
                    onChange={(e) => updateField('profileSeries', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                  >
                    <option value="Sliding Series">Sliding Series</option>
                    <option value="Casement Series">Casement Series</option>
                    <option value="Villa Series">Villa Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Color / Finish
                  </label>
                  <select
                    value={design.profileColor}
                    onChange={(e) => updateField('profileColor', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
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

            {/* Components List Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#1B64F2]" />
                  Components
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {componentSummary.length} items
                </span>
              </div>

              <div className="space-y-1">
                {componentSummary.map((item) => {
                  const isSelected = activeType === item.type;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onSelectComponent({
                          type: item.type,
                          id: item.id,
                        })
                      }
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#1B64F2] shadow-xs'
                          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isSelected
                              ? 'bg-[#1B64F2] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-[11px]">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.rateDescription}
                        </div>
                        <div className="font-semibold text-slate-700 text-xs">
                          ₹{item.cost.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT CARD: Contextual Inspector + Estimate Breakdown     */}
          {/* ========================================================= */}
          <div className="space-y-3">
            {/* Dynamic Inspector depending on selected component */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
              {activeType === 'glass' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1B64F2]" />
                      Glass Configuration
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                      All Panels
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Glass Type
                      </label>
                      <select
                        value={design.defaultGlass.glassType}
                        onChange={(e) =>
                          updateDefaultGlass({
                            glassType: e.target.value as GlassTypeName,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
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
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Thickness
                      </label>
                      <select
                        value={design.defaultGlass.thickness}
                        onChange={(e) =>
                          updateDefaultGlass({
                            thickness: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
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
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Color / Shade
                      </label>
                      <select
                        value={design.defaultGlass.color}
                        onChange={(e) =>
                          updateDefaultGlass({
                            color: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
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
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Rate (₹ / sq.ft)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated metrics for glass */}
                  <div className="bg-slate-50 rounded-lg p-2.5 grid grid-cols-3 gap-2 text-center border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400">Total Glass Area</div>
                      <div className="font-semibold text-slate-800 text-xs mt-0.5">
                        {estimate.totalGlassAreaSqFt} sq.ft
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Rate / sq.ft</div>
                      <div className="font-semibold text-slate-800 text-xs mt-0.5">
                        ₹{design.defaultGlass.ratePerSqFt}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Total Glass Cost</div>
                      <div className="font-semibold text-[#1B64F2] text-xs mt-0.5">
                        ₹{estimate.glassCost.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeType === 'sash' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[#1B64F2]" />
                      Sash Configuration
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {design.panels.filter((p) => p.panelType !== 'fixed').length} Movable Panels
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Sash Rate (₹ / ft)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={design.sashRatePerFt}
                        onChange={(e) =>
                          updateField(
                            'sashRatePerFt',
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Hardware Type
                      </label>
                      <select
                        value={design.defaultHardware.type}
                        onChange={(e) =>
                          updateField('defaultHardware', {
                            ...design.defaultHardware,
                            type: e.target.value as HardwareTypeName,
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <option value="Standard Sliding Set">Standard Sliding Set</option>
                        <option value="Touch Lock">Touch Lock & Rollers</option>
                        <option value="Tandem Roller">Tandem Heavy Rollers</option>
                        <option value="Espag Handle">Espag Multi-point Handle</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-medium text-slate-800 text-[11px]">
                          Include Insect Screen / Fly Mesh
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Fiberglass mesh on sliding panels
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={design.defaultMesh.type !== 'None'}
                        onChange={(e) => {
                          const hasMesh = e.target.checked;
                          updateField('defaultMesh', {
                            type: hasMesh ? 'Fiberglass' : 'None',
                            ratePerSqFt: hasMesh ? 60 : 0,
                          });
                        }}
                        className="w-4 h-4 rounded text-[#1B64F2] focus:ring-[#1B64F2] border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeType === 'frame' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#1B64F2]" />
                      Frame Configuration
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Perimeter {(2 * (design.width + design.height) / 1000).toFixed(2)} m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Frame Rate (₹ / ft)
                      </label>
                      <input
                        type="number"
                        step={10}
                        value={design.frameRatePerFt}
                        onChange={(e) =>
                          updateField(
                            'frameRatePerFt',
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-1">
                        Profile System
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`${design.profileBrand} ${design.profileSystem}`}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      Corner joints are 45° mitred fusion welded with GI steel reinforcement (1.5mm) inside chambers.
                    </span>
                  </div>
                </div>
              )}

              {(activeType === 'mesh' || activeType === 'hardware' || activeType === 'mullion' || activeType === 'transom' || activeType === 'panel') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-800 text-xs capitalize flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[#1B64F2]" />
                      {activeType} Configuration
                    </span>
                  </div>

                  <div className="text-slate-600 text-xs">
                    {activeType === 'mesh' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium mb-1">
                            Mesh Type
                          </label>
                          <select
                            value={design.defaultMesh.type}
                            onChange={(e) =>
                              updateField('defaultMesh', {
                                ...design.defaultMesh,
                                type: e.target.value as MeshTypeName,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700"
                          >
                            <option value="Fiberglass">Fiberglass (Grey)</option>
                            <option value="Stainless Steel">Stainless Steel 304 (Security)</option>
                            <option value="Pleated">Pleated Retractable</option>
                            <option value="None">None</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium mb-1">
                            Rate / sq.ft (₹)
                          </label>
                          <input
                            type="number"
                            value={design.defaultMesh.ratePerSqFt}
                            onChange={(e) =>
                              updateField('defaultMesh', {
                                ...design.defaultMesh,
                                ratePerSqFt: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {activeType === 'hardware' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium mb-1">
                            Hardware Package
                          </label>
                          <select
                            value={design.defaultHardware.type}
                            onChange={(e) =>
                              updateField('defaultHardware', {
                                ...design.defaultHardware,
                                type: e.target.value as HardwareTypeName,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700"
                          >
                            <option value="Standard Sliding Set">Standard Sliding Set (Rollers + Touch Lock)</option>
                            <option value="Touch Lock">Heavy Duty Touch Lock</option>
                            <option value="Tandem Roller">Tandem Steel Rollers</option>
                            <option value="Espag Handle">Espag Multi-point System</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium mb-1">
                            Package Rate (₹)
                          </label>
                          <input
                            type="number"
                            value={design.defaultHardware.rate}
                            onChange={(e) =>
                              updateField('defaultHardware', {
                                ...design.defaultHardware,
                                rate: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {(activeType === 'mullion' || activeType === 'transom' || activeType === 'panel') && (
                      <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs">
                        {activeType === 'mullion' && 'Vertical division profile reinforcing the window frame and separating sliding/fixed sashes.'}
                        {activeType === 'transom' && 'Horizontal division profile dividing top and bottom glass / ventilator panels.'}
                        {activeType === 'panel' && 'Parametric panel layout with glass and sash assignments.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Estimate Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Estimate Breakdown
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {design.quantity} unit{design.quantity > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Profile System (Frame + Sashes)</span>
                  <span className="font-medium text-slate-800 font-mono">
                    ₹{estimate.profileCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Glass ({estimate.totalGlassAreaSqFt} sq.ft)</span>
                  <span className="font-medium text-slate-800 font-mono">
                    ₹{estimate.glassCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Hardware & Rollers</span>
                  <span className="font-medium text-slate-800 font-mono">
                    ₹{estimate.hardwareCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Insect Screen / Mesh</span>
                  <span className="font-medium text-slate-800 font-mono">
                    ₹{estimate.meshCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Fabrication & Labour</span>
                  <span className="font-medium text-slate-800 font-mono">
                    ₹{estimate.labourCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold text-slate-900 text-sm">
                  <span>Total Estimate</span>
                  <span className="text-[#1B64F2] font-mono text-base">
                    ₹{estimate.totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STICKY BOTTOM SUMMARY BAR (Matches Stitch Design)         */}
      {/* ========================================================= */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <span className="font-bold text-slate-900 text-sm">{design.id}</span>
            <span className="text-slate-500 text-xs ml-1.5">({design.name})</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-xs text-slate-600">
            Area: <span className="font-semibold text-slate-800">{estimate.totalAreaSqFt} sq.ft</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-xs text-slate-600">
            Qty: <span className="font-semibold text-slate-800">{design.quantity}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-xs text-slate-600">
            Estimated:{' '}
            <span className="font-bold text-base text-[#1B64F2] font-mono ml-1">
              ₹{estimate.totalCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSaveDesign}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>

          <button
            type="button"
            onClick={onContinueToQuotation}
            className="px-4 py-1.5 rounded-lg bg-[#1B64F2] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 hover:shadow-md active:scale-95"
          >
            Save & Continue to Quotation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
