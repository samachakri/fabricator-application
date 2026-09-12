'use client';

import React, { useState } from 'react';
import {
  ManufacturingOrder,
  ProductionItem,
  AssemblyTask,
} from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  Wrench,
  Check,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Settings,
  Info,
} from 'lucide-react';

interface AssemblyWorkspaceModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onMarkAssemblyTaskComplete: (
    orderId: string,
    windowId: string,
    taskId: string,
    workerName?: string
  ) => void;
  onCompleteAssemblyStage: (orderId: string, workerName?: string) => void;
}

export const AssemblyWorkspaceModal: React.FC<AssemblyWorkspaceModalProps> = ({
  order,
  onClose,
  onMarkAssemblyTaskComplete,
  onCompleteAssemblyStage,
}) => {
  const [selectedWindowId, setSelectedWindowId] = useState<string>(
    order.items[0]?.id || 'W01'
  );
  const [activeTaskModal, setActiveTaskModal] = useState<AssemblyTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workerName, setWorkerName] = useState(order.assignedTo || 'Suresh');

  const currentItem: ProductionItem | undefined =
    order.items.find((item) => item.id === selectedWindowId) || order.items[0];

  const allTasks = order.items.flatMap((item) => item.assemblyChecklist);
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter((t) => t.status === 'Completed').length;
  const isAllTasksComplete = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

  // Group current window tasks by category
  const tasksByCategory: Record<string, AssemblyTask[]> = {
    Frame: (currentItem?.assemblyChecklist || []).filter((t) => t.category === 'Frame'),
    Sash: (currentItem?.assemblyChecklist || []).filter((t) => t.category === 'Sash'),
    Glass: (currentItem?.assemblyChecklist || []).filter((t) => t.category === 'Glass'),
    Hardware: (currentItem?.assemblyChecklist || []).filter((t) => t.category === 'Hardware'),
  };

  const handleConfirmComplete = () => {
    onCompleteAssemblyStage(order.id, workerName);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCompleteActiveTask = () => {
    if (activeTaskModal && currentItem) {
      onMarkAssemblyTaskComplete(order.id, currentItem.id, activeTaskModal.id, workerName);
      setActiveTaskModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Assembly Workspace
              </h2>
              <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                Stage: Assembly
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
                Assembly Progress
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {completedTasksCount} of {totalTasksCount} tasks completed (
                {totalTasksCount > 0
                  ? Math.round((completedTasksCount / totalTasksCount) * 100)
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
            Items:
          </span>
          {order.items.map((item) => {
            const isSelected = item.id === selectedWindowId;
            const completed = item.assemblyChecklist.filter((t) => t.status === 'Completed').length;
            const total = item.assemblyChecklist.length;
            const itemDone = total > 0 && completed === total;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedWindowId(item.id)}
                className={`px-3 py-1.5 rounded-xl text-left border transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
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

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Technical Assembly Drawing */}
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
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold text-[10px]">
                  Assembly Guidance
                </span>
              </div>

              {/* Technical Drawing SVG */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-center min-h-[260px] relative">
                <svg
                  viewBox="0 0 500 360"
                  className="w-full h-auto max-h-[280px]"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
                >
                  {/* Outer Frame */}
                  <rect
                    x="60"
                    y="50"
                    width="380"
                    height="280"
                    fill="#f8fafc"
                    stroke="#0f172a"
                    strokeWidth="3"
                    rx="2"
                  />
                  {/* Mitre Joints */}
                  <line x1="60" y1="50" x2="80" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="440" y1="50" x2="420" y2="70" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="60" y1="330" x2="80" y2="310" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="440" y1="330" x2="420" y2="310" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Inner Frame */}
                  <rect x="80" y="70" width="340" height="240" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />

                  {/* Fixed Panel Left */}
                  <rect x="82" y="72" width="110" height="236" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.5" fillOpacity="0.3" />
                  <text x="137" y="190" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">
                    Fixed Panel
                  </text>

                  {/* Mullion */}
                  <rect x="192" y="70" width="8" height="240" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

                  {/* Sliding Sash Center */}
                  <rect x="200" y="76" width="110" height="228" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" fillOpacity="0.5" />
                  <line x1="230" y1="190" x2="280" y2="190" stroke="#1d4ed8" strokeWidth="2" />
                  <polygon points="280,190 272,185 272,195" fill="#1d4ed8" />
                  {/* Rollers Indicators */}
                  <circle cx="225" cy="300" r="4" fill="#0f172a" />
                  <circle cx="285" cy="300" r="4" fill="#0f172a" />
                  <text x="255" y="318" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">
                    [Rollers]
                  </text>

                  {/* Mullion 2 */}
                  <rect x="310" y="70" width="8" height="240" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

                  {/* Sliding Sash Right */}
                  <rect x="318" y="76" width="100" height="228" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" fillOpacity="0.5" />
                  <line x1="385" y1="190" x2="340" y2="190" stroke="#1d4ed8" strokeWidth="2" />
                  <polygon points="340,190 348,185 348,195" fill="#1d4ed8" />
                  <circle cx="340" cy="300" r="4" fill="#0f172a" />
                  <circle cx="395" cy="300" r="4" fill="#0f172a" />
                </svg>
              </div>

              {/* Assembly Sequence Guide */}
              <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-slate-600">
                <div className="text-[11px] font-bold text-slate-800">Assembly Sequence:</div>
                <div className="text-[10px] space-y-1">
                  <div>1. <strong>Frame:</strong> Check squareness before screwing reinforcing steel.</div>
                  <div>2. <strong>Sashes:</strong> Install bottom tandem rollers and test roll height.</div>
                  <div>3. <strong>Glass:</strong> Insert bottom setting blocks before glazing bead snap-in.</div>
                  <div>4. <strong>Hardware:</strong> Pop-up touch lock handle screws torqued to 3.5 Nm.</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Click any assembly task on the right to view hardware specifications & instructions.
              </span>
            </div>
          </div>

          {/* Right Column: Assembly Checklist */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Assembly Checklist — {currentItem?.id}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Verify all manufacturing steps in order
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Fabricator:</span>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
                  />
                </div>
              </div>

              {/* Grouped Checklists */}
              <div className="space-y-3">
                {Object.entries(tasksByCategory).map(([cat, tasks]) => {
                  if (tasks.length === 0) return null;
                  const catDone = tasks.every((t) => t.status === 'Completed');

                  return (
                    <div
                      key={cat}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">
                          {cat} Assembly
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            catDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tasks.filter((t) => t.status === 'Completed').length}/{tasks.length} Done
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {tasks.map((task) => {
                          const isDone = task.status === 'Completed';
                          return (
                            <div
                              key={task.id}
                              onClick={() => setActiveTaskModal(task)}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all ${
                                    isDone
                                      ? 'bg-emerald-600 text-white'
                                      : 'border-2 border-slate-300 bg-white'
                                  }`}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                <div>
                                  <div
                                    className={`font-semibold text-xs ${
                                      isDone
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-800'
                                    }`}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {task.description}
                                  </div>
                                  {task.hardwareType && (
                                    <span className="inline-block mt-1 px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[9px] font-medium font-mono">
                                      Hardware: {task.hardwareType} (Qty: {task.quantity || 1})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 ml-3">
                                {isDone ? (
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {task.completedBy} • {task.completedAt}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMarkAssemblyTaskComplete(
                                        order.id,
                                        currentItem.id,
                                        task.id,
                                        workerName
                                      );
                                    }}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow-2xs"
                                  >
                                    Mark Done
                                  </button>
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

            {/* Bottom Complete Stage Action */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                {!isAllTasksComplete ? (
                  <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Complete the remaining {totalTasksCount - completedTasksCount} tasks to continue.
                  </span>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    All assembly tasks complete! Ready for Quality Control.
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
                  disabled={!isAllTasksComplete}
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Mark Assembly Complete</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Instruction Details Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{activeTaskModal.title}</h3>
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                Component: <strong className="text-slate-900">{activeTaskModal.component}</strong>
              </div>
              {activeTaskModal.hardwareType && (
                <div>
                  Hardware: <strong className="text-slate-900">{activeTaskModal.hardwareType}</strong>
                </div>
              )}
              {activeTaskModal.quantity && (
                <div>
                  Quantity: <strong className="text-slate-900">{activeTaskModal.quantity}</strong>
                </div>
              )}
              {activeTaskModal.instructions && (
                <div>
                  Instructions:{' '}
                  <p className="mt-1 p-2 bg-white rounded border border-slate-200 text-slate-800 font-medium">
                    {activeTaskModal.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              {activeTaskModal.status !== 'Completed' && (
                <button
                  type="button"
                  onClick={handleCompleteActiveTask}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Task Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Complete Assembly?</h3>
              <p className="text-xs text-slate-600 mt-1">
                All required assembly tasks for <strong>{order.id}</strong> are complete.
                Confirming will log the worker timestamp and move the order to{' '}
                <strong>Quality Control</strong> for inspection.
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
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm & Move to QC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
