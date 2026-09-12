'use client';

import React, { useState } from 'react';
import {
  ManufacturingOrder,
  ProductionItem,
  QCCheckItem,
} from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Check,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Ruler,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface QCWorkspaceModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onPassQC: (orderId: string, inspectorName?: string) => void;
  onFailQC: (
    orderId: string,
    windowId: string,
    reworkData: {
      component: string;
      problem: string;
      description: string;
      priority: 'High' | 'Normal' | 'Low';
      assignedTo: string;
    }
  ) => void;
  onCompleteProduction: (orderId: string, completedBy?: string) => void;
}

export const QCWorkspaceModal: React.FC<QCWorkspaceModalProps> = ({
  order,
  onClose,
  onPassQC,
  onFailQC,
  onCompleteProduction,
}) => {
  const [selectedWindowId, setSelectedWindowId] = useState<string>(
    order.items[0]?.id || 'W01'
  );
  const [inspectorName, setInspectorName] = useState('Karthik');
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Form state for creating rework task
  const [reworkForm, setReworkForm] = useState({
    component: 'W01 Sash',
    problem: 'Roller alignment',
    description: 'Right sash is not sliding smoothly. Rollers misaligned by 3mm.',
    priority: 'High' as 'High' | 'Normal' | 'Low',
    assignedTo: 'Ramesh',
  });

  const currentItem: ProductionItem | undefined =
    order.items.find((item) => item.id === selectedWindowId) || order.items[0];

  // Local state for checking/unchecking items during inspection
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    (currentItem?.qcChecklist || []).forEach((c) => {
      map[c.id] = c.passed;
    });
    return map;
  });

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allChecksList = currentItem?.qcChecklist || [];
  const passedCount = allChecksList.filter((c) => checks[c.id]).length;
  const totalCount = allChecksList.length;
  const isAllPassed = totalCount > 0 && passedCount === totalCount;

  // Categories
  const categories = ['Dimensions', 'Frame', 'Sash', 'Glass', 'Hardware', 'Finish'] as const;

  const handleConfirmPassQC = () => {
    onPassQC(order.id, inspectorName);
    onCompleteProduction(order.id, inspectorName);
    setShowPassModal(false);
    onClose();
  };

  const handleConfirmFailQC = () => {
    if (currentItem) {
      onFailQC(order.id, currentItem.id, reworkForm);
      setShowReworkModal(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Quality Control & Tolerance Inspection
              </h2>
              <span className="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded text-[10px]">
                Stage: Quality Control
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-700">{order.customer}</strong> • Project:{' '}
              <strong className="text-slate-700">{order.project}</strong> • Inspector:{' '}
              <strong className="text-slate-700">{inspectorName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block">
                Verification Progress
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {passedCount} of {totalCount} checks passed (
                {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%)
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
            Items to Inspect:
          </span>
          {order.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedWindowId(item.id)}
              className={`px-3 py-1.5 rounded-xl text-left border transition-all flex items-center gap-2 shrink-0 ${
                item.id === selectedWindowId
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div>
                <span className="font-bold text-xs">{item.id}</span>
                <span className="text-[10px] opacity-80 ml-1.5">{item.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Body: Left CAD Design vs Actual (45%) / Right Inspection Checklist (55%) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50/70 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentItem?.id} — {currentItem?.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    Original CAD Spec: {currentItem?.dimensions}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                  Design Reference
                </span>
              </div>

              {/* Dimension Comparison Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#1B64F2]" />
                  Measurement & Tolerance Audit
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Design Width</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      {currentItem?.width || 1800} mm
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Actual Measured</span>
                    <span className="font-mono font-bold text-emerald-600 text-xs mt-0.5 block">
                      {(currentItem?.width || 1800) - 2} mm
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Tolerance Allowed</span>
                    <span className="font-mono font-bold text-slate-700 text-xs mt-0.5 block">
                      ±2.0 mm
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Width variance Δ 2.0 mm is strictly within allowable ISO fabrication limits.</span>
                </div>
              </div>

              {/* Technical Drawing SVG */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 460 280" className="w-full h-auto max-h-[200px]">
                  <rect x="30" y="20" width="400" height="240" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
                  <rect x="45" y="35" width="370" height="210" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                  {/* Panels */}
                  <rect x="47" y="37" width="120" height="206" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" fillOpacity="0.4" />
                  <rect x="171" y="42" width="120" height="196" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" fillOpacity="0.5" />
                  <rect x="295" y="42" width="118" height="196" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" fillOpacity="0.5" />
                  <text x="107" y="145" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">Fixed ✓</text>
                  <text x="231" y="145" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">Sliding →</text>
                  <text x="354" y="145" textAnchor="middle" fill="#1e40af" fontSize="9" fontWeight="bold">Sliding ←</text>
                </svg>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                QC Verification requires every inspection point to pass. If an issue exists, use <strong>Fail / Send for Rework</strong>.
              </span>
            </div>
          </div>

          {/* Right Column: Categorized Inspection Checklist */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Inspection Checklist — {currentItem?.id}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Verify each physical attribute before factory dispatch
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Inspector:</span>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
                  />
                </div>
              </div>

              {/* Categorized Checks */}
              <div className="space-y-3">
                {categories.map((category) => {
                  const catItems = allChecksList.filter((c) => c.category === category);
                  if (catItems.length === 0) return null;

                  return (
                    <div
                      key={category}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {catItems.filter((c) => checks[c.id]).length}/{catItems.length} Verified
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {catItems.map((checkItem) => {
                          const isPassed = !!checks[checkItem.id];
                          return (
                            <div
                              key={checkItem.id}
                              onClick={() => toggleCheck(checkItem.id)}
                              className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                                isPassed ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isPassed}
                                  onChange={() => toggleCheck(checkItem.id)}
                                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                  <span
                                    className={`font-medium text-xs ${
                                      isPassed ? 'text-slate-900' : 'text-slate-700'
                                    }`}
                                  >
                                    {checkItem.label}
                                  </span>
                                  {checkItem.notes && (
                                    <span className="block text-[10px] text-slate-400">
                                      {checkItem.notes}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                {checkItem.tolerance && (
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {checkItem.tolerance}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Pass QC vs Fail / Send for Rework */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setShowReworkModal(true)}
                  className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Fail / Send for Rework</span>
                </button>
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
                  disabled={!isAllPassed}
                  onClick={() => setShowPassModal(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pass Quality Control & Complete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rework Creation Modal */}
      {showReworkModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Rework Task</h3>
                <p className="text-[11px] text-slate-500">Order will move to Rework stage</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Defective Component
                </label>
                <input
                  type="text"
                  value={reworkForm.component}
                  onChange={(e) => setReworkForm({ ...reworkForm, component: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Problem Summary
                </label>
                <input
                  type="text"
                  value={reworkForm.problem}
                  onChange={(e) => setReworkForm({ ...reworkForm, problem: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Detailed Description of Defect
                </label>
                <textarea
                  rows={2}
                  value={reworkForm.description}
                  onChange={(e) =>
                    setReworkForm({ ...reworkForm, description: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={reworkForm.priority}
                    onChange={(e) =>
                      setReworkForm({ ...reworkForm, priority: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-semibold text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assign To
                  </label>
                  <input
                    type="text"
                    value={reworkForm.assignedTo}
                    onChange={(e) =>
                      setReworkForm({ ...reworkForm, assignedTo: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReworkModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFailQC}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Create Rework Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QC Pass Confirmation Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Pass Quality Control?</h3>
              <p className="text-xs text-slate-600 mt-1">
                All inspection criteria for <strong>{order.id}</strong> have passed.
                Confirming will mark this order as <strong>COMPLETED</strong> and ready for dispatch.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
              <div>
                Order: <strong className="text-slate-800">{order.id}</strong>
              </div>
              <div>
                Inspector: <strong className="text-slate-800">{inspectorName}</strong>
              </div>
              <div>
                Status: <strong className="text-emerald-700">QC Passed (100%)</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPassQC}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm & Complete Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
