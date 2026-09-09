'use client';

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export const TopNav: React.FC = () => {
  const { projects } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredProjects = query.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.id.toLowerCase().includes(query.toLowerCase()) ||
          p.customer.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.quotation?.id || '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input matching Screenshot 1: "Search quotations, customers, projects..." */}
      <div className="relative w-96 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotations, customers, projects..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Search Dropdown */}
        {showResults && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Matching Records ({filteredProjects.length})
            </div>
            {filteredProjects.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">
                No matching projects or quotations found.
              </div>
            ) : (
              filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setShowResults(false);
                    setQuery('');
                    router.push(`/projects/${p.id}`);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#0A2E8A]">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.quotation?.id || p.id} • {p.customer.name}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0A2E8A]">
                    ₹{(p.estimatedValue / 100000).toFixed(1)}L
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Icons matching Screenshot 1: Bell, Help, GST Active pill */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Help Circle */}
        <button
          title="Support & Guides"
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* GST Active Pill matching Screenshot 1 */}
        <div className="px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>GST Active</span>
        </div>
      </div>
    </header>
  );
};
