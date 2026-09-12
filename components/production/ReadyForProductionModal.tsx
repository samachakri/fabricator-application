'use client';

import React, { useState } from 'react';
import { ManufacturingOrder } from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  Package,
  Layers,
  FileText,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ReadyForProductionModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onStartProduction: (orderId: string, workerName?: string) => void;
  onResolveShortage: (orderId: string, materialName: string) => void;
}

export const ReadyForProductionModal: React.FC<ReadyForProductionModalProps> = ({
  order,
  onClose,
  onStartProduction,
  onResolveShortage,
}) => {
  const [workerName, setWorkerName] = useState(order.assignedTo || 'Ramesh');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const readinessChecks = [
    { label: 'Quotation Approved', passed: order.readinessChecklist.quotationApproved },
    { label: 'Design Completed & Verified', passed: order.readinessChecklist.designCompleted },
    { label: 'Customer Information Available', passed: order.readinessChecklist.customerInfoAvailable },
    { label: 'Window Configuration Complete', passed: order.readinessChecklist.windowConfigurationComplete },
    { label: 'Materials Available in Stock', passed: !order.hasShortage },
    { label: 'Materials Reserved in Inventory', passed: !order.hasShortage },
    { label: 'Production Items & BOM Generated', passed: order.readinessChecklist.productionItemsGenerated },
  ];

  const allPassed = !order.hasShortage && readinessChecks.every((c) => c.passed);

  const handleConfirmStart = () => {
    onStartProduction(order.id, workerName);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Production Readiness Validation
              </h2>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  allPassed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {allPassed ? 'READY FOR PRODUCTION' : 'PRODUCTION BLOCKED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-700">{order.customer}</strong> • Project:{' '}
              <strong className="text-slate-700">{order.project}</strong> • Quotation:{' '}
              <strong className="text-[#1B64F2] font-mono">{order.quotationId}</strong>
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
          {/* Readiness Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs">Production Readiness Validation Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {readinessChecks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                    chk.passed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      chk.passed ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {chk.passed ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                  </div>
                  <span className="font-medium text-xs">{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Material Stock & Reservation Check */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">Material Allocation & Reservation</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Warehouse Stock Sync
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3">Material</th>
                  <th className="py-2 px-3">Required</th>
                  <th className="py-2 px-3">Available</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.materials.map((mat, idx) => {
                  const isShortage = mat.status === 'Shortage';
                  return (
                    <tr key={idx} className={isShortage ? 'bg-rose-50/40' : ''}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{mat.material}</td>
                      <td className="py-2 px-3 text-slate-600">{mat.required}</td>
                      <td className="py-2 px-3 text-slate-600">{mat.available}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isShortage
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {mat.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isShortage ? (
                          <button
                            type="button"
                            onClick={() => onResolveShortage(order.id, mat.material)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow-2xs"
                          >
                            Resolve Shortage
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[10px]">
                            ✓ Reserved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {order.hasShortage && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <strong>Production Blocked:</strong> {order.shortageReason}
                    <p className="text-[11px] text-rose-600">
                      Cannot start production until sufficient stock is reserved or transferred.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onResolveShortage(order.id, 'All')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shrink-0"
                >
                  Quick Allocate Stock
                </button>
              </div>
            )}
          </div>

          {/* Assigned Worker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Assign Shop Floor Cutting Worker
              </span>
              <span className="text-[11px] text-slate-500">
                This worker will receive the prioritized cutting list
              </span>
            </div>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!allPassed}
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Production</span>
          </button>
        </div>
      </div>

      {/* Start Production Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B64F2] flex items-center justify-center">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Start Production?</h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>{order.id}</strong> will move directly to the <strong>Cutting</strong> stage.
                The cutting list will be dispatched to <strong>{workerName}</strong> and stock reservations will be locked.
              </p>
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
                onClick={handleConfirmStart}
                className="px-4 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Start Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
