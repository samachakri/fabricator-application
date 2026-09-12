'use client';

import React, { useState } from 'react';
import {
  ManufacturingOrder,
  ReworkTask,
} from '@/lib/production/types';
import {
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Clock,
  Wrench,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface ReworkWorkspaceModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onStartRework: (orderId: string, reworkId: string) => void;
  onCompleteRework: (
    orderId: string,
    reworkId: string,
    resolutionNotes: string,
    workerName?: string
  ) => void;
}

export const ReworkWorkspaceModal: React.FC<ReworkWorkspaceModalProps> = ({
  order,
  onClose,
  onStartRework,
  onCompleteRework,
}) => {
  // Find all rework tasks across items
  const allReworks: { itemWindowId: string; task: ReworkTask }[] = [];
  order.items.forEach((item) => {
    item.reworkTasks.forEach((rw) => {
      allReworks.push({ itemWindowId: item.id, task: rw });
    });
  });

  const activeRework = allReworks[0] || {
    itemWindowId: 'W01',
    task: {
      id: 'rw-fallback',
      component: 'W01 Sash',
      problem: 'Roller alignment',
      description: 'Right sash is not sliding smoothly. Rollers misaligned by 3mm.',
      priority: 'High' as const,
      assignedTo: order.assignedTo || 'Ramesh',
      status: 'Open' as const,
      createdAt: 'Today, 11:00 AM',
    },
  };

  const [resolutionNotes, setResolutionNotes] = useState(
    'Roller height adjusted and tracks re-lubricated. Sliding motion smooth and verified.'
  );
  const [workerName, setWorkerName] = useState(activeRework.task.assignedTo || 'Ramesh');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmComplete = () => {
    onCompleteRework(order.id, activeRework.task.id, resolutionNotes, workerName);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-rose-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <RotateCcw className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Rework Management
              </h2>
              <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                Stage: Rework Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-700">{order.customer}</strong> • Project:{' '}
              <strong className="text-slate-700">{order.project}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Rework Issue Card */}
          <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeRework.task.problem}
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[10px]">
                {activeRework.task.priority} Priority
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-rose-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Component</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {activeRework.task.component}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Assigned To</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {activeRework.task.assignedTo}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Created Time</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {activeRework.task.createdAt}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Defect Description:
              </span>
              <p className="p-3 bg-white rounded-xl border border-rose-100 text-slate-700 text-xs">
                {activeRework.task.description}
              </p>
            </div>
          </div>

          {/* Worker Actions & Resolution Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#1B64F2]" />
              Fabrication Fix & Corrective Actions
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Corrective Work Performed
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the problem was resolved..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Worker Name
                </label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Re-Inspection Destination
                </label>
                <input
                  type="text"
                  disabled
                  value="Quality Control (Mandatory Re-check)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-cyan-800 text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px]">
              <strong>Important Rule:</strong> Completing rework does NOT mark production as completed.
              The repaired item must be sent back to <strong>Quality Control</strong> for mandatory re-inspection by an inspector.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mark Rework Complete & Return to QC</span>
          </button>
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
              <h3 className="text-base font-bold text-slate-900">Complete Rework?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Rework fixes for <strong>{activeRework.task.component}</strong> will be logged and the
                production order will be returned to <strong>Quality Control</strong> for re-inspection.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
              <div>
                Order: <strong className="text-slate-800">{order.id}</strong>
              </div>
              <div>
                Worker: <strong className="text-slate-800">{workerName}</strong>
              </div>
              <div>
                Destination: <strong className="text-cyan-700">Quality Control (Re-check)</strong>
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
                Confirm & Return to QC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
