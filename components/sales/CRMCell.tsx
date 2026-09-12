'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Edit2, Check, Plus, ChevronDown, Hash, Trash2 } from 'lucide-react';
import { CustomCRMColumn } from '@/lib/types';

interface CRMCellProps {
  column: CustomCRMColumn;
  value: any;
  onSave: (val: any) => void;
  onAddOptionToColumn?: (colId: string, newOption: string) => void;
  onDeleteOptionFromColumn?: (colId: string, option: string) => void;
}

export const CRMCell: React.FC<CRMCellProps> = ({
  column,
  value,
  onSave,
  onAddOptionToColumn,
  onDeleteOptionFromColumn,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value !== undefined && value !== null ? String(value) : '');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when prop value changes
  useEffect(() => {
    setInputValue(value !== undefined && value !== null ? String(value) : '');
  }, [value]);

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
        setIsAddingOption(false);
      }
    }
    if (isStatusOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusOpen]);

  const commitEdit = () => {
    if (column.type === 'number') {
      const parsed = parseFloat(inputValue);
      onSave(isNaN(parsed) ? 0 : parsed);
    } else {
      onSave(inputValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setInputValue(value !== undefined && value !== null ? String(value) : '');
      setIsEditing(false);
    }
  };

  // 1. TEXT CELL
  if (column.type === 'text') {
    if (isEditing) {
      return (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder="Type text..."
            className="w-full px-2 py-1 text-xs bg-white border border-[#0A2E8A] rounded-md focus:outline-none ring-1 ring-[#0A2E8A] shadow-xs"
          />
        </div>
      );
    }
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer group flex items-center justify-between gap-1 py-1 px-1.5 -mx-1.5 rounded hover:bg-slate-100 transition-colors"
        title="Click to edit"
      >
        <span className={`text-xs ${value ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
          {value || 'Click to edit'}
        </span>
        <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  // 2. NUMBER CELL
  if (column.type === 'number') {
    if (isEditing) {
      return (
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#0A2E8A] rounded-md focus:outline-none ring-1 ring-[#0A2E8A] shadow-xs text-right"
          />
        </div>
      );
    }
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer group flex items-center justify-between gap-1 py-1 px-1.5 -mx-1.5 rounded hover:bg-slate-100 transition-colors"
        title="Click to edit number"
      >
        <span className="text-xs font-mono font-bold text-slate-800">
          {value !== undefined && value !== null && value !== '' ? Number(value).toLocaleString() : '—'}
        </span>
        <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  // 3. MAIL CELL
  if (column.type === 'mail') {
    if (isEditing) {
      return (
        <div className="relative">
          <input
            ref={inputRef}
            type="email"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            className="w-full px-2 py-1 text-xs bg-white border border-[#0A2E8A] rounded-md focus:outline-none ring-1 ring-[#0A2E8A] shadow-xs"
          />
        </div>
      );
    }
    return (
      <div className="group flex items-center gap-1.5 py-0.5">
        {value ? (
          <>
            <a
              href={`mailto:${value}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-[#0A2E8A] hover:underline font-medium truncate max-w-[140px]"
              title={`Send email to ${value}`}
            >
              <Mail className="w-3 h-3 shrink-0 text-blue-600" />
              <span className="truncate">{value}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit email"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-slate-400 italic hover:text-slate-600 flex items-center gap-1 py-1 px-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            <Mail className="w-3 h-3 text-slate-300" />
            <span>Add email</span>
          </button>
        )}
      </div>
    );
  }

  // 4. STATUS CELL
  if (column.type === 'status') {
    const options = column.options && column.options.length > 0 ? column.options : ['Pending', 'Completed'];
    const currentVal = value || options[0] || 'Pending';

    // Color based on status name hash for visual flair
    const getBadgeStyle = (str: string) => {
      const lower = str.toLowerCase();
      if (lower.includes('complete') || lower.includes('closed') || lower.includes('done') || lower.includes('approved')) {
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/70', dot: 'bg-emerald-600' };
      }
      if (lower.includes('progress') || lower.includes('review') || lower.includes('survey')) {
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200/70', dot: 'bg-blue-600' };
      }
      if (lower.includes('pending') || lower.includes('hold') || lower.includes('wait')) {
        return { bg: 'bg-amber-50 text-amber-800 border-orange-200/70', dot: 'bg-amber-500' };
      }
      if (lower.includes('cancel') || lower.includes('reject') || lower.includes('lost')) {
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200/70', dot: 'bg-rose-500' };
      }
      return { bg: 'bg-purple-50 text-purple-700 border-purple-200/70', dot: 'bg-purple-600' };
    };

    const style = getBadgeStyle(currentVal);

    const handleAddOption = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newStatusInput.trim();
      if (!trimmed) return;
      if (onAddOptionToColumn) {
        onAddOptionToColumn(column.id, trimmed);
      }
      onSave(trimmed);
      setNewStatusInput('');
      setIsAddingOption(false);
      setIsStatusOpen(false);
    };

    return (
      <div className="relative inline-block text-left" ref={statusRef}>
        <button
          type="button"
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${style.bg}`}
          title="Click to change status"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
          <span className="truncate max-w-[110px]">{currentVal}</span>
          <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
        </button>

        {isStatusOpen && (
          <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {column.name}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt === currentVal;
                const optStyle = getBadgeStyle(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      onSave(opt);
                      setIsStatusOpen(false);
                    }}
                    className={`group/item w-full px-2 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${optStyle.dot}`} />
                      <span className="truncate">{opt}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-1.5">
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0A2E8A]" />}
                      {onDeleteOptionFromColumn && options.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOptionFromColumn(column.id, opt);
                            if (currentVal === opt) {
                              const remaining = options.filter((o) => o !== opt);
                              onSave(remaining[0] || '');
                            }
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-all"
                          title={`Delete ${opt} status`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manual option adder */}
            <div className="border-t border-slate-100 p-1.5 bg-slate-50/50 rounded-b-xl">
              {!isAddingOption ? (
                <button
                  type="button"
                  onClick={() => setIsAddingOption(true)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-[#0A2E8A] hover:bg-blue-50/80 rounded font-bold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Option</span>
                </button>
              ) : (
                <form onSubmit={handleAddOption} className="space-y-1 p-0.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New status..."
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                  />
                  <div className="flex items-center justify-end gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingOption(false);
                        setNewStatusInput('');
                      }}
                      className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newStatusInput.trim()}
                      className="px-2 py-0.5 text-[10px] bg-[#0A2E8A] text-white rounded font-bold hover:bg-[#08256E] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div>{String(value || '')}</div>;
};
