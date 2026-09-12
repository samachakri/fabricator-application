'use client';

import React, { useState } from 'react';
import { useProduction } from '@/lib/production/production-store';
import {
  X,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NewProductionOrderModalProps {
  onClose: () => void;
  onOrderCreated: (newOrder: import('@/lib/production/types').ManufacturingOrder) => void;
}

export const NewProductionOrderModal: React.FC<NewProductionOrderModalProps> = ({
  onClose,
  onOrderCreated,
}) => {
  const { createProductionOrderFromQuotation } = useProduction();

  const [selectedQuotation, setSelectedQuotation] = useState('QT-1024');
  const [customer, setCustomer] = useState('Rahul Sharma');
  const [project, setProject] = useState('Rahul Residence');
  const [windowsCount, setWindowsCount] = useState(4);
  const [doorsCount, setDoorsCount] = useState(1);
  const [priority, setPriority] = useState<'High' | 'Normal' | 'Low'>('High');
  const [dueDate, setDueDate] = useState('10 Sep');

  const quotationPresets = [
    {
      id: 'QT-1024',
      project: 'Rahul Residence',
      customer: 'Rahul Sharma',
      windows: 4,
      doors: 1,
      priority: 'High' as const,
      dueDate: '10 Sep',
    },
    {
      id: 'QT-1025',
      project: 'Green Meadows Villa',
      customer: 'Vikram Joshi',
      windows: 6,
      doors: 2,
      priority: 'Normal' as const,
      dueDate: '16 Sep',
    },
    {
      id: 'QT-1026',
      project: 'Tech Park Floor 4',
      customer: 'Apex Solutions',
      windows: 10,
      doors: 0,
      priority: 'Normal' as const,
      dueDate: '20 Sep',
    },
  ];

  const handleSelectPreset = (presetId: string) => {
    const found = quotationPresets.find((p) => p.id === presetId);
    if (found) {
      setSelectedQuotation(found.id);
      setProject(found.project);
      setCustomer(found.customer);
      setWindowsCount(found.windows);
      setDoorsCount(found.doors);
      setPriority(found.priority);
      setDueDate(found.dueDate);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createProductionOrderFromQuotation({
      quotationId: selectedQuotation,
      project,
      customer,
      windowsCount,
      doorsCount,
      priority,
      dueDate,
    });
    onOrderCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1B64F2] text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create Production Order</h2>
              <p className="text-[11px] text-slate-500">
                Auto-pull from approved quotation (Zero manual re-entry)
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

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Select Approved Quotation
            </label>
            <select
              value={selectedQuotation}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B64F2]"
            >
              {quotationPresets.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} — {q.project} ({q.customer})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Windows Quantity
              </label>
              <input
                type="number"
                min={1}
                value={windowsCount}
                onChange={(e) => setWindowsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Doors Quantity
              </label>
              <input
                type="number"
                min={0}
                value={doorsCount}
                onChange={(e) => setDoorsCount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Production Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 text-xs"
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Target Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. 15 Sep"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-blue-800 text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1B64F2] shrink-0" />
            <span>
              All CAD dimensions, profile specifications, glass schedules, and hardware BOM will be automatically populated into this order.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Generate Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
