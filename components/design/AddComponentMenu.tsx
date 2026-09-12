'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Columns,
  Rows,
  Square,
  ArrowRightLeft,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export type AddComponentAction =
  | 'add_vertical_division'
  | 'add_horizontal_division'
  | 'add_sash'
  | 'add_sliding_panel'
  | 'add_fixed_panel'
  | 'add_mullion'
  | 'add_transom'
  | 'add_mesh'
  | 'add_glass';

interface AddComponentMenuProps {
  onAction: (action: AddComponentAction) => void;
}

export const AddComponentMenu: React.FC<AddComponentMenuProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (action: AddComponentAction) => {
    onAction(action);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1B64F2] shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-[#1B64F2]" />
        <span>Add Component</span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs select-none animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Structural & Divisions
          </div>
          <button
            type="button"
            onClick={() => handleSelect('add_vertical_division')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Vertical Division</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_horizontal_division')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Rows className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Horizontal Division</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_mullion')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Columns className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Mullion</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_transom')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Rows className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Transom</span>
          </button>

          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-t border-slate-100 my-1">
            Panels & Sashes
          </div>
          <button
            type="button"
            onClick={() => handleSelect('add_sash')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Sash</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_sliding_panel')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Sliding Panel</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_fixed_panel')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Fixed Panel</span>
          </button>

          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-t border-slate-100 my-1">
            Inserts & Materials
          </div>
          <button
            type="button"
            onClick={() => handleSelect('add_mesh')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Mesh</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelect('add_glass')}
            className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#1B64F2] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Add Glass</span>
          </button>
        </div>
      )}
    </div>
  );
};
