'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GlassType,
  MeshType,
  ProfileBrand,
  ProfileColor,
  WindowDesign,
  WindowType,
} from '@/lib/types';
import {
  Layers,
  Maximize2,
  Palette,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  Box,
  Sliders,
  Check,
} from 'lucide-react';

interface WindowControlsProps {
  design: WindowDesign;
  onChange: (updates: Partial<WindowDesign>) => void;
  onNext?: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  design,
  onChange,
  onNext,
}) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    'dimensions' | 'glass' | 'mesh' | 'profile' | 'hardware'
  >('dimensions');

  const windowTypes: { id: WindowType; label: string; desc: string }[] = [
    { id: 'sliding_2track', label: '2 Track Sliding', desc: '2 Panels Overlapping' },
    { id: 'sliding_3track', label: '3 Track Sliding', desc: '3 Panels with Mesh Track' },
    { id: 'casement_single', label: 'Single Casement', desc: 'Outward/Inward Swing' },
    { id: 'casement_double', label: 'French Double Window', desc: 'Master & Slave Sashes' },
    { id: 'fixed', label: 'Fixed Window', desc: 'Panoramic Direct Glazing' },
  ];

  const brands: ProfileBrand[] = ['VEKA', 'REHAU', 'KOMMERLING', 'ALUPLAST'];

  const colors: { id: ProfileColor; label: string; bg: string; border: string }[] = [
    { id: 'pure_white', label: 'Pure White', bg: '#FFFFFF', border: '#CBD5E1' },
    { id: 'anthracite_grey', label: 'Anthracite', bg: '#374151', border: '#1F2937' },
    { id: 'golden_oak', label: 'Golden Oak', bg: '#B45309', border: '#78350F' },
    { id: 'walnut', label: 'Dark Walnut', bg: '#451A03', border: '#1C0A00' },
    { id: 'jet_black', label: 'Jet Black', bg: '#18181B', border: '#09090B' },
  ];

  const glassOptions: {
    id: GlassType;
    label: string;
    thickness: string;
    desc: string;
    fragmentColor: string;
  }[] = [
    {
      id: 'clear_5mm',
      label: '5mm Clear Float Glass',
      thickness: '5 mm Single Pane',
      desc: 'Standard residential daylighting',
      fragmentColor: '#E0F2FE',
    },
    {
      id: 'toughened_6mm',
      label: '6mm Toughened Safety Glass',
      thickness: '6 mm Thermal Tempered',
      desc: 'High impact safety & structural resistance',
      fragmentColor: '#C7D2FE',
    },
    {
      id: 'dgu_5_12_5',
      label: '22mm DGU Soundproof Insulated',
      thickness: '5mm + 12A + 5mm Argon Space',
      desc: 'Acoustic sound damping & heat barrier',
      fragmentColor: '#A5F3FC',
    },
    {
      id: 'frosted_5mm',
      label: '5mm Privacy Frosted Glass',
      thickness: '5 mm Acid-Etched',
      desc: 'Total privacy for bathrooms & cabins',
      fragmentColor: '#F1F5F9',
    },
    {
      id: 'tinted_reflective',
      label: 'Solar Tinted Reflective Glass',
      thickness: '6 mm Reflective Coating',
      desc: 'Solar heat rejection & glare reduction',
      fragmentColor: '#64748B',
    },
  ];

  const meshOptions: { id: MeshType; label: string; desc: string }[] = [
    { id: 'none', label: 'No Mosquito Mesh', desc: 'Glass only system' },
    {
      id: 'ss304_mesh',
      label: 'SS-304 High-Tensile Steel Mesh',
      desc: 'Tear-resistant steel mosquito barrier',
    },
    {
      id: 'fiber_mesh',
      label: 'Durable Fiberglass Mesh',
      desc: 'Lightweight invisible insect screen',
    },
  ];

  const hardwareOptions = [
    { id: 'popup_flush', label: 'Touch Pop-up Flush Handle', brand: 'Kinlong' },
    { id: 'crescent', label: 'Heavy Crescent Cam Lock', brand: 'Chugn' },
    { id: 'espag_transmission', label: 'Espagnolette Multi-point Lock', brand: 'Roto' },
    { id: 'friction_stay', label: 'SS-304 Friction Stay Hinges', brand: 'Securistyle' },
  ];

  const bom = design.calculatedBOM;
  const currentGlass = glassOptions.find((g) => g.id === design.glassType) || glassOptions[0];

  const handleNextQuotation = () => {
    if (onNext) {
      onNext();
    } else {
      router.push(`/projects/${design.projectId}/quotation`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Step Tabs Navigation */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold overflow-x-auto">
        {[
          { id: 'dimensions', label: '1. Size' },
          { id: 'glass', label: '2. Glass' },
          { id: 'mesh', label: '3. Mesh' },
          { id: 'profile', label: '4. Profile' },
          { id: 'hardware', label: '5. Hardware' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex-1 py-1.5 px-2 text-center rounded-lg transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MEASUREMENTS & DIMENSIONS */}
      {activeSection === 'dimensions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Window Archetype
            </label>
            <div className="space-y-1.5">
              {windowTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    const isCasement = t.id.startsWith('casement');
                    onChange({
                      type: t.id,
                      name: t.label,
                      openingDirection: isCasement ? 'casement_left' : 'sliding_left',
                      tracks: t.id === 'sliding_3track' ? 3 : t.id === 'sliding_2track' ? 2 : 1,
                      sashes: t.id === 'sliding_3track' ? 3 : t.id === 'casement_double' ? 2 : t.id === 'casement_single' ? 1 : 2,
                    });
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${
                    design.type === t.id
                      ? 'bg-blue-50/80 border-[#0A2E8A] text-[#0A2E8A] font-bold ring-1 ring-[#0A2E8A]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold">{t.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{t.desc}</p>
                  </div>
                  {design.type === t.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#0A2E8A]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Width & Height Dimensions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Outer Width (W)</span>
                <span className="font-mono text-[#0A2E8A] font-bold">{design.width} mm</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min="400"
                  max="3600"
                  step="10"
                  value={design.width}
                  onChange={(e) => onChange({ width: Number(e.target.value) })}
                  className="flex-1 accent-[#0A2E8A] cursor-pointer"
                />
                <input
                  type="number"
                  value={design.width}
                  onChange={(e) => onChange({ width: Number(e.target.value) })}
                  className="w-20 px-2 py-1 text-right text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Outer Height (H)</span>
                <span className="font-mono text-[#0A2E8A] font-bold">{design.height} mm</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="10"
                  value={design.height}
                  onChange={(e) => onChange({ height: Number(e.target.value) })}
                  className="flex-1 accent-[#0A2E8A] cursor-pointer"
                />
                <input
                  type="number"
                  value={design.height}
                  onChange={(e) => onChange({ height: Number(e.target.value) })}
                  className="w-20 px-2 py-1 text-right text-xs font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GLASS & VISUAL GLASS FRAGMENT INDICATOR */}
      {activeSection === 'glass' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Glass Pane Selection
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0A2E8A]">
              {bom?.glassPanels?.length || 1} Pane(s)
            </span>
          </div>

          {/* Visual Glass Fragment Indicator Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#0A2E8A]" />
                <span>Visual Glass Fragment</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {currentGlass.thickness}
              </span>
            </div>

            {/* Glass Fragment Schematic Swatch */}
            <div className="h-28 rounded-xl border border-slate-300 relative overflow-hidden flex items-center justify-center shadow-inner">
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{ backgroundColor: currentGlass.fragmentColor }}
              />
              {/* Internal Glass Reflection Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* DGU Spacer Bar Indicator if double glazed */}
              {design.glassType === 'dgu_5_12_5' && (
                <div className="absolute inset-2 border-2 border-dashed border-cyan-800/60 rounded flex items-center justify-center">
                  <span className="bg-cyan-950/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                    12mm ARGON CAVITY
                  </span>
                </div>
              )}

              {/* Glass Fragment Label */}
              <div className="relative z-10 text-center bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {currentGlass.label}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Daylight: {design.width - 150} × {design.height - 150} mm (
                  {bom?.totalGlassSqFt || 0} sq.ft)
                </p>
              </div>
            </div>
          </div>

          {/* Glass Type Options */}
          <div className="space-y-1.5">
            {glassOptions.map((g) => (
              <button
                key={g.id}
                onClick={() => onChange({ glassType: g.id })}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all border ${
                  design.glassType === g.id
                    ? 'bg-blue-50/80 border-[#0A2E8A] text-[#0A2E8A] font-bold ring-1 ring-[#0A2E8A]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">{g.label}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{g.desc}</p>
                </div>
                {design.glassType === g.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#0A2E8A]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MESH SCREEN / MOSQUITO DOOR */}
      {activeSection === 'mesh' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Mosquito Mesh / Flyscreen Barrier
          </label>

          <div className="space-y-2">
            {meshOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => onChange({ meshType: m.id })}
                className={`w-full p-3 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${
                  design.meshType === m.id
                    ? 'bg-blue-50 border-[#0A2E8A] text-[#0A2E8A] font-bold ring-1 ring-[#0A2E8A]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{m.desc}</p>
                </div>
                {design.meshType === m.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#0A2E8A]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <p className="font-bold text-slate-800">Note on 3-Track Systems:</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecting SS-304 mosquito mesh on a 3-track sliding window automatically allocates
              an independent sliding mesh sash with dedicated nylon rollers.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: PROFILE BRAND & FINISH */}
      {activeSection === 'profile' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Profile Brand System
            </label>
            <div className="grid grid-cols-2 gap-2">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => onChange({ profileBrand: b })}
                  className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all border ${
                    design.profileBrand === b
                      ? 'bg-[#0A2E8A] text-white border-[#0A2E8A] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Profile Finish & Lamination
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onChange({ profileColor: c.id })}
                  title={c.label}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border ${
                    design.profileColor === c.id
                      ? 'bg-blue-50 border-[#0A2E8A] ring-2 ring-[#0A2E8A]/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border shadow-inner"
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                  />
                  <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: HARDWARE & ACCESSORIES */}
      {activeSection === 'hardware' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Hardware & Locking Mechanisms
          </label>
          <div className="space-y-2">
            {hardwareOptions.map((h) => (
              <div
                key={h.id}
                onClick={() =>
                  onChange({
                    hardware: { ...design.hardware, handleType: h.id as any },
                  })
                }
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  design.hardware.handleType === h.id
                    ? 'bg-blue-50 border-[#0A2E8A] text-[#0A2E8A] font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">{h.label}</p>
                  <p className="text-[10px] text-slate-400 font-normal">Brand: {h.brand}</p>
                </div>
                {design.hardware.handleType === h.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#0A2E8A]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-400 text-[10px] block font-bold uppercase">
            Est. Unit Price
          </span>
          <span className="text-base font-black text-[#0A2E8A] font-mono">
            ₹{design.unitPrice?.toLocaleString()}
          </span>
        </div>

        <div className="text-right text-[11px] text-slate-500">
          <span>{bom?.totalProfileMeters || 0}m Profile</span> •{' '}
          <span>{bom?.totalGlassSqFt || 0} sq.ft Glass</span>
        </div>
      </div>

      {/* Primary Action: GENERATE QUOTATION & SHARE */}
      <button
        onClick={handleNextQuotation}
        className="w-full py-3 bg-[#0A2E8A] hover:bg-[#08256E] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
      >
        <span>Generate Quotation & Share</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
