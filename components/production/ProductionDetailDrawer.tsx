'use client';

import React from 'react';
import {
  ManufacturingOrder,
  ProductionStage,
} from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Play,
  ArrowRight,
  ShieldCheck,
  Scissors,
  Wrench,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Edit2,
} from 'lucide-react';

interface ProductionDetailDrawerProps {
  order: ManufacturingOrder;
  onClose: () => void;
  onOpenStageWorkspace: (stage: ProductionStage) => void;
  onResolveShortage?: () => void;
}

export const ProductionDetailDrawer: React.FC<ProductionDetailDrawerProps> = ({
  order,
  onClose,
  onOpenStageWorkspace,
  onResolveShortage,
}) => {
  // Determine progress step states
  const stages: { key: ProductionStage; label: string }[] = [
    { key: 'READY', label: 'Ready for Prod.' },
    { key: 'CUTTING', label: 'Cutting' },
    { key: 'ASSEMBLY', label: 'Assembly' },
    { key: 'QC', label: 'QC' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const stageOrderMap: Record<ProductionStage, number> = {
    READY: 0,
    CUTTING: 1,
    ASSEMBLY: 2,
    QC: 3,
    REWORK: 3, // Rework happens in parallel with QC
    COMPLETED: 4,
  };

  const currentStepIndex = stageOrderMap[order.currentStage];

  // Contextual primary CTA depending on current order stage
  const getPrimaryAction = () => {
    switch (order.currentStage) {
      case 'READY':
        return {
          label: order.hasShortage ? 'Resolve Shortage to Start' : 'Start Production',
          icon: Play,
          disabled: order.hasShortage,
          action: () => onOpenStageWorkspace('READY'),
          color: order.hasShortage ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1B64F2] hover:bg-blue-700',
        };
      case 'CUTTING':
        return {
          label: 'Open Cutting Workspace',
          icon: Scissors,
          disabled: false,
          action: () => onOpenStageWorkspace('CUTTING'),
          color: 'bg-[#1B64F2] hover:bg-blue-700',
        };
      case 'ASSEMBLY':
        return {
          label: 'Start Assembly',
          icon: Wrench,
          disabled: false,
          action: () => onOpenStageWorkspace('ASSEMBLY'),
          color: 'bg-[#1B64F2] hover:bg-blue-700',
        };
      case 'QC':
        return {
          label: 'Perform Quality Inspection',
          icon: ShieldCheck,
          disabled: false,
          action: () => onOpenStageWorkspace('QC'),
          color: 'bg-[#1B64F2] hover:bg-blue-700',
        };
      case 'REWORK':
        return {
          label: 'Continue Rework',
          icon: RotateCcw,
          disabled: false,
          action: () => onOpenStageWorkspace('REWORK'),
          color: 'bg-rose-600 hover:bg-rose-700',
        };
      case 'COMPLETED':
        return {
          label: 'View Completed Summary',
          icon: Sparkles,
          disabled: false,
          action: () => onOpenStageWorkspace('COMPLETED'),
          color: 'bg-emerald-600 hover:bg-emerald-700',
        };
      default:
        return {
          label: 'Open Workspace',
          icon: ArrowRight,
          disabled: false,
          action: () => onOpenStageWorkspace(order.currentStage),
          color: 'bg-[#1B64F2]',
        };
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="w-full h-full bg-white flex flex-col border-l border-slate-200 text-slate-800 text-xs shadow-2xl overflow-hidden">
      {/* 1. Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{order.id}</h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                order.priority === 'High'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : order.priority === 'Normal'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {order.priority} Priority
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {order.project} • {order.customer}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Progress Stepper */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute left-4 right-4 top-3 h-0.5 bg-slate-200 -z-0" />
            <div
              className="absolute left-4 top-3 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
              style={{
                width: `${(currentStepIndex / (stages.length - 1)) * 90}%`,
              }}
            />

            {stages.map((st, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={st.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#1B64F2] text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#1B64F2] font-bold'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight">
                    {isPast ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs">Project Information</h3>
            <button
              type="button"
              className="text-[11px] text-[#1B64F2] font-semibold hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Customer
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">{order.customer}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Project
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">{order.project}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Quotation
              </span>
              <span className="font-bold text-[#1B64F2] mt-0.5 block font-mono">
                {order.quotationId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Production Order
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                {order.id}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Total Windows / Doors
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {order.windowsDoorsSummary}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Due Date
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {order.dueDate} 2026
              </span>
            </div>
          </div>
        </div>

        {/* Material Readiness */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs">Material Readiness</h3>
            <span className="text-[11px] text-[#1B64F2] font-semibold hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100">
                <th className="pb-1.5 font-medium">Material</th>
                <th className="pb-1.5 font-medium">Required</th>
                <th className="pb-1.5 font-medium">Available</th>
                <th className="pb-1.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.materials.map((mat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 font-medium text-slate-800">{mat.material}</td>
                  <td className="py-2 text-slate-600">{mat.required}</td>
                  <td className="py-2 text-slate-600">{mat.available}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mat.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {mat.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.hasShortage && (
            <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{order.shortageReason || 'Material shortage detected'}</span>
              </div>
              {onResolveShortage && (
                <button
                  type="button"
                  onClick={onResolveShortage}
                  className="px-2 py-0.5 bg-white text-rose-600 rounded text-[10px] font-bold hover:bg-rose-100 border border-rose-300"
                >
                  Resolve
                </button>
              )}
            </div>
          )}
        </div>

        {/* Production Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs">Production Items</h3>
            <span className="text-[11px] text-[#1B64F2] font-semibold hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100">
                <th className="pb-1.5 font-medium">ID</th>
                <th className="pb-1.5 font-medium">Type</th>
                <th className="pb-1.5 font-medium">Dimensions</th>
                <th className="pb-1.5 font-medium">Stage</th>
                <th className="pb-1.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onOpenStageWorkspace(item.stage)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2 font-bold font-mono text-[#1B64F2]">{item.id}</td>
                  <td className="py-2 font-medium text-slate-800">{item.name}</td>
                  <td className="py-2 text-slate-600 font-mono text-[11px]">
                    {item.dimensions}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.stage === 'CUTTING'
                          ? 'bg-amber-50 text-amber-700'
                          : item.stage === 'ASSEMBLY'
                          ? 'bg-purple-50 text-purple-700'
                          : item.stage === 'QC'
                          ? 'bg-cyan-50 text-cyan-700'
                          : item.stage === 'REWORK'
                          ? 'bg-rose-50 text-rose-700'
                          : item.stage === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {item.stage}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity History */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs">Activity History</h3>
            <span className="text-[11px] text-[#1B64F2] font-semibold hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <div className="space-y-3 relative pl-4 border-l border-slate-200 ml-2">
            {order.activityHistory.map((act) => (
              <div key={act.id} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1B64F2] ring-4 ring-white" />
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-800 text-[11px]">
                    {act.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {act.timestamp}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  By {act.user} {act.notes ? `• ${act.notes}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={primaryAction.action}
          disabled={primaryAction.disabled}
          className={`flex-1 py-2.5 px-4 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${primaryAction.color}`}
        >
          <primaryAction.icon className="w-4 h-4" />
          <span>{primaryAction.label}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenStageWorkspace('CUTTING')}
          className="py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          title="View cutting & assembly production sheet"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Production Sheet</span>
        </button>
      </div>
    </div>
  );
};
