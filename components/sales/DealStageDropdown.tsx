'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { DealStage } from '@/lib/types';

interface DealStageDropdownProps {
  currentStage?: DealStage;
  onSelectStage: (stage: DealStage) => void;
  className?: string;
}

export interface StageConfig {
  id: string;
  label: string;
  bg: string;
  dot: string;
  desc?: string;
}

export const PRESET_STAGES: StageConfig[] = [
  {
    id: 'Quotation Sent',
    label: 'Quotation Sent',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/60 hover:bg-blue-100/60',
    dot: 'bg-blue-600',
    desc: 'Formal commercial quote sent to customer',
  },
  {
    id: 'Advance Pending',
    label: 'Advance Pending',
    bg: 'bg-orange-50 text-orange-800 border-orange-200/60 hover:bg-orange-100/60',
    dot: 'bg-orange-500',
    desc: 'Quote approved, awaiting token advance',
  },
  {
    id: 'Advance Received',
    label: 'Advance Received',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60 hover:bg-emerald-100/60',
    dot: 'bg-emerald-600',
    desc: '50% advance token paid by client',
  },
  {
    id: 'Payment Completed',
    label: 'Payment Completed',
    bg: 'bg-teal-50 text-teal-800 border-teal-200/60 hover:bg-teal-100/60',
    dot: 'bg-teal-600',
    desc: '100% full payment cleared',
  },
  {
    id: 'Deal Closed',
    label: 'Deal Closed',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60 hover:bg-indigo-100/60',
    dot: 'bg-indigo-600',
    desc: 'Order confirmed and locked for production',
  },
  {
    id: 'Site Survey',
    label: 'Site Survey',
    bg: 'bg-purple-50 text-purple-700 border-purple-200/60 hover:bg-purple-100/60',
    dot: 'bg-purple-600',
    desc: 'Site engineer measurement visit',
  },
  {
    id: 'Design & CAD',
    label: 'Design & CAD',
    bg: 'bg-sky-50 text-sky-700 border-sky-200/60 hover:bg-sky-100/60',
    dot: 'bg-sky-600',
    desc: 'Window drafting & profile calculations',
  },
  {
    id: 'New Inquiry',
    label: 'New Inquiry',
    bg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60',
    dot: 'bg-slate-400',
    desc: 'Initial customer contact received',
  },
];

export function getStageConfig(stage?: string): StageConfig {
  const match = PRESET_STAGES.find((s) => s.id.toLowerCase() === stage?.toLowerCase());
  if (match) return match;

  if (stage === 'Won - In Production') {
    return {
      id: 'Won - In Production',
      label: 'Won - In Production',
      bg: 'bg-blue-50 text-blue-800 border-blue-200/60 hover:bg-blue-100/60',
      dot: 'bg-blue-700',
      desc: 'Fabrication order active',
    };
  }

  // Custom status fallback
  return {
    id: stage || 'New Inquiry',
    label: stage || 'New Inquiry',
    bg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60',
    dot: 'bg-[#0A2E8A]',
    desc: 'Custom CRM status',
  };
}

export const DealStageDropdown: React.FC<DealStageDropdownProps> = ({
  currentStage,
  onSelectStage,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customStageText, setCustomStageText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = getStageConfig(currentStage);

  // Close on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingCustom(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsAddingCustom(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (stageId: string) => {
    onSelectStage(stageId as DealStage);
    setIsOpen(false);
    setIsAddingCustom(false);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStageText.trim()) return;
    onSelectStage(customStageText.trim() as DealStage);
    setCustomStageText('');
    setIsAddingCustom(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Clickable Pill matching user's screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-2xs ${activeConfig.bg}`}
        title="Click to change deal stage"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${activeConfig.dot}`} />
        <span className="truncate max-w-[130px]">{activeConfig.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Update Deal Stage
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Click to select</span>
          </div>

          {/* Curated list of stages */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {PRESET_STAGES.map((stage) => {
              const isSelected = stage.id.toLowerCase() === currentStage?.toLowerCase();
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelect(stage.id)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 text-[#0A2E8A] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`} />
                    <div className="truncate">
                      <p className="leading-tight">{stage.label}</p>
                      {stage.desc && (
                        <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {stage.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0A2E8A] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>

          {/* Add custom stage manually */}
          <div className="border-t border-slate-100 p-1.5 bg-slate-50/50 rounded-b-xl">
            {!isAddingCustom ? (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#0A2E8A] hover:bg-blue-50/80 rounded-lg font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Status</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCustom} className="space-y-1.5 p-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter custom status..."
                  value={customStageText}
                  onChange={(e) => setCustomStageText(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
                <div className="flex items-center justify-end gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustom(false);
                      setCustomStageText('');
                    }}
                    className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customStageText.trim()}
                    className="px-2.5 py-0.5 text-[11px] bg-[#0A2E8A] text-white rounded font-bold hover:bg-[#08256E] disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
