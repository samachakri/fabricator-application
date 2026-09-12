'use client';

import React from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  Save,
  ChevronDown,
  Layers,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface DesignHeaderProps {
  projectName: string;
  windowId: string;
  allWindowIds: string[];
  onSelectWindow: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export const DesignHeader: React.FC<DesignHeaderProps> = ({
  projectName,
  windowId,
  allWindowIds,
  onSelectWindow,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  isSaved,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Design Logo + Project + Window Selector */}
      <div className="flex items-center gap-4">
        {/* Design Brand Mark */}
        <Link
          href="/design"
          className="flex items-center gap-2 group"
          title="Back to Design Queue"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1B64F2] text-white flex items-center justify-center shadow-xs group-hover:bg-[#1652C7] transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">
            Design
          </span>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Project Selector */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer">
          <span className="text-slate-400 font-medium">Project:</span>
          <span className="font-bold text-slate-800">{projectName || 'Villa - Hyderabad'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Window Selector Dropdown */}
        <div className="relative flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
          <span className="text-slate-400 font-medium">Window:</span>
          <select
            value={windowId}
            onChange={(e) => onSelectWindow(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {allWindowIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center / Right: Undo, Redo, Save */}
      <div className="flex items-center gap-2">
        {/* Undo Button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Undo</span>
        </button>

        {/* Redo Button */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Redo</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1B64F2] hover:bg-[#1652C7] active:bg-[#1346A8] text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
