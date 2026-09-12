'use client';

import React from 'react';
import { ManufacturingOrder } from '@/lib/production/types';
import {
  X,
  CheckCircle2,
  Sparkles,
  FileText,
  Clock,
  User,
  Layers,
  ShieldCheck,
  Truck,
  Download,
} from 'lucide-react';

interface CompletedWorkspaceModalProps {
  order: ManufacturingOrder;
  onClose: () => void;
}

export const CompletedWorkspaceModal: React.FC<CompletedWorkspaceModalProps> = ({
  order,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {order.id} — Production Completed 🎉
              </h2>
              <p className="text-xs text-slate-500">
                {order.project} • {order.customer}
              </p>
            </div>
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
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs inline-block mb-2">
                Fabrication Complete
              </span>
              <h3 className="text-xl font-black">All Manufacturing Stages Signed Off</h3>
              <p className="text-emerald-100 text-xs mt-1 max-w-md">
                Cutting, assembly, and quality control tolerances have been strictly verified. All
                materials consumed and units ready for dispatch.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right">
              <span className="text-[10px] text-emerald-100 block">Completed On</span>
              <span className="font-mono font-bold text-sm block mt-0.5">
                {order.completionTimestamp || '10 Sep 2026, 3:05 PM'}
              </span>
              <span className="text-[10px] text-emerald-200 block mt-1">
                QC Signoff: {order.completedBy || 'Karthik'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Total Finished Units</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {order.windowsDoorsSummary}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Cutting Status</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">100% Complete</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Assembly Status</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">100% Complete</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Quality Control</span>
              <span className="font-bold text-cyan-700 text-sm mt-0.5 block">Zero Defects Passed</span>
            </div>
          </div>

          {/* Stage Timings Audit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs">Stage-by-Stage Manufacturing Timings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">Cutting Stage</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Duration: ~1h 55m</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Worker: Ramesh
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">Assembly Stage</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Duration: ~1h 40m</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Worker: Suresh
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block">QC Stage</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Duration: ~45m</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Inspector: Karthik
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps: Dispatch */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B64F2] text-white flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Ready for Dispatch / Site Installation
                </span>
                <span className="text-[11px] text-slate-600">
                  Protective packaging applied. Ready for transport loading to {order.project}.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-white text-[#1B64F2] font-bold rounded-lg border border-blue-200 text-xs shadow-2xs">
              Packaged & Labeled
            </span>
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Production travel sheet for ${order.id} exported.`)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Sign-off Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
