'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export interface WindowTabItem {
  id: string; // e.g. "W01"
  name: string; // e.g. "Living Room"
}

interface DesignWindowTabsProps {
  tabs: WindowTabItem[];
  activeWindowId: string;
  onSelectTab: (id: string) => void;
  onAddWindow: () => void;
}

export const DesignWindowTabs: React.FC<DesignWindowTabsProps> = ({
  tabs,
  activeWindowId,
  onSelectTab,
  onAddWindow,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto select-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeWindowId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`px-4 py-1.5 rounded-xl text-left transition-all border shrink-0 ${
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
              <span className="text-[10px] text-slate-400 font-medium">
                {tab.name || 'Room'}
              </span>
            </div>
          </button>
        );
      })}

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
