'use client';

import React, { useState } from 'react';
import { X, Type, Hash, Mail, Tag, Plus, Trash2 } from 'lucide-react';
import { CustomCRMColumn } from '@/lib/types';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (column: CustomCRMColumn) => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'mail' | 'status'>('text');
  const [statusOptions, setStatusOptions] = useState<string[]>([
    'Pending',
    'In Progress',
    'Completed',
  ]);
  const [newOptionInput, setNewOptionInput] = useState('');

  if (!isOpen) return null;

  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (!statusOptions.includes(trimmed)) {
      setStatusOptions([...statusOptions, trimmed]);
    }
    setNewOptionInput('');
  };

  const handleRemoveOption = (optToRemove: string) => {
    setStatusOptions(statusOptions.filter((opt) => opt !== optToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCol: CustomCRMColumn = {
      id: `col_${Date.now()}`,
      name: name.trim(),
      type,
      options: type === 'status' ? statusOptions : undefined,
    };

    onAddColumn(newCol);
    // Reset
    setName('');
    setType('text');
    setStatusOptions(['Pending', 'In Progress', 'Completed']);
    setNewOptionInput('');
    onClose();
  };

  const typeList = [
    {
      id: 'text',
      label: 'Text',
      desc: 'Freeform text, notes, remarks',
      icon: Type,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'number',
      label: 'Number',
      desc: 'Currency, dimensions, sq.ft',
      icon: Hash,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'mail',
      label: 'Email Address',
      desc: 'Email with clickable mail action',
      icon: Mail,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'status',
      label: 'Status / Stage',
      desc: 'Custom tags & dropdown options',
      icon: Tag,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add CRM Column</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your sales pipeline table with new dynamic fields
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Column Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Column Title
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Payment Mode, Architect Email, Site Engineer..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
            />
          </div>

          {/* Column Type Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Field Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeList.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-[#0A2E8A] bg-blue-50/50 ring-1 ring-[#0A2E8A]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${t.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{t.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal leading-tight">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Options Manager (if type === 'status') */}
          {type === 'status' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status Options (Manual Entry)
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {statusOptions.length} Options
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Mention the status options you want in this column dropdown:
              </p>

              {/* Badges list */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {statusOptions.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt)}
                      className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                      title="Remove option"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add new option input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type new status option..."
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption()}
                  disabled={!newOptionInput.trim()}
                  className="px-3 py-1.5 bg-[#0A2E8A] hover:bg-[#08256E] text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-bold bg-[#0A2E8A] hover:bg-[#08256E] text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
