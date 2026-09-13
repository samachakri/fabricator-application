'use client';

import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2, Layers } from 'lucide-react';
import { ParametricWindowDesign } from '@/lib/design/types';

interface ArchitecturalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: ParametricWindowDesign;
  projectName?: string;
}

export const ArchitecturalSheetModal: React.FC<ArchitecturalSheetModalProps> = ({
  isOpen,
  onClose,
  design,
  projectName = 'Residential Villa Project',
}) => {
  if (!isOpen) return null;

  const W = design.width || 1800;
  const H = design.height || 1200;
  const areaSqM = ((W * H) / 1000000).toFixed(2);
  const areaSqFt = ((W * H) / 92903).toFixed(1);
  const panelCount = design.panels?.length || 2;
  const panelWidth = Math.round(W / panelCount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="shrink-0 bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Architectural CAD Production Sheet</h3>
              <p className="text-[11px] text-slate-400">
                Window {design.id} • Elevation, Section A-A & Section B-B Drawing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Technical Drawing Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 flex justify-center">
          <div className="bg-white border-2 border-slate-800 shadow-md w-full max-w-4xl p-6 flex flex-col justify-between font-mono text-slate-900 text-xs">
            {/* Top Sheet Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-base font-black tracking-wider uppercase text-slate-900 block font-sans">
                  FABRICATOR PRO ARCHITECTURAL CAD
                </span>
                <span className="text-[11px] text-slate-500 font-sans">
                  Precision Shop Floor Fabrication & Glazing Specification
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 font-sans">DRAWING NO: DWG-{design.id}-REV01</span>
                <span className="text-[10px] text-slate-500 block font-sans">Scale 1:25 @ A3</span>
              </div>
            </div>

            {/* Drawing Canvas Area (Elevation + Section A-A + Section B-B) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
              {/* Left 2 Cols: Elevation inside Masonry Wall with Dimension Lines */}
              <div className="md:col-span-2 border border-slate-300 p-4 bg-slate-50/40 rounded-lg flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase mb-2">
                  Front Elevation in Wall Opening
                </span>

                <svg viewBox="0 0 420 320" className="w-full max-h-[300px] stroke-slate-800 fill-none stroke-[1.5]">
                  <defs>
                    <pattern id="brickHatch" width="20" height="10" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="0" y1="5" x2="20" y2="5" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="0" y1="0" x2="0" y2="5" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="10" y1="5" x2="10" y2="10" stroke="#cbd5e1" strokeWidth="1" />
                    </pattern>
                  </defs>

                  {/* Masonry Wall Background with Hatch */}
                  <rect x="20" y="20" width="380" height="260" fill="url(#brickHatch)" stroke="#94a3b8" />

                  {/* Wall Opening Cutout */}
                  <rect x="80" y="50" width="260" height="190" fill="#ffffff" stroke="#334155" strokeWidth="2" />

                  {/* Window Outer Frame */}
                  <rect x="88" y="58" width="244" height="174" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />

                  {/* Sashes & Glass */}
                  <line x1="210" y1="58" x2="210" y2="232" stroke="#1e293b" strokeWidth="2" />
                  <rect x="96" y="66" width="106" height="158" fill="#e0f2fe" stroke="#334155" strokeWidth="1.8" />
                  <rect x="218" y="66" width="106" height="158" fill="#e0f2fe" stroke="#334155" strokeWidth="1.8" />

                  {/* Sash Opening Arrows */}
                  <path d="M120 145 H170 M160 138 L170 145 L160 152" stroke="#1B64F2" strokeWidth="2" />
                  <path d="M290 145 H240 M250 138 L240 145 L250 152" stroke="#1B64F2" strokeWidth="2" />

                  {/* Horizontal Section Line A-A */}
                  <line x1="40" y1="145" x2="380" y2="145" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 3" />
                  <text x="45" y="140" fill="#dc2626" fontSize="11" fontWeight="bold">SEC A</text>
                  <text x="360" y="140" fill="#dc2626" fontSize="11" fontWeight="bold">SEC A</text>

                  {/* Vertical Section Line B-B */}
                  <line x1="150" y1="30" x2="150" y2="270" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 3" />
                  <text x="155" y="42" fill="#dc2626" fontSize="11" fontWeight="bold">SEC B</text>
                  <text x="155" y="268" fill="#dc2626" fontSize="11" fontWeight="bold">SEC B</text>

                  {/* Width Dimension Line (Bottom) in Blue */}
                  <line x1="88" y1="246" x2="332" y2="246" stroke="#1B64F2" strokeWidth="1.5" />
                  <line x1="88" y1="238" x2="88" y2="252" stroke="#1B64F2" strokeWidth="1.5" />
                  <line x1="332" y1="238" x2="332" y2="252" stroke="#1B64F2" strokeWidth="1.5" />
                  <text x="210" y="260" fill="#1B64F2" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {W} mm
                  </text>

                  {/* Height Dimension Line (Left) in Blue */}
                  <line x1="72" y1="58" x2="72" y2="232" stroke="#1B64F2" strokeWidth="1.5" />
                  <line x1="64" y1="58" x2="78" y2="58" stroke="#1B64F2" strokeWidth="1.5" />
                  <line x1="64" y1="232" x2="78" y2="232" stroke="#1B64F2" strokeWidth="1.5" />
                  <text x="56" y="150" fill="#1B64F2" fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(-90 56, 150)">
                    {H} mm
                  </text>
                </svg>
              </div>

              {/* Right Col: Vertical Cross Section B-B Detail */}
              <div className="border border-slate-300 p-4 bg-slate-50/40 rounded-lg flex flex-col items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase mb-1">
                  SEC B-B (Vertical Jamb & Sill)
                </span>

                <svg viewBox="0 0 160 280" className="w-full max-h-[260px] stroke-slate-800 fill-none stroke-[1.5]">
                  {/* Concrete Lintel */}
                  <rect x="30" y="10" width="100" height="35" fill="#e2e8f0" />
                  <text x="80" y="32" fontSize="9" textAnchor="middle" fill="#64748b">LINTEL</text>

                  {/* Top Outer Frame Profile */}
                  <rect x="45" y="45" width="70" height="25" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                  <rect x="58" y="50" width="24" height="15" fill="#fef08a" stroke="#ca8a04" />

                  {/* Top Sash */}
                  <rect x="55" y="70" width="50" height="20" fill="#f8fafc" stroke="#334155" />

                  {/* Glass Pane */}
                  <rect x="75" y="90" width="10" height="90" fill="#bae6fd" stroke="#0284c7" />

                  {/* Bottom Sash */}
                  <rect x="55" y="180" width="50" height="20" fill="#f8fafc" stroke="#334155" />

                  {/* Bottom Outer Frame Profile with Weep Hole */}
                  <rect x="45" y="200" width="70" height="30" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                  <rect x="58" y="205" width="24" height="18" fill="#fef08a" stroke="#ca8a04" />
                  <circle cx="95" cy="222" r="3" fill="#3b82f6" />
                  <text x="125" y="225" fontSize="8" fill="#3b82f6">Drain Weep</text>

                  {/* Stone Sill */}
                  <rect x="25" y="230" width="110" height="35" fill="#cbd5e1" />
                  <text x="80" y="252" fontSize="9" textAnchor="middle" fill="#475569">STONE SILL</text>
                </svg>
              </div>
            </div>

            {/* Bill of Materials (BOM) & Fabrication Schedules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-[11px]">
              {/* Profile & Steel Schedule */}
              <div className="border border-slate-300 rounded-lg p-3">
                <span className="font-bold text-slate-800 uppercase block mb-1 font-sans">
                  1. Profile & Reinforcement Schedule
                </span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-1">Item</th>
                      <th className="py-1">Section</th>
                      <th className="py-1">Cut Length</th>
                      <th className="py-1 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1">Outer Frame Head/Sill</td>
                      <td>88BS Frame</td>
                      <td>{W} mm</td>
                      <td className="text-right font-bold">2</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1">Outer Frame Jambs</td>
                      <td>88BS Frame</td>
                      <td>{H} mm</td>
                      <td className="text-right font-bold">2</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1">Sash Rails</td>
                      <td>60mm Sash</td>
                      <td>{panelWidth} mm</td>
                      <td className="text-right font-bold">{panelCount * 2}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-amber-700">GI Steel Reinforce</td>
                      <td>1.5mm GI Tube</td>
                      <td>{W - 100} mm</td>
                      <td className="text-right font-bold text-amber-700">4</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Glazing & Hardware Schedule */}
              <div className="border border-slate-300 rounded-lg p-3">
                <span className="font-bold text-slate-800 uppercase block mb-1 font-sans">
                  2. Glazing & Hardware Package
                </span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-1">Component</th>
                      <th className="py-1">Specification</th>
                      <th className="py-1 text-right">Qty / Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-medium">Glass Panels</td>
                      <td>5mm Clear Toughened</td>
                      <td className="text-right font-bold">{areaSqM} m² ({panelCount} panels)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-medium">Bearing Rollers</td>
                      <td>Tandem Brass Rollers</td>
                      <td className="text-right font-bold">{panelCount * 2} Units</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-medium">Locking System</td>
                      <td>Multi-point Espagnolette</td>
                      <td className="text-right font-bold">{panelCount} Sets</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">EPDM Gaskets</td>
                      <td>Dual Lip Weatherseal</td>
                      <td className="text-right font-bold">{(W * 2 + H * 2) * 2 / 1000} m</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Title Block matching Reference Screenshot */}
            <div className="border-2 border-slate-800 mt-2 p-3 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 text-[10px]">
              <div>
                <span className="text-slate-400 block uppercase font-bold">PROJECT</span>
                <span className="font-bold text-slate-900 text-xs">{projectName}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">LOCATION / TAG</span>
                <span className="font-bold text-slate-900 text-xs">Window {design.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">TOTAL APERTURE</span>
                <span className="font-bold text-indigo-700 text-xs">
                  {W} × {H} mm ({areaSqFt} sq.ft)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">APPROVAL STATUS</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  APPROVED FOR CUTTING
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
