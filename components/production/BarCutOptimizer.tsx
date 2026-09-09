'use client';

import React, { useMemo } from 'react';
import { WindowDesign } from '@/lib/types';
import { CutPiece, optimizeLinearCuts } from '@/lib/cut-optimizer';
import { Scissors, Package, Percent, CheckSquare, Sparkles } from 'lucide-react';

interface BarCutOptimizerProps {
  windows: WindowDesign[];
}

export const BarCutOptimizer: React.FC<BarCutOptimizerProps> = ({ windows }) => {
  // Aggregate all cuts from all windows in project
  const pieces: CutPiece[] = useMemo(() => {
    const list: CutPiece[] = [];

    windows.forEach((w) => {
      const bom = w.calculatedBOM;
      if (!bom) return;

      // Outer frame pieces
      bom.outerFrameCuts.forEach((c) => {
        for (let q = 0; q < c.qty * w.quantity; q++) {
          list.push({
            id: `${c.id}-${q}`,
            windowId: w.id,
            label: c.label,
            length: c.length,
            profileCode: c.profileCode,
            angleLeft: c.angleLeft,
            angleRight: c.angleRight,
          });
        }
      });

      // Sash pieces
      bom.sashCuts.forEach((s) => {
        for (let q = 0; q < s.qty * w.quantity; q++) {
          list.push({
            id: `${s.id}-${q}`,
            windowId: w.id,
            label: s.label,
            length: s.length,
            profileCode: s.profileCode,
            angleLeft: s.angleLeft,
            angleRight: s.angleRight,
          });
        }
      });
    });

    return list;
  }, [windows]);

  const optimization = useMemo(() => {
    return optimizeLinearCuts(pieces, 6000);
  }, [pieces]);

  // Color palette for cut pieces
  const pieceColors = [
    '#2563EB', // blue
    '#059669', // emerald
    '#D97706', // amber
    '#7C3AED', // purple
    '#DC2626', // red
    '#0891B2', // cyan
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header & Efficiency Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#0A2E8A] font-bold text-sm">
            <Scissors className="w-4 h-4" />
            <span>1D Stock Bar Cutting Optimizer</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimized nesting layout for 6000mm standard uPVC profile stock extrusions
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-3 py-1.5 rounded-xl text-center border border-blue-100">
            <p className="text-[10px] uppercase font-bold text-[#0A2E8A]">Required 6m Bars</p>
            <p className="text-base font-black text-[#0A2E8A]">{optimization.totalBars}</p>
          </div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl text-center border border-emerald-100">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Material Yield</p>
            <p className="text-base font-black text-emerald-700">
              {optimization.overallYieldPercentage}%
            </p>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl text-center border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-500">Waste Scrap</p>
            <p className="text-base font-black text-slate-700">
              {optimization.overallWastePercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Visual Stock Bars Nesting Display */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Visual Nesting Layout ({optimization.bars.length} Extrusion Bars)
        </h4>

        <div className="space-y-3">
          {optimization.bars.map((bar, barIdx) => (
            <div
              key={barIdx}
              className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-md bg-[#0A2E8A] text-white flex items-center justify-center text-[10px]">
                    {bar.barIndex}
                  </span>
                  <span>Stock Bar #{bar.barIndex}</span>
                  <span className="font-mono text-[11px] font-normal text-slate-500">
                    ({bar.profileCode})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-600">
                    Used: <strong className="text-slate-900">{bar.usedLength} mm</strong>
                  </span>
                  <span className="text-amber-700 font-medium">
                    Remnant / Offcut:{' '}
                    <strong>{bar.wasteLength} mm</strong> ({bar.wastePercentage}%)
                  </span>
                </div>
              </div>

              {/* Bar 1D Graphic */}
              <div className="w-full h-8 bg-slate-200 rounded-lg overflow-hidden flex shadow-inner border border-slate-300">
                {bar.cuts.map((cut, cutIdx) => {
                  const widthPercent = (cut.piece.length / bar.stockLength) * 100;
                  const color = pieceColors[cutIdx % pieceColors.length];

                  return (
                    <div
                      key={cut.piece.id}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: color,
                      }}
                      title={`${cut.piece.windowId} - ${cut.piece.label}: ${cut.piece.length}mm (${cut.piece.angleLeft}°/${cut.piece.angleRight}°)`}
                      className="h-full border-r border-white/60 flex items-center justify-center px-1 text-[10px] text-white font-mono font-bold truncate select-none hover:brightness-110 transition-all cursor-pointer"
                    >
                      {cut.piece.windowId} • {cut.piece.length}
                    </div>
                  );
                })}

                {/* Offcut / Remnant Section */}
                <div
                  style={{ width: `${bar.wastePercentage}%` }}
                  title={`Remnant Offcut: ${bar.wasteLength}mm`}
                  className="h-full bg-slate-300/80 flex items-center justify-center text-[10px] font-mono text-slate-600 font-semibold px-1 truncate select-none"
                >
                  {bar.wasteLength > 200 ? `${bar.wasteLength}mm` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
