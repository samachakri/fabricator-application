'use client';

import React from 'react';
import { WindowDesign } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Check, CheckCircle2, Clock, MapPin, Scissors } from 'lucide-react';

interface CuttingListTableProps {
  projectId: string;
  windows: WindowDesign[];
}

export const CuttingListTable: React.FC<CuttingListTableProps> = ({
  projectId,
  windows,
}) => {
  const { updateCuttingStatus } = useStore();

  const allCuts = windows.flatMap((w) => {
    const bom = w.calculatedBOM;
    if (!bom) return [];

    const frame = bom.outerFrameCuts.map((c) => ({
      ...c,
      windowId: w.id,
      category: 'Outer Frame',
      binLocation: 'Saw Station #1',
    }));

    const sashes = bom.sashCuts.map((s) => ({
      ...s,
      windowId: w.id,
      category: 'Sash Profile',
      binLocation: 'Saw Station #2',
    }));

    return [...frame, ...sashes];
  });

  const completedCount = allCuts.filter((c) => c.status === 'cut').length;
  const progressPercent =
    allCuts.length > 0 ? Math.round((completedCount / allCuts.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header & Progress */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Scissors className="w-4 h-4 text-[#0A2E8A]" />
            <span>Shop Floor Profile Cutting Schedule</span>
          </div>
          <p className="text-xs text-slate-500">
            Precision cut lengths with double miter 45°/45° saw calibration
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-500">Cutting Progress</p>
            <p className="text-xs font-bold text-[#0A2E8A]">
              {completedCount} of {allCuts.length} cuts done ({progressPercent}%)
            </p>
          </div>
          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0A2E8A] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cutting Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Piece ID</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Cut Length</th>
              <th className="px-4 py-3 text-center">Left Cut</th>
              <th className="px-4 py-3 text-center">Right Cut</th>
              <th className="px-4 py-3">Profile Code</th>
              <th className="px-4 py-3">Station</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {allCuts.map((cut) => {
              const isDone = cut.status === 'cut';
              return (
                <tr
                  key={cut.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isDone ? 'bg-emerald-50/30 text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {/* Status Toggle Checkbox */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        updateCuttingStatus(projectId, cut.id, !isDone)
                      }
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border-2 border-slate-300 hover:border-[#0A2E8A] text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-700">
                    {cut.id}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0A2E8A] font-bold text-[10px]">
                      {cut.windowId}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {cut.label}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-sm text-[#0A2E8A]">
                    {cut.length} <span className="text-[10px] font-normal text-slate-400">mm</span>
                  </td>

                  {/* Cut Angles */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cut.angleLeft === 45
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cut.angleLeft}°
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cut.angleRight === 45
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cut.angleRight}°
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-500">
                    {cut.profileCode}
                  </td>

                  <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{cut.binLocation}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
