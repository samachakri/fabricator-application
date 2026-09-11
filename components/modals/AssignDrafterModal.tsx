'use client';

import React from 'react';
import { X, UserCheck, Shield, CheckCircle2, User } from 'lucide-react';

export interface DrafterOption {
  id: string;
  name: string;
  initials: string;
  role: string;
  activeOrders: number;
  status: 'Available' | 'Active' | 'Busy';
  color: string;
}

export const DRAFTERS: DrafterOption[] = [
  {
    id: 'kr',
    name: 'Karthik R.',
    initials: 'KR',
    role: 'Senior CAD Drafter',
    activeOrders: 4,
    status: 'Active',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  {
    id: 'pv',
    name: 'Pooja V.',
    initials: 'PV',
    role: 'Lead Estimator & CAD',
    activeOrders: 2,
    status: 'Active',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'rm',
    name: 'Rohan M.',
    initials: 'RM',
    role: 'uPVC Window Detailer',
    activeOrders: 1,
    status: 'Available',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'sk',
    name: 'Sneha K.',
    initials: 'SK',
    role: 'Hardware & Glass Spec',
    activeOrders: 0,
    status: 'Available',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

interface AssignDrafterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  customerName?: string;
  scopeTitle?: string;
  onSelectDrafter: (drafter: DrafterOption) => void;
}

export default function AssignDrafterModal({
  isOpen,
  onClose,
  orderId,
  customerName,
  scopeTitle,
  onSelectDrafter,
}: AssignDrafterModalProps) {
  if (!isOpen || !orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assign Drafter</h3>
            <p className="text-xs text-slate-500 font-secondary mt-0.5">
              Order: <span className="font-bold text-slate-800 font-mono">{orderId}</span>
              {customerName ? ` • ${customerName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Context */}
        {scopeTitle && (
          <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 text-xs text-blue-800 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
            <span>Scope: {scopeTitle}</span>
          </div>
        )}

        {/* Drafters List */}
        <div className="p-6 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Available Design Team Members
          </p>
          {DRAFTERS.map((drafter) => (
            <button
              key={drafter.id}
              onClick={() => {
                onSelectDrafter(drafter);
                onClose();
              }}
              className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border font-secondary ${drafter.color}`}
                >
                  {drafter.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900">
                    {drafter.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-secondary">{drafter.role}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    drafter.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {drafter.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {drafter.activeOrders} queue orders
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
