'use client';

import React, { useState } from 'react';
import {
  ManufacturingOrder,
  ProductionItem,
} from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  Scissors,
  Check,
  ArrowRight,
  User,
  Clock,
  Layers,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface CuttingWorkspaceModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onMarkCutComplete: (orderId: string, windowId: string, cutId: string, workerName?: string) => void;
  onCompleteCuttingStage: (orderId: string, workerName?: string) => void;
}

export const CuttingWorkspaceModal: React.FC<CuttingWorkspaceModalProps> = ({
  order,
  onClose,
  onMarkCutComplete,
  onCompleteCuttingStage,
}) => {
  const [selectedWindowId, setSelectedWindowId] = useState<string>(
    order.items[0]?.id || 'W01'
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workerName, setWorkerName] = useState(order.assignedTo || 'Ramesh');

  const currentItem: ProductionItem | undefined = order.items.find(
    (item) => item.id === selectedWindowId
  ) || order.items[0];

  // Calculate total cuts across all items
  const allCuts = order.items.flatMap((item) => item.cuttingList);
  const totalCutsCount = allCuts.length;
  const completedCutsCount = allCuts.filter((c) => c.status === 'Completed').length;
  const isAllCutsComplete = totalCutsCount > 0 && completedCutsCount === totalCutsCount;

  // Frame cuts stats for current item
  const frameCuts = (currentItem?.cuttingList || []).filter((c) => c.section === 'Frame');
  const completedFrameCuts = frameCuts.filter((c) => c.status === 'Completed').length;

  const handleConfirmComplete = () => {
    onCompleteCuttingStage(order.id, workerName);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Cutting Workspace
              </h2>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                Stage: Cutting
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-700">{order.customer}</strong> • Project:{' '}
              <strong className="text-slate-700">{order.project}</strong> • Due:{' '}
              <strong className="text-slate-700">{order.dueDate}</strong> • Assigned To:{' '}
              <strong className="text-slate-700">{workerName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">
                Overall Cutting Progress
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {completedCutsCount} of {totalCutsCount} cuts completed (
                {totalCutsCount > 0
                  ? Math.round((completedCutsCount / totalCutsCount) * 100)
                  : 0}
                %)
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Window Selector Tabs */}
        <div className="bg-white px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Production Items:
          </span>
          {order.items.map((item) => {
            const isSelected = item.id === selectedWindowId;
            const completed = item.cuttingList.filter((c) => c.status === 'Completed').length;
            const total = item.cuttingList.length;
            const itemDone = total > 0 && completed === total;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedWindowId(item.id)}
                className={`px-3 py-1.5 rounded-xl text-left border transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-blue-50 border-[#1B64F2] text-[#1B64F2] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="font-bold text-xs">{item.id}</span>
                  <span className="text-[10px] opacity-80 ml-1.5">{item.name}</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    itemDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {completed}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Left Technical Drawing (45%) / Right Cutting List (55%) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Technical Drawing from Design */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50/70 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentItem?.id} — {currentItem?.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    {currentItem?.dimensions}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                  Original CAD Specs
                </span>
              </div>

              {/* Technical Drawing SVG */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-center min-h-[260px] relative">
                <svg
                  viewBox="0 0 500 360"
                  className="w-full h-auto max-h-[280px]"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
                >
                  {/* Top Dimension */}
                  <line x1="60" y1="25" x2="440" y2="25" stroke="#64748b" strokeWidth="1.5" />
                  <polygon points="60,25 68,21 68,29" fill="#64748b" />
                  <polygon points="440,25 432,21 432,29" fill="#64748b" />
                  <rect x="210" y="14" width="80" height="18" fill="white" rx="3" />
                  <text
                    x="250"
                    y="27"
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {currentItem?.width || 1800} mm
                  </text>

                  {/* Left Dimension */}
                  <line x1="25" y1="50" x2="25" y2="330" stroke="#64748b" strokeWidth="1.5" />
                  <polygon points="25,50 21,58 29,58" fill="#64748b" />
                  <polygon points="25,330 21,322 29,322" fill="#64748b" />
                  <rect x="14" y="180" width="22" height="40" fill="white" rx="3" />
                  <text
                    x="25"
                    y="204"
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    transform="rotate(-90 25 204)"
                  >
                    {currentItem?.height || 1500} mm
                  </text>

                  {/* Outer Frame (60mm profile face) */}
                  <rect
                    x="60"
                    y="50"
                    width="380"
                    height="280"
                    fill="#f1f5f9"
                    stroke="#0f172a"
                    strokeWidth="3"
                    rx="1"
                  />
                  {/* Mitre Corner Joint Lines */}
                  <line x1="60" y1="50" x2="80" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="440" y1="50" x2="420" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="60" y1="330" x2="80" y2="310" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="440" y1="330" x2="420" y2="310" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Inner Frame Cutout */}
                  <rect
                    x="80"
                    y="70"
                    width="340"
                    height="240"
                    fill="#e2e8f0"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* 3 Panels: Left (Fixed), Center (Sliding ->), Right (Sliding <-) */}
                  {/* Panel 1 (Fixed) */}
                  <rect
                    x="82"
                    y="72"
                    width="110"
                    height="236"
                    fill="#dbeafe"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    fillOpacity="0.4"
                  />
                  <line x1="137" y1="180" x2="137" y2="200" stroke="#3b82f6" strokeWidth="1.5" />
                  <line x1="127" y1="190" x2="147" y2="190" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="137" y="215" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">
                    Fixed
                  </text>

                  {/* Mullion 1 */}
                  <rect x="192" y="70" width="8" height="240" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  {/* Panel 2 (Sliding Right) */}
                  <rect
                    x="200"
                    y="76"
                    width="110"
                    height="228"
                    fill="#dbeafe"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    fillOpacity="0.5"
                  />
                  {/* Motion Arrow -> */}
                  <line x1="230" y1="190" x2="280" y2="190" stroke="#1d4ed8" strokeWidth="2" />
                  <polygon points="280,190 272,185 272,195" fill="#1d4ed8" />
                  <rect x="298" y="170" width="4" height="40" fill="#1e293b" rx="2" />
                  <text x="255" y="215" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">
                    Sliding →
                  </text>

                  {/* Mullion 2 */}
                  <rect x="310" y="70" width="8" height="240" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                  {/* Panel 3 (Sliding Left) */}
                  <rect
                    x="318"
                    y="76"
                    width="100"
                    height="228"
                    fill="#dbeafe"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                    fillOpacity="0.5"
                  />
                  {/* Motion Arrow <- */}
                  <line x1="385" y1="190" x2="340" y2="190" stroke="#1d4ed8" strokeWidth="2" />
                  <polygon points="340,190 348,185 348,195" fill="#1d4ed8" />
                  <rect x="325" y="170" width="4" height="40" fill="#1e293b" rx="2" />
                  <text x="365" y="215" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">
                    Sliding ←
                  </text>
                </svg>
              </div>

              {/* Profile Codes Legend */}
              <div className="mt-3 space-y-1.5 text-slate-600">
                <div className="text-[11px] font-bold text-slate-700">Profile Specifications:</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Outer Frame:</span> P-101 (60mm uPVC)
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Sliding Sash:</span> P-202 (Heavy)
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Mullion:</span> P-301 (60mm)
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Steel Reinforce:</span> 1.5mm GI
                  </div>
                </div>
              </div>
            </div>

            {/* Current window status notice */}
            <div className="mt-4 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {completedFrameCuts} of {frameCuts.length} frame cuts completed for {currentItem?.id}.
              </span>
            </div>
          </div>

          {/* Right Column: Cutting List (Worker Checklist) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cutting List — {currentItem?.id}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Prioritized cut sequence with profile codes & lengths
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Worker:</span>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
                  />
                </div>
              </div>

              {/* Cutting Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Profile</th>
                      <th className="py-2.5 px-3">Length</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(currentItem?.cuttingList || []).map((cut) => {
                      const isComplete = cut.status === 'Completed';
                      return (
                        <tr
                          key={cut.id}
                          className={isComplete ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800 font-mono">
                              {cut.profileCode}
                            </div>
                            <div className="text-[10px] text-slate-500">{cut.profileName}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs">
                            {cut.lengthMm} mm
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">
                            × {cut.quantity}
                          </td>
                          <td className="py-2.5 px-3">
                            {isComplete ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
                                  <Check className="w-3 h-3" />
                                  Completed
                                </span>
                                <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                  {cut.completedBy} • {cut.completedAt}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isComplete ? (
                              <span className="text-emerald-600 text-[11px] font-bold">
                                ✓ Done
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onMarkCutComplete(order.id, currentItem.id, cut.id, workerName)
                                }
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer active:scale-95"
                              >
                                Mark Cut Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Complete Stage Action */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                {!isAllCutsComplete ? (
                  <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Complete all required cuts to continue to Assembly.
                  </span>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    All cutting tasks complete! Ready for Assembly.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!isAllCutsComplete}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Mark Cutting Complete</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B64F2] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Complete Cutting?</h3>
              <p className="text-xs text-slate-600 mt-1">
                All required cutting tasks for <strong>{order.id}</strong> are completed.
                Confirming will consume the reserved profile stock, update activity logs, and
                advance the order to the <strong>Assembly</strong> stage.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
              <div>
                Order: <strong className="text-slate-800">{order.id}</strong>
              </div>
              <div>
                Completed By: <strong className="text-slate-800">{workerName}</strong>
              </div>
              <div>
                Next Stage: <strong className="text-[#1B64F2]">Assembly</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm & Advance to Assembly
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
