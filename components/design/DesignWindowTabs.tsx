'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface WindowTabItem {
  id: string; // e.g. "W01"
  name: string; // e.g. "Living Room"
}

interface DesignWindowTabsProps {
  tabs: WindowTabItem[];
  activeWindowId: string;
  onSelectTab: (id: string) => void;
  onAddWindow: () => void;
  onDeleteTab?: (id: string) => void;
}

export const DesignWindowTabs: React.FC<DesignWindowTabsProps> = ({
  tabs,
  activeWindowId,
  onSelectTab,
  onAddWindow,
  onDeleteTab,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto select-none scrollbar-thin">
      {tabs.map((tab) => {
        const isActive = tab.id === activeWindowId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-2 pl-4 pr-2.5 py-1.5 rounded-xl transition-all border shrink-0 cursor-pointer ${
              isActive
                ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-200'
                : 'bg-transparent border-transparent hover:bg-slate-100/80 text-slate-600'
            }`}
          >
            <div className="flex flex-col items-start leading-tight">
              <span
                className={`text-xs font-black tracking-tight ${
                  isActive ? 'text-slate-900' : 'text-slate-700'
                }`}
              >
                {tab.id}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[110px]">
                {tab.name || 'Room'}
              </span>
            </div>

            {/* Delete option for individual window tab (shown when more than 1 window exists) */}
            {tabs.length > 1 && onDeleteTab && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTab(tab.id);
                }}
                className={`p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ${
                  isActive ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={`Delete window ${tab.id}`}
                aria-label={`Delete window ${tab.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}

      <div className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

      {/* Add Window Button */}
      <button
        type="button"
        onClick={onAddWindow}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors border border-dashed border-slate-300 shrink-0 cursor-pointer"
        title="Add a new window to this project"
      >
        <Plus className="w-3.5 h-3.5 text-slate-500" />
        <span>Add Window</span>
      </button>
    </div>
  );
};
