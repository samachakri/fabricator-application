'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface ProjectStatusDropdownProps {
  currentStatus: string;
  onSelectStatus: (status: string) => void;
  className?: string;
}

export interface ProjectStatusConfig {
  id: string;
  label: string;
  bg: string;
  dot: string;
  desc?: string;
}

export const PROJECT_STATUSES: ProjectStatusConfig[] = [
  {
    id: 'Designing',
    label: 'Designing',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/70 hover:bg-indigo-100/70',
    dot: 'bg-indigo-600',
    desc: 'CAD design & measurements in progress',
  },
  {
    id: 'Quotation Sent',
    label: 'Quotation Sent',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/70 hover:bg-blue-100/70',
    dot: 'bg-blue-600',
    desc: 'Formal commercial quote dispatched',
  },
  {
    id: 'Advance Pending',
    label: 'Advance Pending',
    bg: 'bg-amber-50 text-amber-800 border-amber-200/70 hover:bg-amber-100/70',
    dot: 'bg-amber-500',
    desc: 'Awaiting client token/advance payment',
  },
  {
    id: 'Advance Received',
    label: 'Advance Received',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 hover:bg-emerald-100/70',
    dot: 'bg-emerald-600',
    desc: 'Token advance received, ready for plant',
  },
  {
    id: 'In Production',
    label: 'In Production',
    bg: 'bg-purple-50 text-purple-800 border-purple-200/70 hover:bg-purple-100/70',
    dot: 'bg-purple-600',
    desc: 'Factory cutting & welding active',
  },
  {
    id: 'Completed',
    label: 'Completed',
    bg: 'bg-teal-50 text-teal-800 border-teal-200/70 hover:bg-teal-100/70',
    dot: 'bg-teal-600',
    desc: 'Fabricated, QC passed & delivered',
  },
  {
    id: 'On Hold',
    label: 'On Hold',
    bg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60',
    dot: 'bg-slate-400',
    desc: 'Temporarily paused pending client input',
  },
];

export function getProjectStatusConfig(status?: string): ProjectStatusConfig {
  const match = PROJECT_STATUSES.find(
    (s) => s.id.toLowerCase() === status?.toLowerCase()
  );
  if (match) return match;

  return {
    id: status || 'Designing',
    label: status || 'Designing',
    bg: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60',
    dot: 'bg-slate-500',
    desc: 'Project status',
  };
}

export const ProjectStatusDropdown: React.FC<ProjectStatusDropdownProps> = ({
  currentStatus,
  onSelectStatus,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = getProjectStatusConfig(currentStatus);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
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

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-2xs ${activeConfig.bg}`}
        title="Click to update project status"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeConfig.dot}`} />
        <span className="truncate max-w-[110px]">{activeConfig.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Project Status
            </span>
            <span className="text-[9px] text-slate-400">Select</span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
            {PROJECT_STATUSES.map((st) => {
              const isSelected = st.id.toLowerCase() === currentStatus?.toLowerCase();
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onSelectStatus(st.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 text-[#0A2E8A] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                    <div className="truncate">
                      <p className="leading-tight">{st.label}</p>
                      {st.desc && (
                        <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {st.desc}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0A2E8A] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
